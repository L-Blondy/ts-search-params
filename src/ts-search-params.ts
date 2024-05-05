class TSSearchParams<T extends Record<string, any>> {
  #sp: T;

  constructor(
    init?:
      | string
      | URLSearchParams
      | string[][]
      | Record<string, string>
      | undefined
  ) {
    for (let [_k, val] of new URLSearchParams(init).entries()) {
      const key: keyof T = _k;
      this.#sp[key] = parseValue(val);
    }
  }

  merge(partial: Partial<T>) {
    this.#sp = {
      ...this.#sp,
      ...partial,
    };
  }

  toString() {
    return Object.entries(this.#sp).reduce((qs, [_k, _v]) => {
      const prefix = qs.length ? "&" : "";
      const key = encodeURIComponent(_k);
      const value = encodeValue(_v);
      return qs + `${prefix}${key}=${value}`;
    }, "");
  }

  toObject() {
    return { ...this.#sp };
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.#sp[key];
  }
}

function parseValue(val: string) {
  if (isSurroundedBy(val, "{", "}") || isSurroundedBy(val, "[", "]")) {
    return JSON.parse(val);
  }
  if (isSurroundedBy(val, '"')) {
    return val.slice(1, -1);
  }
  if (val === "true" || val === "false") {
    return val === "true";
  }
  if (val === "null") {
    return null;
  }
  if (val === "undefined") {
    return undefined;
  }
  if (!isNaN(+val) && (+val).toString() === val) {
    return +val;
  }
  return val;
}

function encodeValue(val: any) {
  if (isObject(val)) {
    return encodeURIComponent(JSON.stringify(val));
  }
  if (typeof val === "string") {
    return encodeURIComponent(`"${val}"`);
  }
  return String(val);
}

function isSurroundedBy(str: string, start: string, end: string = start) {
  return str.startsWith(start) && str.endsWith(end);
}

function isObject(val: any) {
  return typeof val === "object" && val !== null;
}
