'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { User, Lock, Settings as SettingsIcon, Loader2 } from 'lucide-react'
import { settingsSchema, changePasswordSchema, SettingsInput, ChangePasswordInput } from '@/lib/validations'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile')
  const [loading, setLoading] = useState(false)

  const { register: regProfile, handleSubmit: submitProfile, formState: { errors: errProfile } } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      name: session?.user?.name || '',
      currency: 'USD',
      theme: 'dark',
      monthlyTarget: 1000,
      riskPreference: 1,
    }
  })

  const { register: regPass, handleSubmit: submitPass, reset: resetPass, formState: { errors: errPass } } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onUpdateProfile = async (data: SettingsInput) => {
     setLoading(true)
     try {
        const res = await fetch('/api/user', {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ type: 'profile', ...data })
        })
        const result = await res.json()
        if (result.success) {
           toast.success('Profil berhasil diupdate')
           update({ name: data.name }) // Update next-auth session
        } else {
           toast.error(result.error || 'Gagal update profil')
        }
     } catch {
        toast.error('Terjadi kesalahan')
     } finally {
        setLoading(false)
     }
  }

  const onChangePassword = async (data: ChangePasswordInput) => {
     setLoading(true)
     try {
        const res = await fetch('/api/user', {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ type: 'password', ...data })
        })
        const result = await res.json()
        if (result.success) {
           toast.success('Password berhasil diubah')
           resetPass()
        } else {
           toast.error(result.error || 'Gagal mengubah password')
        }
     } catch {
        toast.error('Terjadi kesalahan')
     } finally {
        setLoading(false)
     }
  }

  const fieldClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-sm [&>option]:bg-slate-900 [&>option]:text-white"
  const labelClass = "block text-sm font-medium text-slate-300 mb-2"

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400 text-sm">Kelola profil dan preferensi akun kamu.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
         {/* Sidebar Tabs */}
         <div className="w-full md:w-64 space-y-1">
            {[
               { id: 'profile', label: 'Profil', icon: User },
               { id: 'password', label: 'Keamanan', icon: Lock },
               { id: 'preferences', label: 'Preferensi', icon: SettingsIcon },
            ].map(tab => {
               const Icon = tab.icon;
               return (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === tab.id 
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                     }`}
                  >
                     <Icon size={18} />
                     {tab.label}
                  </button>
               )
            })}
         </div>

         {/* Content Area */}
         <div className="flex-1 glass-card rounded-2xl p-6 lg:p-8 border border-white/10">
            {activeTab === 'profile' && (
               <div className="animate-fade-in">
                  <h2 className="text-lg font-bold text-white mb-6">Informasi Profil</h2>
                  <form onSubmit={submitProfile(onUpdateProfile)} className="space-y-5">
                     <div>
                        <label className={labelClass}>Nama Lengkap</label>
                        <input {...regProfile('name')} className={fieldClass} />
                        {errProfile.name && <p className="mt-1 text-xs text-red-400">{errProfile.name.message}</p>}
                     </div>
                     <div>
                        <label className={labelClass}>Email (Tidak bisa diubah)</label>
                        <input value={session?.user?.email || ''} disabled className={`${fieldClass} opacity-50 cursor-not-allowed`} />
                     </div>
                     <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-colors flex items-center gap-2">
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Simpan Perubahan
                     </button>
                  </form>
               </div>
            )}

            {activeTab === 'password' && (
               <div className="animate-fade-in">
                  <h2 className="text-lg font-bold text-white mb-6">Ubah Password</h2>
                  <form onSubmit={submitPass(onChangePassword)} className="space-y-5">
                     <div>
                        <label className={labelClass}>Password Saat Ini</label>
                        <input type="password" {...regPass('currentPassword')} className={fieldClass} />
                        {errPass.currentPassword && <p className="mt-1 text-xs text-red-400">{errPass.currentPassword.message}</p>}
                     </div>
                     <div>
                        <label className={labelClass}>Password Baru</label>
                        <input type="password" {...regPass('newPassword')} className={fieldClass} />
                        {errPass.newPassword && <p className="mt-1 text-xs text-red-400">{errPass.newPassword.message}</p>}
                     </div>
                     <div>
                        <label className={labelClass}>Konfirmasi Password Baru</label>
                        <input type="password" {...regPass('confirmPassword')} className={fieldClass} />
                        {errPass.confirmPassword && <p className="mt-1 text-xs text-red-400">{errPass.confirmPassword.message}</p>}
                     </div>
                     <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-colors flex items-center gap-2">
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Update Password
                     </button>
                  </form>
               </div>
            )}

            {activeTab === 'preferences' && (
               <div className="animate-fade-in">
                  <h2 className="text-lg font-bold text-white mb-6">Preferensi Trading</h2>
                  <form onSubmit={submitProfile(onUpdateProfile)} className="space-y-5">
                     <div>
                        <label className={labelClass}>Mata Uang Utama</label>
                        <select {...regProfile('currency')} className={fieldClass}>
                           <option value="USD">USD ($)</option>
                           <option value="IDR">IDR (Rp)</option>
                        </select>
                     </div>
                     <div>
                        <label className={labelClass}>Target Profit Bulanan</label>
                        <input type="number" {...regProfile('monthlyTarget')} className={fieldClass} />
                     </div>
                     <div>
                        <label className={labelClass}>Risiko per Trade (%)</label>
                        <input type="number" step="0.1" {...regProfile('riskPreference')} className={fieldClass} />
                     </div>
                     <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-colors flex items-center gap-2">
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Simpan Preferensi
                     </button>
                  </form>
               </div>
            )}
         </div>
      </div>
    </div>
  )
}
