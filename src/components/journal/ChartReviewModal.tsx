'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Save, MousePointer2, Square, PenTool, Type, Loader2, Maximize2, Image as ImageIcon } from 'lucide-react'
import { Trade } from '@/types'
import { toast } from 'sonner'
import { Stage, Layer, Image as KonvaImage, Rect, Line, Text } from 'react-konva'
import useImage from 'use-image'

interface Props {
  trade: Trade
  onClose: () => void
  onSuccess: () => void
}

export function ChartReviewModal({ trade, onClose, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('before')
  const imageUrl = activeTab === 'before' ? trade.screenshotUrl : trade.screenshotAfterUrl
  const [image] = useImage(imageUrl || '')

  const [tool, setTool] = useState<'cursor' | 'rect' | 'pen' | 'text'>('cursor')
  const [elements, setElements] = useState<any[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load existing markup
  useEffect(() => {
    if (trade.markupData) {
      try {
        const parsed = JSON.parse(trade.markupData)
        setElements(parsed[activeTab] || [])
      } catch (e) {
        console.error('Failed to parse markup data')
      }
    } else {
      setElements([])
    }
  }, [trade.markupData, activeTab])

  const handleMouseDown = (e: any) => {
    if (tool === 'cursor') return
    const pos = e.target.getStage().getPointerPosition()
    setIsDrawing(true)

    if (tool === 'pen') {
      setElements([...elements, { type: 'line', points: [pos.x, pos.y], stroke: '#0ea5e9', strokeWidth: 3 }])
    } else if (tool === 'rect') {
      setElements([...elements, { type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0, stroke: '#8b5cf6', strokeWidth: 3, fill: 'rgba(139,92,246,0.2)' }])
    } else if (tool === 'text') {
      const text = window.prompt('Masukkan teks:')
      if (text) {
        setElements([...elements, { type: 'text', x: pos.x, y: pos.y, text, fontSize: 20, fill: '#facc15' }])
      }
      setIsDrawing(false)
    }
  }

  const handleMouseMove = (e: any) => {
    if (!isDrawing || tool === 'cursor' || tool === 'text') return
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    let lastElement = elements[elements.length - 1]

    if (tool === 'pen') {
      lastElement.points = lastElement.points.concat([point.x, point.y])
    } else if (tool === 'rect') {
      lastElement.width = point.x - lastElement.x
      lastElement.height = point.y - lastElement.y
    }
    
    const newElements = elements.slice(0, elements.length - 1)
    newElements.push(lastElement)
    setElements(newElements)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      let currentData = {}
      if (trade.markupData) {
        try { currentData = JSON.parse(trade.markupData) } catch (e) {}
      }
      
      const newMarkupData = JSON.stringify({
        ...currentData,
        [activeTab]: elements
      })

      const res = await fetch(`/api/trades/${trade.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trade,
          markupData: newMarkupData
        })
      })

      if (res.ok) {
        toast.success('Anotasi berhasil disimpan')
        onSuccess()
      } else {
        toast.error('Gagal menyimpan anotasi')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl h-[90vh] flex flex-col glass-card rounded-2xl shadow-2xl border border-white/10 animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[hsl(222_47%_7%)]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Chart Review: {trade.pair} <span className="text-sm font-normal text-slate-400">({trade.direction})</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Anotasi
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"><X size={20} /></button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/5 bg-black/20 p-4 flex flex-col gap-6 overflow-y-auto">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tampilan Chart</h3>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setActiveTab('before')}
                  className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${activeTab === 'before' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-transparent'}`}
                >
                  Before Entry (Setup)
                </button>
                <button 
                  onClick={() => setActiveTab('after')}
                  className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${activeTab === 'after' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-transparent'}`}
                >
                  After Exit (Result)
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Markup Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTool('cursor')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${tool === 'cursor' ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}>
                  <MousePointer2 size={20} className="mb-1" /> <span className="text-[10px]">Select</span>
                </button>
                <button onClick={() => setTool('rect')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${tool === 'rect' ? 'bg-violet-500/20 border-violet-500/50 text-violet-400' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}>
                  <Square size={20} className="mb-1" /> <span className="text-[10px]">Zone</span>
                </button>
                <button onClick={() => setTool('pen')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${tool === 'pen' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}>
                  <PenTool size={20} className="mb-1" /> <span className="text-[10px]">Draw</span>
                </button>
                <button onClick={() => setTool('text')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${tool === 'text' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}>
                  <Type size={20} className="mb-1" /> <span className="text-[10px]">Text</span>
                </button>
              </div>
              <button onClick={() => setElements([])} className="w-full mt-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors">
                Clear All
              </button>
            </div>

            <div className="mt-auto">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trade Notes</h3>
              <p className="text-sm text-slate-300 p-3 bg-white/5 rounded-xl border border-white/5 italic">
                {trade.notes || 'Tidak ada catatan.'}
              </p>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-[hsl(222_47%_5%)] relative overflow-hidden flex items-center justify-center p-4">
            {!imageUrl ? (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon size={24} className="text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tidak ada screenshot</h3>
                <p className="text-slate-400">Anda belum mengunggah screenshot untuk tahap ini.</p>
              </div>
            ) : (
              <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
                <Stage
                  width={800} // Set fixed width/height for simplicity, or use resize observer in production
                  height={600}
                  onMouseDown={handleMouseDown}
                  onMousemove={handleMouseMove}
                  onMouseup={handleMouseUp}
                  className="w-full h-full flex items-center justify-center"
                >
                  <Layer>
                    {image && (
                      <KonvaImage 
                        image={image} 
                        width={800} 
                        height={600} 
                        // simple object-fit contain logic could be applied here
                      />
                    )}
                    {elements.map((el, i) => {
                      if (el.type === 'line') {
                        return <Line key={i} points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth} tension={0.5} lineCap="round" />
                      }
                      if (el.type === 'rect') {
                        return <Rect key={i} x={el.x} y={el.y} width={el.width} height={el.height} stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill} />
                      }
                      if (el.type === 'text') {
                        return <Text key={i} x={el.x} y={el.y} text={el.text} fontSize={el.fontSize} fill={el.fill} fontStyle="bold" />
                      }
                      return null
                    })}
                  </Layer>
                </Stage>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
