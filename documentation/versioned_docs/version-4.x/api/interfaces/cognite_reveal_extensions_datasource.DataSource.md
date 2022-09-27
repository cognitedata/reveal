---
id: "cognite_reveal_extensions_datasource.DataSource"
title: "Interface: DataSource"
sidebar_label: "DataSource"
custom_edit_url: null
---

[@cognite/reveal/extensions/datasource](../modules/cognite_reveal_extensions_datasource.md).DataSource

Describes how Reveal data is stored, and provides means to create custom storage providers
that Reveal will fetch data from.

## Methods

### getModelDataProvider

▸ **getModelDataProvider**(): [`ModelDataProvider`](cognite_reveal_extensions_datasource.ModelDataProvider.md)

Gets a client that is able to download geometry and other files
for models.

#### Returns

[`ModelDataProvider`](cognite_reveal_extensions_datasource.ModelDataProvider.md)

#### Defined in

[packages/data-source/src/DataSource.ts:28](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/data-source/src/DataSource.ts#L28)

___

### getModelMetadataProvider

▸ **getModelMetadataProvider**(): [`ModelMetadataProvider`](cognite_reveal_extensions_datasource.ModelMetadataProvider.md)

Gets a metadata provider for models.

#### Returns

[`ModelMetadataProvider`](cognite_reveal_extensions_datasource.ModelMetadataProvider.md)

#### Defined in

[packages/data-source/src/DataSource.ts:22](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/data-source/src/DataSource.ts#L22)

___

### getNodesApiClient

▸ **getNodesApiClient**(): [`NodesApiClient`](cognite_reveal_extensions_datasource.NodesApiClient.md)

Gets a node API client that is able to fetch data about
models.

#### Returns

[`NodesApiClient`](cognite_reveal_extensions_datasource.NodesApiClient.md)

#### Defined in

[packages/data-source/src/DataSource.ts:17](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/data-source/src/DataSource.ts#L17)
