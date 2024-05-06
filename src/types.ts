export type SerializableObject = {
   [Key in string]?:
      | SerializablePrimitive
      | SerializableArray
      | SerializableObject
}

export type SerializablePrimitive = string | number | boolean | null | undefined

export type SerializableArray = Array<
   SerializablePrimitive | SerializableArray | SerializableObject
>
