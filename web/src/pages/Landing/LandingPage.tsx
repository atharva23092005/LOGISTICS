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
    <div className="min-h-screen bg-[#060A14] text-text selection:bg-primary/30 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ── Sticky Top Navigation ── */}
      <LandingNavbar />

      {/* ── Main Landing Page Flow ── */}
      <main>
        {/* Hero Section & Live NER Map & Floating Copilot */}
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

        {/* Cinematic Closing CTA */}
        <FinalCTA />
      </main>

      {/* ── Enterprise Footer ── */}
      <LandingFooter />
    </div>
  )
}
