# Type Alias: PropertyFilterNodeCollectionOptions

> **PropertyFilterNodeCollectionOptions**: `object`

Options for [PropertyFilterNodeCollection](../classes/PropertyFilterNodeCollection.md).

## Type declaration

### requestPartitions?

> `optional` **requestPartitions**: `number`

How many partitions to split the request into. More partitions can yield better performance
for queries with very large result set (in order of magnitude 100.000 plus).
Defaults to 1.

## Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:18](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L18)
