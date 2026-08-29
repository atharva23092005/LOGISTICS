import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Zap, Sparkles, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCTA() {
  const navigate = useNavigate()

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-[#0A101D] via-[#0D182A] to-[#060A12] relative overflow-hidden text-center border-t border-white/10">
      {/* Background Topo Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
          <Zap className="h-3.5 w-3.5" />
          <span>PRODUCTION-GRADE NER LOGISTICS INTELLIGENCE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Make NER Logistics Predictive.
        </h2>

        <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl mx-auto">
          From roads and weather to vehicles and field intelligence, bring the entire regional supply network
          into one unified operational picture.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="h-12 px-8 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xl shadow-primary/30 flex items-center gap-2"
          >
            <span>Enter Command Center</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/routes')}
            className="h-12 px-7 text-sm font-semibold rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white"
          >
            Explore Intelligence Platform
          </Button>
        </div>

        <div className="pt-6 flex items-center justify-center gap-2 text-2xs text-text-dim">
          <span className="status-dot status-dot-green flex-shrink-0 animate-status-pulse" />
          <span>Prototype Operational • 8 North East States Active</span>
        </div>

      </div>
    </section>
  )
}
