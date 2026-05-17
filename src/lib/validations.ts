import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
})

export const tradeSchema = z.object({
  pair: z.string().min(1, 'Pair wajib diisi').max(20),
  direction: z.enum(['BUY', 'SELL']),
  entryPrice: z.coerce.number().positive('Harus positif'),
  stopLoss: z.coerce.number().positive('Harus positif'),
  takeProfit: z.coerce.number().positive('Harus positif'),
  lotSize: z.coerce.number().positive('Harus positif').max(100),
  riskPercent: z.coerce.number().min(0.01).max(100),
  profitLoss: z.coerce.number(),
  rrRatio: z.coerce.number().min(0),
  session: z.enum(['LONDON', 'NEW_YORK', 'TOKYO', 'SYDNEY', 'OVERLAP']),
  emotion: z.enum(['CALM', 'FEAR', 'GREED', 'REVENGE', 'CONFIDENT', 'FOMO']),
  notes: z.string().max(1000).optional().nullable(),
  setup: z.string().max(100).optional().nullable(),
  setupGrade: z.enum(['A', 'B', 'C']).optional().nullable(),
  screenshotUrl: z.string().url().optional().nullable(),
  screenshotId: z.string().optional().nullable(),
  screenshotAfterUrl: z.string().url().optional().nullable(),
  screenshotAfterId: z.string().optional().nullable(),
  markupData: z.string().optional().nullable(),
  aiFeedback: z.string().optional().nullable(),
  tradeDate: z.string().min(1, 'Tanggal wajib diisi'),
  status: z.enum(['WIN', 'LOSS', 'BREAKEVEN']),
})

export const settingsSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  monthlyTarget: z.coerce.number().min(0).optional(),
  riskPreference: z.coerce.number().min(0.01).max(100).optional(),
  currency: z.string().optional(),
  theme: z.string().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TradeInput = z.infer<typeof tradeSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
