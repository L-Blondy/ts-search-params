import { SerializableArray, SerializableObject } from './types'

type Options<T extends SerializableObject, Q extends boolean> = {
   validate?: (searchParamsObject: Record<string, unknown>) => T
   questionMark?: Q
}

export class TSSearchParams<
   T extends SerializableObject,
   Q extends boolean = false,
> {
   #value: T
   #options: Required<Options<T, Q>>

   constructor(
      init?: string | URLSearchParams | undefined,
      options: Options<T, Q> = {},
   ) {
      const searchParams =
         !init || typeof init === 'string' ? new URLSearchParams(init) : init
      const value = {} as T
      for (let [_k, val] of searchParams.entries()) {
         value[_k as keyof T] = parse(val) as any
      }
      this.#value = value
      this.#options = {
         validate: options.validate || (() => this.#value),
         questionMark: options.questionMark || (false as Q),
      }
   }

   #validated() {
      return this.#options.validate(this.#value)
   }

   assign(partial: Partial<T>) {
      Object.assign(this.#value, partial)
      return this
   }

   toString(): Q extends true ? `?${string}` : string {
      const qs = Object.entries(this.#validated()).reduce((qs, [_k, _v]) => {
         // remove undefined at the top level
         if (_v === undefined) return qs
         const prefix = qs.length ? '&' : ''
         const key = encodeURIComponent(_k)
         const value = stringify(_v)
         return qs + `${prefix}${key}=${value}`
      }, '')
      return (this.#options.questionMark ? `?${qs}` : qs) as Q extends true
         ? `?${string}`
         : string
   }

   toObject() {
      return this.#validated()
   }

   get<K extends keyof T>(key: K): T[K] {
      return this.#validated()[key]
   }
}

function parse(val: string): any {
   if (isSurroundedBy(val, '{', '}') || isSurroundedBy(val, '[', ']')) {
      return JSON.parse(val, (_, val) => {
         return typeof val === 'string' ? parse(val) : val
      })
   }
   if (isSurroundedBy(val, '"')) {
      return val.slice(1, -1)
   }
   if (val === 'true' || val === 'false') {
      return val === 'true'
   }
   if (val === 'null') {
      return null
   }
   if (val === 'NaN') {
      return NaN
   }
   if (val === 'undefined') {
      return undefined
   }
   if (!isNaN(+val) && (+val).toString() === val) {
      return +val
   }
   return val
}

function stringify(val: any) {
   if (isObjectOrArray(val)) {
      let scope: any
      return encodeURIComponent(
         JSON.stringify(val, (_, value) => {
            if (isObjectOrArray(value)) {
               scope = value
               return value
            }
            if (typeof value === 'string') {
               return `"${value}"`
               // remove undefined from objects
            } else if (typeof value === 'undefined' && !Array.isArray(scope)) {
               return undefined
            } else {
               return String(value)
            }
         }),
      )
   }
   // top level empty string values result in `value=` as they go through this case
   if (val && typeof val === 'string') {
      return encodeURIComponent(`"${val}"`)
   }
   return String(val)
}

function isSurroundedBy(str: string, start: string, end: string = start) {
   return str.startsWith(start) && str.endsWith(end)
}

function isObjectOrArray(
   val: any,
): val is SerializableArray | SerializableObject {
   return typeof val === 'object' && val !== null
}
