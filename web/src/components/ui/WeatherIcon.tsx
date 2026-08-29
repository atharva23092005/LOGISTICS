import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  CloudFog,
  Thermometer,
  type LucideProps
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface WeatherIconProps extends LucideProps {
  condition?: string
}

export function WeatherIcon({ condition = '', className, ...props }: WeatherIconProps) {
  const normalized = condition.toLowerCase().trim()

  if (normalized.includes('clear') || normalized.includes('sun')) {
    return <Sun className={cn('text-amber-400', className)} {...props} />
  }
  if (normalized.includes('storm') || normalized.includes('thunder') || normalized.includes('lightning')) {
    return <CloudLightning className={cn('text-amber-300', className)} {...props} />
  }
  if (normalized.includes('heavy') || normalized.includes('torrential') || normalized.includes('monsoon')) {
    return <CloudLightning className={cn('text-blue-400', className)} {...props} />
  }
  if (normalized.includes('rain') || normalized.includes('drizzle') || normalized.includes('shower')) {
    return <CloudRain className={cn('text-sky-400', className)} {...props} />
  }
  if (normalized.includes('fog') || normalized.includes('mist') || normalized.includes('haze')) {
    return <CloudFog className={cn('text-slate-400', className)} {...props} />
  }
  if (normalized.includes('wind') || normalized.includes('gale')) {
    return <Wind className={cn('text-teal-400', className)} {...props} />
  }
  if (normalized.includes('cloud') || normalized.includes('overcast')) {
    return <Cloud className={cn('text-slate-300', className)} {...props} />
  }

  return <Thermometer className={cn('text-primary', className)} {...props} />
}
