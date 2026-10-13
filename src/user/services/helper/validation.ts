import { z } from 'zod'
import { ErrorModel } from '../interface/interface'
import i18n from '../../config/localization/i18n'

const t = (key: string) => i18n.t(key)

export const signUpSchema = () =>
  z
    .object({
      firstName: z.string().min(1, t('signUp.firstNameRequired')),
      lastName: z.string().min(1, t('signUp.lastNameRequired')),
      email: z.string().min(1, t('signUp.emailRequired')).email(t('signUp.emailInvalid')),
      phone: z
        .string()
        .min(1, t('signUp.phoneRequired'))
        .regex(/^\+?[\d\s\-()]{10,15}$/, t('signUp.phoneInvalid')),
      password: z
        .string()
        .min(1, t('signUp.passwordRequired'))
        .min(8, t('signUp.passwordMin')),
      confirmPassword: z.string().min(1, t('signUp.confirmPasswordRequired')),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('signUp.passwordMismatch'),
      path: ['confirmPassword'],
    })

export const loginSchema = () =>
  z.object({
    email: z.string().min(1, t('login.emailRequired')).email(t('login.emailInvalid')),
    password: z.string().min(1, t('login.passwordRequired')),
  })

export const forgotPasswordSchema = () =>
  z.object({
    email: z.string().min(1, t('signUp.emailRequired')).email(t('signUp.emailInvalid')),
  })

export const resetPasswordSchema = () =>
  z
    .object({
      password: z
        .string()
        .min(1, t('signUp.passwordRequired'))
        .min(8, t('signUp.passwordMin')),
      confirmPassword: z.string().min(1, t('signUp.confirmPasswordRequired')),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('signUp.passwordMismatch'),
      path: ['confirmPassword'],
    })

export const otpSchema = () =>
  z.object({
    otp: z.string().min(4, t('common.otpRequired')),
  })

export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: ErrorModel } => {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors: ErrorModel = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as string
    if (!errors[key]) {
      errors[key] = issue.message
    }
  }
  return { success: false, errors }
}
