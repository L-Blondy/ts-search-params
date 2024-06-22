import { expect, test } from 'vitest'
import { TSSearchParams } from './ts-search-params'
import { SerializableObject } from './types'

test('`.toString()` should be encoded', () => {
   const qs1 = new TSSearchParams('a=b c d').toString()
   const qs2 = new TSSearchParams('a=%22b%20c%20d%22').toString()
   expect(qs1).toBe('a=%22b%20c%20d%22')
   expect(qs2).toBe('a=%22b%20c%20d%22')
})

test('`toString()` should use the return value of `validate`', () => {
   const qs1 = new TSSearchParams('a=b c d', {
      validate: () => ({ a: '1,2,3' }),
   }).toString()
   expect(qs1).toBe('a=%221%2C2%2C3%22')
})

test('`toString()` should return `?${string}` if `questionMark: true`', () => {
   const qs = new TSSearchParams('a="b"', { questionMark: true }).toString()
   expect(decodeURIComponent(qs)).toBe('?a="b"')
})

test('`toString()` should return `?${string}` if `questionMark: false`', () => {
   const qs = new TSSearchParams('a="b"', { questionMark: false }).toString()
   expect(decodeURIComponent(qs)).toBe('a="b"')
})

test('`toString()` should return `?${string}` if `questionMark: undefined`', () => {
   const qs = new TSSearchParams('a="b"', { questionMark: false }).toString()
   expect(decodeURIComponent(qs)).toBe('a="b"')
})

test('`toString()` should NOT include `undefined` values in objects', () => {
   const qs1 = new TSSearchParams()
      .assign({
         filters: { search: 'query', limit: undefined },
      })
      .toString()
   expect(decodeURIComponent(qs1)).toBe('filters={"search":"\\"query\\""}')
})

test('`toString()` should include `undefined` values in arrays', () => {
   const qs = new TSSearchParams()
      .assign({
         filters: ['a', undefined, 'z'],
      })
      .toString()
   expect(decodeURIComponent(qs)).toBe(
      'filters=["\\"a\\"","undefined","\\"z\\""]',
   )
})

test('`toObject()` should use the return value of `validate`', () => {
   const qs1 = new TSSearchParams('a=b c d', {
      validate: () => ({ a: '1,2,3' }),
   }).toObject()
   expect(qs1).toEqual({ a: '1,2,3' })
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
   ${{ a: 1, b: null, c: undefined, d: '', e: true, f: NaN } satisfies SerializableObject}
   ${{ a: [1, null, undefined, '', true] } satisfies SerializableObject}
   ${{ a: [{ a: 1, b: null, c: undefined, d: '', e: true }] } satisfies SerializableObject}
   ${{ a: [null, undefined, 1, true, false, 'string'] } satisfies SerializableObject}
   ${{ a: encodeURIComponent('["Château Lafite Rothschild"]'), b: '["Château Lafite Rothschild"]' } satisfies SerializableObject}
   ${{ a: encodeURIComponent('{b:"Château Lafite Rothschild"}'), b: '{b:["Château Lafite Rothschild"]}' } satisfies SerializableObject}
`('`output` should equal `input` (case %#)', ({ input }) => {
   const qs = new TSSearchParams().assign(input).toString()
   const output = new TSSearchParams(qs).toObject()
   expect(input).toEqual(output)
})

test.each`
   startWith                                                                                                            | assign                    | output
   ${{ a: 'bcd', x: 'xyz' } satisfies SerializableObject}                                                               | ${{ x: 'ooo' }}           | ${{ a: 'bcd', x: 'ooo' }}
   ${{ a: [{ b: '1', c: 1 }, { b: '2', c: 2 }], x: [{ y: '1', z: 1 }, { y: '2', z: 2 }] } satisfies SerializableObject} | ${{ x: [] }}              | ${{ a: [{ b: '1', c: 1 }, { b: '2', c: 2 }], x: [] }}
   ${{ filters: { a: [1, 2, 3], b: [4, 5, 6] }, search: 'abc' } satisfies SerializableObject}                           | ${{ search: 'abcde' }}    | ${{ filters: { a: [1, 2, 3], b: [4, 5, 6] }, search: 'abcde' }}
   ${{ filters: { a: [1, 2, 3], b: [4, 5, 6] }, search: 'abc' } satisfies SerializableObject}                           | ${{ filters: undefined }} | ${{ search: 'abc' }}
   ${{ filters: { a: [1, 2, 3], b: [4, 5, 6] }, search: 'abc' } satisfies SerializableObject}                           | ${{ search: undefined }}  | ${{ filters: { a: [1, 2, 3], b: [4, 5, 6] } }}
`('`Shallow merge (case %#)', ({ startWith, assign, output }) => {
   const qs = new TSSearchParams().assign(startWith).toString()
   const object = new TSSearchParams(qs).assign(assign).toObject()
   expect(object).toEqual(output)
})

test('Should work with standard qs', () => {
   const sp1 = new TSSearchParams(
      // @ts-expect-error URLSearchParams do not accept numbers
      new URLSearchParams({
         a: 'This is a string',
         b: 2,
      }).toString(),
   )
   expect(sp1.toObject()).toEqual({
      a: 'This is a string',
      b: 2,
   })
})
