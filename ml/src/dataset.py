"""
NERA Risk Model — Multimodal Dataset Builder (Tabular + 3D Sequence + Graph)
=============================================================================

Prepares the 3 distinct representations needed by the multimodal ensemble:
  1. Tabular DataFrame: 2D matrix for XGBoost
  2. 3D Sequence Tensor: shape (num_samples, 14_timesteps, num_temporal_feats) for LSTM
  3. Graph Data Structure: NetworkX / PyG (Node Features, Edge Index, Edge Attributes) for GNN
"""
import os
import json
from pathlib import Path
from typing import Tuple, Dict, Any, List
import numpy as np
import pandas as pd

def build_temporal_sequences(
    df: pd.DataFrame,
    seq_length: int = 14,
    feature_cols: List[str] = None
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Constructs 3D array (samples, timesteps, features) from temporal road/rainfall logs.
    Captures multi-day cumulative antecedent rainfall evolution.
    """
    if feature_cols is None:
        feature_cols = ["rainfall_24h", "rainfall_72h", "rainfall_anomaly", "monsoon_indicator"]

    # Group by road segment, order chronologically
    df_sorted = df.sort_values(by=["segment_id", "date"])
    
    sequences = []
    labels = []

    for seg_id, group in df_sorted.groupby("segment_id"):
        values = group[feature_cols].values
        target_vals = group["disruption_next_24h"].values if "disruption_next_24h" in group.columns else np.zeros(len(group))

        if len(group) >= seq_length:
            for i in range(len(group) - seq_length + 1):
                seq = values[i : i + seq_length]
                lbl = target_vals[i + seq_length - 1]
                sequences.append(seq)
                labels.append(lbl)

    if not sequences:
        # Fallback empty shape
        return np.empty((0, seq_length, len(feature_cols))), np.empty((0,))

    return np.array(sequences, dtype=np.float32), np.array(labels, dtype=np.float32)

def build_road_graph_data(segments_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Constructs graph adjacency matrix and node feature matrix representing NER road topology.
    Nodes = Intersections / Road Corridors
    Edges = Highway segments with physical attributes (length, highway rank)
    """
    nodes = []
    edges = []
    node_features = []
    edge_attributes = []

    seg_ids = segments_df["segment_id"].unique().tolist()
    seg_to_idx = {sid: i for i, sid in enumerate(seg_ids)}

    for idx, row in segments_df.iterrows():
        sid = row["segment_id"]
        # Node features: [Elevation, Slope, Historical Landslides]
        elev = float(row.get("elevation", 300.0))
        slope = float(row.get("slope", 12.0))
        hist = float(row.get("historical_landslide_count", 0))
        node_features.append([elev, slope, hist])

    # Connect adjacent segments within same state/highway
    for i in range(len(seg_ids)):
        # Link sequential segments along same highway
        if i + 1 < len(seg_ids):
            edges.append([i, i + 1])
            edges.append([i + 1, i])  # undirected
            edge_attributes.append([float(segments_df.iloc[i].get("road_length_m", 500.0)), 1.0])
            edge_attributes.append([float(segments_df.iloc[i].get("road_length_m", 500.0)), 1.0])

    return {
        "x": np.array(node_features, dtype=np.float32),
        "edge_index": np.array(edges, dtype=np.int64).T if edges else np.empty((2, 0), dtype=np.int64),
        "edge_attr": np.array(edge_attributes, dtype=np.float32) if edge_attributes else np.empty((0, 2), dtype=np.float32),
        "node_count": len(seg_ids),
        "edge_count": len(edges) // 2
    }
