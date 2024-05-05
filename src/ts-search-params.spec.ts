import { expect, test } from 'vitest'
import { TSSearchParams } from './ts-search-params'

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
