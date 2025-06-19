import { describe, expect, it } from 'vitest'
import z from 'zod'
import {
  createPasswordConfirmationRefine,
  emailSchema,
  nameSchema,
  passwordSchema,
  requiredStringSchema,
} from '../common-schemas'

describe('common-schemas', () => {
  describe('requiredStringSchema', () => {
    it('有効な文字列を受け入れる', () => {
      const validString = 'test'
      expect(() => requiredStringSchema.parse(validString)).not.toThrow()
      expect(requiredStringSchema.parse(validString)).toBe(validString)
    })

    it('空文字列を拒否する', () => {
      expect(() => requiredStringSchema.parse('')).toThrow()
    })

    it('空白のみの文字列を拒否する', () => {
      expect(() => requiredStringSchema.parse('   ')).toThrow()
    })

    it('nullやundefinedを拒否する', () => {
      expect(() => requiredStringSchema.parse(null)).toThrow()
      expect(() => requiredStringSchema.parse(undefined)).toThrow()
    })

    it('数値型を拒否する', () => {
      expect(() => requiredStringSchema.parse(123)).toThrow()
    })
  })

  describe('emailSchema', () => {
    it('有効なメールアドレスを受け入れる', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.jp',
        'test+tag@example.org',
      ]

      for (const email of validEmails) {
        expect(() => emailSchema.parse(email)).not.toThrow()
        expect(emailSchema.parse(email)).toBe(email)
      }
    })

    it('無効なメールアドレスを拒否する', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@.com',
      ]

      for (const email of invalidEmails) {
        expect(() => emailSchema.parse(email)).toThrow()
      }
    })

    it('空文字列を拒否する', () => {
      expect(() => emailSchema.parse('')).toThrow()
    })

    it('100文字を超えるメールアドレスを拒否する', () => {
      const longEmail = `${'a'.repeat(90)}@example.com` // 101文字
      expect(() => emailSchema.parse(longEmail)).toThrow()
    })

    it('100文字以下のメールアドレスを受け入れる', () => {
      const validLongEmail = `${'a'.repeat(85)}@example.com` // 97文字
      expect(() => emailSchema.parse(validLongEmail)).not.toThrow()
    })
  })

  describe('passwordSchema', () => {
    it('有効なパスワードを受け入れる', () => {
      const validPasswords = [
        'password123',
        'mySecurePass',
        'abcdefgh',
        'P@ssw0rd!',
      ]

      for (const password of validPasswords) {
        expect(() => passwordSchema.parse(password)).not.toThrow()
        expect(passwordSchema.parse(password)).toBe(password)
      }
    })

    it('8文字未満のパスワードを拒否する', () => {
      const shortPasswords = ['1234567', 'short', 'abc']

      for (const password of shortPasswords) {
        expect(() => passwordSchema.parse(password)).toThrow()
      }
    })

    it('100文字を超えるパスワードを拒否する', () => {
      const longPassword = 'a'.repeat(101)
      expect(() => passwordSchema.parse(longPassword)).toThrow()
    })

    it('空文字列を拒否する', () => {
      expect(() => passwordSchema.parse('')).toThrow()
    })

    it('100文字ちょうどのパスワードを受け入れる', () => {
      const maxLengthPassword = 'a'.repeat(100)
      expect(() => passwordSchema.parse(maxLengthPassword)).not.toThrow()
    })
  })

  describe('nameSchema', () => {
    it('有効な名前を受け入れる', () => {
      const validNames = ['田中太郎', 'John Doe', 'Alice', '山田花子']

      for (const name of validNames) {
        expect(() => nameSchema.parse(name)).not.toThrow()
        expect(nameSchema.parse(name)).toBe(name)
      }
    })

    it('50文字を超える名前を拒否する', () => {
      const longName = 'あ'.repeat(51)
      expect(() => nameSchema.parse(longName)).toThrow()
    })

    it('空文字列を拒否する', () => {
      expect(() => nameSchema.parse('')).toThrow()
    })

    it('50文字ちょうどの名前を受け入れる', () => {
      const maxLengthName = 'あ'.repeat(50)
      expect(() => nameSchema.parse(maxLengthName)).not.toThrow()
    })

    describe('createPasswordConfirmationRefine', () => {
      const testSchema = z.object({
        password: z.string(),
        confirmPassword: z.string(),
        email: z.string().email(),
      })

      const refinedSchema = createPasswordConfirmationRefine(testSchema)

      it('パスワードと確認用パスワードが一致する場合に成功する', () => {
        const validData = {
          password: 'password123',
          confirmPassword: 'password123',
          email: 'test@example.com',
        }

        expect(() => refinedSchema.parse(validData)).not.toThrow()
        expect(refinedSchema.parse(validData)).toEqual(validData)
      })

      it('パスワードと確認用パスワードが一致しない場合にエラーを返す', () => {
        const invalidData = {
          password: 'password123',
          confirmPassword: 'differentPassword',
          email: 'test@example.com',
        }

        try {
          refinedSchema.parse(invalidData)
          expect.fail('エラーが発生するべきです')
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError)
          const zodError = error as z.ZodError
          expect(zodError.issues).toHaveLength(1)
          expect(zodError.issues[0].path).toEqual(['confirmPassword'])
          expect(zodError.issues[0].message).toBe(
            'パスワードと確認用パスワードが一致しません',
          )
        }
      })

      it('他のフィールドのバリデーションエラーも適切に処理する', () => {
        const invalidData = {
          password: 'password123',
          confirmPassword: 'password123',
          email: 'invalid-email',
        }

        try {
          refinedSchema.parse(invalidData)
          expect.fail('エラーが発生するべきです')
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError)
          const zodError = error as z.ZodError
          expect(
            zodError.issues.some((issue) => issue.path.includes('email')),
          ).toBe(true)
        }
      })

      it('複数のエラーがある場合に両方のエラーを報告する', () => {
        const invalidData = {
          password: 'password123',
          confirmPassword: 'differentPassword',
          email: 'invalid-email',
        }

        try {
          refinedSchema.parse(invalidData)
          expect.fail('エラーが発生するべきです')
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError)
          const zodError = error as z.ZodError
          expect(zodError.issues.length).toBeGreaterThan(1)
          expect(
            zodError.issues.some((issue) => issue.path.includes('email')),
          ).toBe(true)
          expect(
            zodError.issues.some((issue) =>
              issue.path.includes('confirmPassword'),
            ),
          ).toBe(true)
        }
      })
    })
  })
})
