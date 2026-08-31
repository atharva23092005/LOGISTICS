import { LandingNavbar } from './components/LandingNavbar'
import { HeroSection } from './components/HeroSection'
import { ImpactMetricsStrip } from './components/ImpactMetricsStrip'
import { ProblemSection } from './components/ProblemSection'
import { ReactiveVsPredictive } from './components/ReactiveVsPredictive'
import { CoreIntelligencePreview } from './components/CoreIntelligencePreview'
import { DisruptionPredictionSection } from './components/DisruptionPredictionSection'
import { RouteOptimizationSection } from './components/RouteOptimizationSection'
import { FleetIntelligenceSection } from './components/FleetIntelligenceSection'
import { OfflineFirstSection } from './components/OfflineFirstSection'
import { EmergencyResponseSection } from './components/EmergencyResponseSection'
import { OperationsCopilotSection } from './components/OperationsCopilotSection'
import { WhatIfSimulationSection } from './components/WhatIfSimulationSection'
import { ImpactPillarsSection } from './components/ImpactPillarsSection'
import { DataIntegrationSection } from './components/DataIntegrationSection'
import { SecurityTrustSection } from './components/SecurityTrustSection'
import { FinalCTA } from './components/FinalCTA'
import { LandingFooter } from './components/LandingFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#060A14] text-slate-900 dark:text-text selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-white font-sans antialiased overflow-x-hidden relative transition-colors duration-200">
      {/* ── Global Minimal Background Grid & Soft Mesh Layer ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Subtle Minimal Grid */}
        <div className="absolute inset-0 bg-tactical-grid opacity-70 dark:opacity-35" />
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-blue-500/5 dark:bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-0 w-[500px] h-[400px] bg-sky-500/5 dark:bg-cyan-500/5 rounded-full blur-[130px]" />
        <div className="absolute top-[65%] left-0 w-[600px] h-[450px] bg-indigo-500/5 dark:bg-emerald-500/5 rounded-full blur-[140px]" />
      </div>

      {/* ── Sticky Top Navigation with Theme Toggle ── */}
      <LandingNavbar />

      {/* ── Main Landing Page Flow ── */}
      <main className="relative z-10">
        {/* Hero Section & Minimal HUD */}
        <HeroSection />

        {/* Live Network Impact & Metrics Strip */}
        <ImpactMetricsStrip />

        {/* The Problem: Disruption Challenges in NER */}
        <ProblemSection />

        {/* Reactive vs Predictive Intelligence Comparison */}
        <ReactiveVsPredictive />

        {/* Core Intelligence Unified Platform Preview */}
        <CoreIntelligencePreview />

        {/* XGBoost Disruption & Landslide Risk Prediction */}
        <DisruptionPredictionSection />

        {/* Multi-Modal Terrain Route Optimization */}
        <RouteOptimizationSection />

        {/* Live Fleet Telemetry & Dynamic Detour */}
        <FleetIntelligenceSection />

        {/* Offline-First PWA Field Sync Architecture */}
        <OfflineFirstSection />

        {/* Emergency Disaster Response Escalation Mode */}
        <EmergencyResponseSection />

        {/* Operations Copilot Intelligence Assistant */}
        <OperationsCopilotSection />

        {/* What-If Corridor Failure Simulation Studio */}
        <WhatIfSimulationSection />

        {/* Strategic Impact Pillars */}
        <ImpactPillarsSection />

        {/* Multi-Source Ecosystem Data Integration */}
        <DataIntegrationSection />

        {/* Mission-Critical Security & Trust */}
        <SecurityTrustSection />

        {/* Minimal Closing CTA */}
        <FinalCTA />
      </main>

      {/* ── Enterprise Footer ── */}
      <LandingFooter />
    </div>
  )
}

