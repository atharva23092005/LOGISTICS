"""
NER Logistics — Real-Data Pipeline: Provenance & Integrity Helpers
==================================================================

Shared utilities used by every download_*/ingest_* script so that the whole
pipeline mechanically obeys the user's no-fabrication / auditability rules:

  * RAW FILES ARE NEVER OVERWRITTEN  -> `guard_raw_path()` refuses to clobber.
  * ONE METADATA JSON PER DATASET    -> `write_metadata()` emits the required
    provenance record (source, url, download_date, coverage, license, checksum,
    processing_version, data_source_type, ...).
  * EVERY ARTIFACT CARRIES PROVENANCE-> `data_source_type` is a required field,
    validated against the confidence ladder in ner_config.
  * INTEGRITY IS VERIFIABLE          -> SHA-256 checksums on every raw file.

Nothing here invents data. These helpers only *record* where real bytes came
from and prove they were not tampered with.
"""
from __future__ import annotations

import hashlib
import json
import os
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any, Optional

from ner_config import (
    METADATA_DIR,
    RAW_DIR,
    DATA_SOURCE_TYPES,
    ensure_data_dirs,
)

PROCESSING_VERSION = "1.0.0"  # bump when the transform logic for a dataset changes


# ─────────────────────────────────────────────────────────────────────────────
# Checksums
# ─────────────────────────────────────────────────────────────────────────────
def sha256_file(path: str | os.PathLike, chunk_size: int = 1 << 20) -> str:
    """Streaming SHA-256 of a file (handles multi-GB downloads without RAM blowup)."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            h.update(chunk)
    return h.hexdigest()


# ─────────────────────────────────────────────────────────────────────────────
# Raw-file write guard  (immutability rule)
# ─────────────────────────────────────────────────────────────────────────────
class RawOverwriteError(RuntimeError):
    """Raised when a script would overwrite an existing raw download."""


def guard_raw_path(relative_path: str, *, allow_exists: bool = False) -> Path:
    """
    Resolve a path under data/raw/ and REFUSE to overwrite an existing file
    (unless allow_exists=True, e.g. to resume an idempotent re-verify).

    Returns the absolute Path to write to (parent dirs created).
    """
    ensure_data_dirs()
    target = (RAW_DIR / relative_path).resolve()
    # containment check — never escape data/raw/
    if RAW_DIR.resolve() not in target.parents and target != RAW_DIR.resolve():
        raise ValueError(f"Refusing raw path outside data/raw/: {target}")
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and not allow_exists:
        raise RawOverwriteError(
            f"Raw file already exists and would be overwritten: {target}\n"
            f"Raw downloads are immutable. Delete it manually to re-fetch, or pass allow_exists=True."
        )
    return target


# ─────────────────────────────────────────────────────────────────────────────
# Provenance metadata record
# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class DatasetMetadata:
    """
    One provenance record per acquired dataset. Serialized to
    data/metadata/<dataset_id>.json. Mirrors exactly the fields the user
    required, plus a few for auditability.
    """
    dataset_id: str
    title: str
    data_source_type: str          # must be in DATA_SOURCE_TYPES
    source_org: str
    source_url: str
    license: str
    coverage_region: str           # e.g. "NER (8 states)"
    ner_coverage: str              # "full" | "partial" | "none" | free text
    date_range: str                # temporal coverage of the DATA
    spatial_resolution: str
    file_format: str
    download_method: str           # "direct" | "api" | "manual-portal" | ...
    # populated after the bytes land:
    download_date: Optional[str] = None      # ISO8601 (caller passes; scripts get it at runtime)
    raw_files: list[dict[str, Any]] = field(default_factory=list)  # [{path, bytes, sha256}]
    columns: list[str] = field(default_factory=list)
    ml_use: str = ""
    reliability: str = ""
    limitations: str = ""
    verified: bool = False         # True only when a live check confirmed reachability
    verification_notes: str = ""
    processing_version: str = PROCESSING_VERSION
    extra: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.data_source_type not in DATA_SOURCE_TYPES:
            raise ValueError(
                f"data_source_type={self.data_source_type!r} not in {DATA_SOURCE_TYPES}. "
                f"Every dataset must be tagged on the confidence ladder."
            )

    def add_raw_file(self, path: str | os.PathLike) -> None:
        p = Path(path)
        self.raw_files.append(
            {"path": str(p), "bytes": p.stat().st_size, "sha256": sha256_file(p)}
        )

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2, ensure_ascii=False)


def write_metadata(meta: DatasetMetadata) -> Path:
    """Persist a DatasetMetadata to data/metadata/<dataset_id>.json and return the path."""
    ensure_data_dirs()
    out = METADATA_DIR / f"{meta.dataset_id}.json"
    out.write_text(meta.to_json(), encoding="utf-8")
    return out


def load_metadata(dataset_id: str) -> dict[str, Any]:
    out = METADATA_DIR / f"{dataset_id}.json"
    return json.loads(out.read_text(encoding="utf-8"))


if __name__ == "__main__":
    # self-test: dataclass validation + checksum on this very file
    ensure_data_dirs()
    m = DatasetMetadata(
        dataset_id="_selftest",
        title="Provenance helper self-test",
        data_source_type="DERIVED",
        source_org="pipeline",
        source_url="n/a",
        license="n/a",
        coverage_region="NER (8 states)",
        ner_coverage="none",
        date_range="n/a",
        spatial_resolution="n/a",
        file_format="n/a",
        download_method="n/a",
        verified=False,
    )
    print("checksum(self):", sha256_file(__file__)[:16], "...")
    print("metadata valid; ladder-checked. Sample keys:", list(json.loads(m.to_json()).keys())[:8])
    try:
        DatasetMetadata(
            dataset_id="_bad", title="x", data_source_type="MADE_UP",
            source_org="", source_url="", license="", coverage_region="",
            ner_coverage="", date_range="", spatial_resolution="",
            file_format="", download_method="",
        )
    except ValueError as e:
        print("ladder guard works:", str(e)[:60], "...")
