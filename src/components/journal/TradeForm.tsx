'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X, Loader2, Upload, Trash2 } from 'lucide-react'
import { tradeSchema, TradeInput } from '@/lib/validations'
import { Trade } from '@/types'
import { TRADING_PAIRS, SESSION_LABELS, EMOTION_LABELS } from '@/utils/formatters'
import { cn } from '@/lib/utils'

interface Props {
  trade?: Trade | null
  onClose: () => void
  onSuccess: () => void
}

export function TradeForm({ trade, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingBefore, setUploadingBefore] = useState(false)
  const [uploadingAfter, setUploadingAfter] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState(trade?.screenshotUrl ?? '')
  const [screenshotId, setScreenshotId] = useState(trade?.screenshotId ?? '')
  const [screenshotAfterUrl, setScreenshotAfterUrl] = useState(trade?.screenshotAfterUrl ?? '')
  const [screenshotAfterId, setScreenshotAfterId] = useState(trade?.screenshotAfterId ?? '')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TradeInput>({
    resolver: zodResolver(tradeSchema) as any,
    defaultValues: trade ? {
      ...trade,
      tradeDate: new Date(trade.tradeDate).toISOString().split('T')[0],
    } : {
      direction: 'BUY',
      session: 'LONDON',
      emotion: 'CALM',
      status: 'WIN',
      riskPercent: 1,
      rrRatio: 2,
      tradeDate: new Date().toISOString().split('T')[0],
    },
  })

  const profitLoss = watch('profitLoss')
  const entryPrice = watch('entryPrice')
  const stopLoss = watch('stopLoss')
  const takeProfit = watch('takeProfit')

  useEffect(() => {
    if (profitLoss !== undefined && profitLoss !== null) {
      const status = profitLoss > 0 ? 'WIN' : profitLoss < 0 ? 'LOSS' : 'BREAKEVEN'
      setValue('status', status)
    }
  }, [profitLoss, setValue])

  // Auto calculate R:R Ratio
  useEffect(() => {
    if (entryPrice && stopLoss && takeProfit) {
      const entry = Number(entryPrice)
      const sl = Number(stopLoss)
      const tp = Number(takeProfit)
      
      const risk = Math.abs(entry - sl)
      const reward = Math.abs(entry - tp)
      
      if (risk > 0 && !isNaN(risk) && !isNaN(reward)) {
        const rr = Number((reward / risk).toFixed(2))
        setValue('rrRatio', rr)
      }
    }
  }, [entryPrice, stopLoss, takeProfit, setValue])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0]
    if (!file) return
    if (type === 'before') setUploadingBefore(true)
    else setUploadingAfter(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        if (type === 'before') {
          setScreenshotUrl(data.url)
          setScreenshotId(data.publicId)
          setValue('screenshotUrl', data.url)
          setValue('screenshotId', data.publicId)
        } else {
          setScreenshotAfterUrl(data.url)
          setScreenshotAfterId(data.publicId)
          setValue('screenshotAfterUrl', data.url)
          setValue('screenshotAfterId', data.publicId)
        }
        toast.success('Screenshot berhasil diupload')
      } else toast.error(data.error || 'Upload gagal')
    } catch { toast.error('Upload gagal') }
    finally { 
      if (type === 'before') setUploadingBefore(false)
      else setUploadingAfter(false)
    }
  }

  const handleDeleteScreenshot = async (type: 'before' | 'after') => {
    const pubId = type === 'before' ? screenshotId : screenshotAfterId
    if (!pubId) return
    try {
      await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId: pubId }) })
      if (type === 'before') {
        setScreenshotUrl('')
        setScreenshotId('')
        setValue('screenshotUrl', null)
        setValue('screenshotId', null)
      } else {
        setScreenshotAfterUrl('')
        setScreenshotAfterId('')
        setValue('screenshotAfterUrl', null)
        setValue('screenshotAfterId', null)
      }
    } catch { toast.error('Gagal menghapus screenshot') }
  }

  const onSubmit = async (data: TradeInput) => {
    setIsLoading(true)
    try {
      const url = trade ? `/api/trades/${trade.id}` : '/api/trades'
      const method = trade ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const result = await res.json()
      if (result.success) {
        toast.success(trade ? 'Trade berhasil diupdate' : 'Trade berhasil ditambahkan')
        onSuccess()
      } else toast.error('Gagal menyimpan trade')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setIsLoading(false) }
  }

  const fieldClass = "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-sm [&>option]:bg-slate-900 [&>option]:text-white"
  const labelClass = "block text-xs font-medium text-slate-400 mb-1.5"
  const errorClass = "mt-1 text-xs text-red-400"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl shadow-2xl border border-white/10 animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[hsl(222_47%_7%)] rounded-t-2xl">
          <h2 className="text-base font-bold text-white">{trade ? 'Edit Trade' : 'Tambah Trade Baru'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Row 1: Pair, Direction, Date */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Pair *</label>
              <select {...register('pair')} className={fieldClass}>
                <option value="">Pilih pair</option>
                {TRADING_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.pair && <p className={errorClass}>{errors.pair.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Arah *</label>
              <select {...register('direction')} className={fieldClass}>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Tanggal *</label>
              <input type="date" {...register('tradeDate')} className={fieldClass} />
              {errors.tradeDate && <p className={errorClass}>{errors.tradeDate.message}</p>}
            </div>
          </div>

          {/* Row 2: Entry, SL, TP */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Entry Price *</label>
              <input type="number" step="0.00001" {...register('entryPrice')} className={fieldClass} placeholder="1.08500" />
              {errors.entryPrice && <p className={errorClass}>{errors.entryPrice.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Stop Loss *</label>
              <input type="number" step="0.00001" {...register('stopLoss')} className={fieldClass} placeholder="1.08000" />
              {errors.stopLoss && <p className={errorClass}>{errors.stopLoss.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Take Profit *</label>
              <input type="number" step="0.00001" {...register('takeProfit')} className={fieldClass} placeholder="1.09500" />
              {errors.takeProfit && <p className={errorClass}>{errors.takeProfit.message}</p>}
            </div>
          </div>

          {/* Row 3: Pair, Type, RR, P&L */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Lot Size *</label>
              <input type="number" step="0.01" {...register('lotSize')} className={fieldClass} placeholder="0.10" />
              {errors.lotSize && <p className={errorClass}>{errors.lotSize.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Risk % *</label>
              <input type="number" step="0.01" {...register('riskPercent')} className={fieldClass} placeholder="1.0" />
              {errors.riskPercent && <p className={errorClass}>{errors.riskPercent.message}</p>}
            </div>
            <div>
              <label className={labelClass}>R:R Ratio *</label>
              <input type="number" step="0.01" {...register('rrRatio')} className={fieldClass} placeholder="2.0" />
              {errors.rrRatio && <p className={errorClass}>{errors.rrRatio.message}</p>}
            </div>
            <div>
              <label className={labelClass}>P&L ($) *</label>
              <input type="number" step="0.01" {...register('profitLoss')} className={cn(fieldClass, profitLoss > 0 ? 'text-emerald-400' : profitLoss < 0 ? 'text-red-400' : '')} placeholder="+50.00" />
              {errors.profitLoss && <p className={errorClass}>{errors.profitLoss.message}</p>}
            </div>
          </div>

          {/* Row 4: Session, Emotion, Setup, Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Sesi Trading *</label>
              <select {...register('session')} className={fieldClass}>
                {Object.entries(SESSION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Emosi *</label>
              <select {...register('emotion')} className={fieldClass}>
                {Object.entries(EMOTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Setup/Strategi</label>
              <input type="text" {...register('setup')} className={fieldClass} placeholder="BOS, Breakout..." />
              {errors.setup && <p className={errorClass}>{errors.setup.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select {...register('status')} className={fieldClass}>
                <option value="WIN">WIN</option>
                <option value="LOSS">LOSS</option>
                <option value="BREAKEVEN">BREAKEVEN</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes / Analisa</label>
            <textarea {...register('notes')} rows={3} className={cn(fieldClass, 'resize-none')} placeholder="Catatan setup, reason entry, pelajaran..." />
          </div>

          {/* Screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Before Entry (Setup)</label>
              {screenshotUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                  <img src={screenshotUrl} alt="Screenshot Before" className="w-full h-32 object-cover" />
                  <button type="button" onClick={() => handleDeleteScreenshot('before')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border border-dashed border-white/15 rounded-xl cursor-pointer hover:border-sky-500/40 hover:bg-sky-500/5 transition-all text-center p-2">
                  {uploadingBefore ? (
                    <><Loader2 size={20} className="animate-spin text-sky-400 mb-2" /><span className="text-xs text-slate-400">Uploading...</span></>
                  ) : (
                    <><Upload size={20} className="text-slate-500 mb-2" /><span className="text-xs text-slate-400">Upload Before Entry</span></>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'before')} disabled={uploadingBefore} />
                </label>
              )}
            </div>

            <div>
              <label className={labelClass}>After Exit (Result)</label>
              {screenshotAfterUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                  <img src={screenshotAfterUrl} alt="Screenshot After" className="w-full h-32 object-cover" />
                  <button type="button" onClick={() => handleDeleteScreenshot('after')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border border-dashed border-white/15 rounded-xl cursor-pointer hover:border-sky-500/40 hover:bg-sky-500/5 transition-all text-center p-2">
                  {uploadingAfter ? (
                    <><Loader2 size={20} className="animate-spin text-sky-400 mb-2" /><span className="text-xs text-slate-400">Uploading...</span></>
                  ) : (
                    <><Upload size={20} className="text-slate-500 mb-2" /><span className="text-xs text-slate-400">Upload After Exit</span></>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'after')} disabled={uploadingAfter} />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isLoading || uploadingBefore || uploadingAfter}
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : (trade ? 'Update Trade' : 'Simpan Trade')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
