# Interface: DataSource

Describes how Reveal data is stored, and provides means to create custom storage providers
that Reveal will fetch data from.

## Methods

### getModelDataProvider()

> **getModelDataProvider**(): [`ModelDataProvider`](ModelDataProvider.md)

Gets a client that is able to download geometry and other files
for models.

#### Returns

[`ModelDataProvider`](ModelDataProvider.md)

#### Defined in

[packages/data-source/src/DataSource.ts:28](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/data-source/src/DataSource.ts#L28)

***

### getModelMetadataProvider()

> **getModelMetadataProvider**(): [`ModelMetadataProvider`](ModelMetadataProvider.md)

Gets a metadata provider for models.

#### Returns

[`ModelMetadataProvider`](ModelMetadataProvider.md)

#### Defined in

[packages/data-source/src/DataSource.ts:22](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/data-source/src/DataSource.ts#L22)

***

### getNodesApiClient()

> **getNodesApiClient**(): [`NodesApiClient`](NodesApiClient.md)

Gets a node API client that is able to fetch data about
models.

#### Returns

[`NodesApiClient`](NodesApiClient.md)

#### Defined in

[packages/data-source/src/DataSource.ts:17](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/data-source/src/DataSource.ts#L17)
