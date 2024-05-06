import { describe, expectTypeOf, test } from 'vitest'
import { TSSearchParams } from './ts-search-params'

test('`.assign()` serializable values should be legal', () => {
   const tssp = new TSSearchParams()
   tssp.assign({
      a: 1,
      b: null,
      c: undefined,
      d: true,
      e: '',
      f: Symbol(),
      g: [1, null, undefined, true, '', Symbol()],
      h: {
         a: 1,
         b: null,
         c: undefined,
         d: true,
         e: '',
         f: Symbol(),
         g: [1, null, undefined, true, '', Symbol()],
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
