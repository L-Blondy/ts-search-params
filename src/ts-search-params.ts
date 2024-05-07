import {
   SerializableArray,
   SerializableObject,
   SerializablePrimitive,
} from './types'

type Options<T extends SerializableObject, Q extends boolean> = {
   validate?: (searchParamsObject: Record<string, unknown>) => T
   questionMark?: Q
}

export class TSSearchParams<
   T extends SerializableObject,
   Q extends boolean = false,
> {
   #value: T
   #options: Options<T, Q>

   constructor(
      init?: string | URLSearchParams | undefined,
      options: Options<T, Q> = {},
   ) {
      const searchParams =
         !init || typeof init === 'string' ? new URLSearchParams(init) : init
      const value = {} as T
      for (let [_k, val] of searchParams.entries()) {
         const key: keyof T = _k
         value[key] = parseValue(val) as any
      }
      this.#value = value
      this.#options = options
   }

   #validated() {
      return structuredClone((this.#options.validate || (() => this.#value))(this.#value)) 
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
         const value = encodeValue(_v)
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

function parseValue(val: string) {
   if (isSurroundedBy(val, '{', '}') || isSurroundedBy(val, '[', ']')) {
      return revivePrimitivesRecursively(JSON.parse(val))
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
   if (val === 'undefined') {
      return undefined
   }
   if (!isNaN(+val) && (+val).toString() === val) {
      return +val
   }
   return val
}

function encodeValue(val: any) {
   if (isObject(val)) {
      return encodeURIComponent(
         JSON.stringify(serializePrimitivesRecursively(val)),
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

function isObject(val: any) {
   return typeof val === 'object' && val !== null
}

/**
 * Mutate the object for better perf
 */
function traverse(
   objOrArr: SerializableObject | SerializableArray,
   fn: (
      obj: SerializableObject | SerializableArray,
      prop: string,
      value: SerializablePrimitive | SerializableArray | SerializableObject,
   ) => void,
) {
   Object.entries(objOrArr).forEach(([key, val]) => {
      fn(objOrArr, key, val)
      if (val !== null && typeof val === 'object') {
         traverse(val, fn)
      }
   })
   return objOrArr
}

function serializePrimitivesRecursively(
   objectOrArray: SerializableObject | SerializableArray,
) {
   const copy = structuredClone(objectOrArray)
   traverse(copy, (obj, key, value) => {
      if (value !== null && typeof value === 'object') {
         return
      }
      if (typeof value === 'string') {
         // @ts-expect-error ts fails to assign key, even when using any
         obj[key] = `"${value}"`
         // remove undefined from objects
      } else if (typeof value === 'undefined' && !Array.isArray(obj)) {
         delete obj[key]
      } else {
         // @ts-expect-error ts fails to assign key, even when using any
         obj[key] = String(value)
      }
   })
   return copy
}

function revivePrimitivesRecursively(
   objectOrArray: SerializableObject | SerializableArray,
) {
   traverse(objectOrArray, (obj, key, value) => {
      if (typeof value === 'string') {
         // @ts-expect-error ts fails to assign key, even using any
         obj[key] = parseValue(value)
      }
   })
   return objectOrArray
}
