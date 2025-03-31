import { Cloud, Sun } from "lucide-react"

export function WeatherWidget() {
  // In a real app, you would fetch weather data from an API
  return (
    <div className="flex items-center gap-2 font-serif">
      <Sun className="h-5 w-5" />
      <span>72°F</span>
      <span className="text-gray-600">|</span>
      <Cloud className="h-5 w-5" />
      <span>Tomorrow: 68°F</span>
    </div>
  )
}

