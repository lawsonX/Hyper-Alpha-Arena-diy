import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, CandlestickData, Time, IChartApi, ISeriesApi, createSeriesMarkers } from 'lightweight-charts'
import { formatChartTime } from '../../lib/dateTime'

interface KlineData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
}

interface TriggerPoint {
  timestamp: number
  value: number
  price: number
}

interface SignalPreviewChartProps {
  klines: KlineData[]
  triggers: TriggerPoint[]
  timeWindow: string
}

export default function SignalPreviewChart({ klines, triggers, timeWindow }: SignalPreviewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current || klines.length === 0) return

    // Create chart with larger height for better visibility
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#1a1a2e' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#2d2d44' },
        horzLines: { color: '#2d2d44' },
      },
      crosshair: {
        mode: 1,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2d2d44',
        barSpacing: 9,
        rightBarStaysOnScroll: false,
      },
      rightPriceScale: {
        borderColor: '#2d2d44',
      },
    })

    chartRef.current = chart

    // Add candlestick series (v5 API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    seriesRef.current = candlestickSeries

    // Convert klines to chart format with local timezone
    const chartData: CandlestickData<Time>[] = klines.map(k => ({
      time: formatChartTime(k.timestamp / 1000) as Time,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
    }))

    candlestickSeries.setData(chartData)

    // Add trigger markers using arrowDown shape with lightning emoji
    // The arrowDown shape points to the bar, making it clearer where triggers occurred
    if (triggers.length > 0) {
      const markers = triggers.map(t => ({
        time: formatChartTime(t.timestamp / 1000) as Time,
        position: 'aboveBar' as const,
        color: '#F8CD74',
        shape: 'arrowDown' as const,
        text: '⚡',
        size: 2,
      }))
      createSeriesMarkers(candlestickSeries, markers)
    }

    // Scroll to show the most recent data (keeps barSpacing intact)
    chart.timeScale().scrollToRealTime()

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [klines, triggers])

  return <div ref={chartContainerRef} className="w-full h-[500px]" />
}
