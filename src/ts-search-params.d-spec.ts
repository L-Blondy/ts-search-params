/* eslint-disable no-template-curly-in-string */
import { expectTypeOf, test } from 'vitest'
import { TSSearchParams } from './ts-search-params'

test('`.assign()` serializable values should be legal', () => {
   const tssp = new TSSearchParams()
   tssp.assign({
      a: 1,
      b: null,
      c: undefined,
      d: true,
      e: '',
      f: [1, null, undefined, true, ''],
      g: {
         a: 1,
         b: null,
         c: undefined,
         d: true,
         e: '',
         f: [1, null, undefined, true, ''],
      },
   })
})

test('`.assign()` non serializable values should be illegal', () => {
   const tssp = new TSSearchParams()
   // @ts-expect-error Date is not serializable in a revivable way
   tssp.assign({ a: new Date() })
})

test('`.assign()` should allow only <T>', () => {
   const tssp = new TSSearchParams<{ a: number }>()
   tssp.assign({ a: 1 })
   // @ts-expect-error only { a: number } is legal
   tssp.assign({ a: '1' })
   // @ts-expect-error only { a: number } is legal
   tssp.assign({ a: 1, b: '1' })
})

test('`.assign()` possibile values should be limited by the `validate` function', () => {
   const tssp = new TSSearchParams('', {
      validate: () => ({
         a: 1,
         b: '',
         c: [1, null],
         d: [{ a: 1 }],
      }),
   })

   tssp.assign({ a: 1 })
   tssp.assign({ c: [null, 5] })
   tssp.assign({ d: [{ a: 9 }] })
   // @ts-expect-error expect number
   tssp.assign({ a: '1' })
   // @ts-expect-error illegal property
   tssp.assign({ e: '1' })
})

test('`toString()` should return `?${string}` if `questionMark: true`', () => {
   const qs = new TSSearchParams('', { questionMark: true }).toString()
   expectTypeOf(qs).toEqualTypeOf<`?${string}`>()
})

test('`toString()` should return `?${string}` if `questionMark: false`', () => {
   const qs = new TSSearchParams('', { questionMark: false }).toString()
   expectTypeOf(qs).toEqualTypeOf<string>()
})

test('`toString()` should return `?${string}` if `questionMark: undefined`', () => {
   const qs = new TSSearchParams('').toString()
   expectTypeOf(qs).toEqualTypeOf<string>()
})
