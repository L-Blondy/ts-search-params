import { expect, test } from 'vitest'
import { TSSearchParams } from './ts-search-params'
import { SerializableObject } from './types'

test('`.toString()` should be encoded', () => {
   const qs1 = new TSSearchParams('a=b c d').toString()
   const qs2 = new TSSearchParams('a=%22b%20c%20d%22').toString()
   expect(qs1).toBe('a=%22b%20c%20d%22')
   expect(qs2).toBe('a=%22b%20c%20d%22')
})

test('`.get()` should be decoded', () => {
   const sp1 = new TSSearchParams('a=b c d')
   const sp2 = new TSSearchParams('a=%22b%20c%20d%22')
   expect(sp1.get('a')).toBe('b c d')
   expect(sp2.get('a')).toBe('b c d')
})

test.each`
   input
   ${{}}
   ${{ a: 1, b: null, c: undefined, d: '', e: true } satisfies SerializableObject}
   ${{ a: [1, null, undefined, '', true] } satisfies SerializableObject}
   ${{ a: [{ a: 1, b: null, c: undefined, d: '', e: true }] } satisfies SerializableObject}
   ${{ a: encodeURIComponent('["Château Lafite Rothschild"]'), b: '["Château Lafite Rothschild"]' } satisfies SerializableObject}
   ${{ a: encodeURIComponent('{b:"Château Lafite Rothschild"}'), b: '{b:["Château Lafite Rothschild"]}' } satisfies SerializableObject}
`('the output should be equal to the `input`', ({ input }) => {
   const qs = new TSSearchParams().assign(input).toString()
   const output = new TSSearchParams(qs).toObject()
   expect(input).toEqual(output)
})
