# Type Alias: AddImage360Options

> **AddImage360Options**: `object`

## Type declaration

### annotationFilter?

> `optional` **annotationFilter**: [`Image360AnnotationFilterOptions`](Image360AnnotationFilterOptions.md)

Annotation options.

### collectionTransform?

> `optional` **collectionTransform**: `Matrix4`

An optional transformation which will be applied to all 360 images that are fetched.

### preMultipliedRotation?

> `optional` **preMultipliedRotation**: `boolean`

Set this to false if the 360 images' rotation is not pre-multiplied to fit the given model.

#### Default

```ts
true
```

## Defined in

[packages/api/src/public/migration/types.ts:218](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/api/src/public/migration/types.ts#L218)
