import { z } from 'zod'

/**
 * 汎用的なバリデーションスキーマの集約ファイル
 * 再利用可能なスキーマコンポーネントを提供します
 */

// 汎用的な文字列のスキーマ
export const requiredStringSchema = z
  .string()
  .trim()
  .min(1, { message: 'この項目は必須です' })

// メールアドレス関連のスキーマ
export const emailSchema = requiredStringSchema
  .max(100, { message: 'メールアドレスは100文字以下で入力してください' })
  .email({ message: '有効なメールアドレスを入力してください' })

// パスワード関連のスキーマ
export const passwordSchema = requiredStringSchema
  .min(8, { message: 'パスワードは8文字以上で入力してください' })
  .max(100, { message: 'パスワードは100文字以下で入力してください' })

// 名前関連のスキーマ
export const nameSchema = requiredStringSchema.max(50, {
  message: '名前は50文字以下で入力してください',
})

// パスワード確認用のrefineヘルパー関数
export function createPasswordConfirmationRefine<
  T extends { password: string; confirmPassword: string },
>(schema: z.ZodType<T>) {
  return schema.refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードと確認用パスワードが一致しません',
    path: ['confirmPassword'],
  })
}
