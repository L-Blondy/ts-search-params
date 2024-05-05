export class TSSearchParams<T extends Record<string, any>> {
   #value: T

   constructor(init?: string | URLSearchParams | undefined) {
      const searchParams =
         !init || typeof init === 'string' ? new URLSearchParams(init) : init
      const value = {} as T
      for (let [_k, val] of searchParams.entries()) {
         const key: keyof T = _k
         value[key] = parseValue(val)
      }
      this.#value = value
   }

   assign(partial: Partial<T>) {
      Object.assign(this.#value, partial)
      return this
   }

   toString() {
      return Object.entries(this.#value).reduce((qs, [_k, _v]) => {
         const prefix = qs.length ? '&' : ''
         const key = encodeURIComponent(_k)
         const value = encodeValue(_v)
         return qs + `${prefix}${key}=${value}`
      }, '')
   }

   toObject() {
      return { ...this.#value }
   }

   get<K extends keyof T>(key: K): T[K] {
      return this.#value[key]
   }
}

function parseValue(val: string) {
   if (isSurroundedBy(val, '{', '}') || isSurroundedBy(val, '[', ']')) {
      return JSON.parse(val)
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
      return encodeURIComponent(JSON.stringify(val))
   }
   if (typeof val === 'string') {
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
