"""
NER Logistics — Python Microservice
Provides:
  1. OSRM wrapper  — route geometry, nearest-road snapping, map matching
  2. Copilot API   — AI chatbot with tool-calling against live application data
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.routes import osrm, copilot, ml

app = FastAPI(
    title="NER Logistics Python Service",
    description="OSRM routing + ML Disruption Ensemble + OR-Tools VRP + AI Operations Copilot",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(osrm.router,    prefix="/osrm",    tags=["OSRM"])
app.include_router(ml.router,      prefix="/ml",      tags=["ML & Routing"])
app.include_router(copilot.router, prefix="/copilot", tags=["Copilot"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "ner-python-service", "version": "1.0.0"}
