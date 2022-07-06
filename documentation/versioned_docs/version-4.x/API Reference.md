
<a name="readmemd"></a>

@cognite/reveal / [Modules](#modulesmd)

# Classes


<a name="classescognite_revealannotationidpointcloudobjectcollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / AnnotationIdPointCloudObjectCollection

## Class: AnnotationIdPointCloudObjectCollection

[@cognite/reveal](#modulescognite_revealmd).AnnotationIdPointCloudObjectCollection

### Hierarchy

- [`PointCloudObjectCollection`](#classescognite_revealpointcloudobjectcollectionmd)

  ↳ **`AnnotationIdPointCloudObjectCollection`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [isLoading](#isloading)

#### Methods

- [getAnnotationIds](#getannotationids)
- [off](#off)
- [on](#on)

### Constructors

#### constructor

• **new AnnotationIdPointCloudObjectCollection**(`ids`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `ids` | `number`[] |

##### Overrides

[PointCloudObjectCollection](#classescognite_revealpointcloudobjectcollectionmd).[constructor](#constructor)

##### Defined in

[packages/pointclouds/src/styling/AnnotationListPointCloudObjectCollection.ts:13](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/AnnotationListPointCloudObjectCollection.ts#L13)

### Accessors

#### isLoading

• `get` **isLoading**(): ``false``

##### Returns

``false``

##### Overrides

PointCloudObjectCollection.isLoading

##### Defined in

[packages/pointclouds/src/styling/AnnotationListPointCloudObjectCollection.ts:24](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/AnnotationListPointCloudObjectCollection.ts#L24)

### Methods

#### getAnnotationIds

▸ **getAnnotationIds**(): `Iterable`<`number`\>

##### Returns

`Iterable`<`number`\>

##### Overrides

[PointCloudObjectCollection](#classescognite_revealpointcloudobjectcollectionmd).[getAnnotationIds](#getannotationids)

##### Defined in

[packages/pointclouds/src/styling/AnnotationListPointCloudObjectCollection.ts:20](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/AnnotationListPointCloudObjectCollection.ts#L20)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[PointCloudObjectCollection](#classescognite_revealpointcloudobjectcollectionmd).[off](#off)

##### Defined in

[packages/pointclouds/src/styling/PointCloudObjectCollection.ts:30](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/PointCloudObjectCollection.ts#L30)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[PointCloudObjectCollection](#classescognite_revealpointcloudobjectcollectionmd).[on](#on)

##### Defined in

[packages/pointclouds/src/styling/PointCloudObjectCollection.ts:25](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/PointCloudObjectCollection.ts#L25)


<a name="classescognite_revealassetnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / AssetNodeCollection

## Class: AssetNodeCollection

[@cognite/reveal](#modulescognite_revealmd).AssetNodeCollection

### Hierarchy

- [`NodeCollection`](#classescognite_revealnodecollectionmd)

  ↳ **`AssetNodeCollection`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken-1)
- [isLoading](#isloading)

#### Methods

- [clear](#clear)
- [executeFilter](#executefilter)
- [getAreas](#getareas)
- [getFilter](#getfilter)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)

### Constructors

#### constructor

• **new AssetNodeCollection**(`client`, `modelMetadataProvider`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `default` |
| `modelMetadataProvider` | [`CdfModelNodeCollectionDataProvider`](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd) |

##### Overrides

NodeCollection.constructor

##### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:36](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L36)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"AssetNodeCollection"``

##### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L27)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Inherited from

NodeCollection.classToken

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Overrides

NodeCollection.isLoading

##### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:43](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L43)

### Methods

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[clear](#clear)

##### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:122](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L122)

___

#### executeFilter

▸ **executeFilter**(`filter`): `Promise`<`void`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | `Object` |  |
| `filter.assetId?` | `number` |  |
| `filter.boundingBox?` | `Box3` |  |

##### Returns

`Promise`<`void`\>

##### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:54](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L54)

___

#### getAreas

▸ **getAreas**(): [`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Returns

[`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[getAreas](#getareas)

##### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:133](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L133)

___

#### getFilter

▸ **getFilter**(): `Object`

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `assetId?` | `number` |
| `boundingBox?` | `Box3` |

##### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:118](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L118)

___

#### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](#classescognite_revealindexsetmd)

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[getIndexSet](#getindexset)

##### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:129](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L129)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollection](#classescognite_revealnodecollectionmd).[off](#off)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollection](#classescognite_revealnodecollectionmd).[on](#on)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ **serialize**(): [`SerializedNodeCollection`](#serializednodecollection)

##### Returns

[`SerializedNodeCollection`](#serializednodecollection)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[serialize](#serialize)

##### Defined in

[packages/cad-styling/src/AssetNodeCollection.ts:137](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L137)


<a name="classescognite_revealboundingboxclippermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / BoundingBoxClipper

## Class: BoundingBoxClipper

[@cognite/reveal](#modulescognite_revealmd).BoundingBoxClipper

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [clippingPlanes](#clippingplanes)
- [maxX](#maxx)
- [maxY](#maxy)
- [maxZ](#maxz)
- [minX](#minx)
- [minY](#miny)
- [minZ](#minz)

### Constructors

#### constructor

• **new BoundingBoxClipper**(`box?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `box?` | `Box3` |

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:18](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L18)

### Accessors

#### clippingPlanes

• `get` **clippingPlanes**(): `Plane`[]

##### Returns

`Plane`[]

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:104](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L104)

___

#### maxX

• `get` **maxX**(): `number`

##### Returns

`number`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:55](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L55)

• `set` **maxX**(`x`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |

##### Returns

`void`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:50](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L50)

___

#### maxY

• `get` **maxY**(): `number`

##### Returns

`number`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:64](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L64)

• `set` **maxY**(`y`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `y` | `number` |

##### Returns

`void`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:59](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L59)

___

#### maxZ

• `get` **maxZ**(): `number`

##### Returns

`number`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:73](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L73)

• `set` **maxZ**(`z`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `z` | `number` |

##### Returns

`void`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:68](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L68)

___

#### minX

• `get` **minX**(): `number`

##### Returns

`number`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:28](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L28)

• `set` **minX**(`x`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |

##### Returns

`void`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L23)

___

#### minY

• `get` **minY**(): `number`

##### Returns

`number`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L37)

• `set` **minY**(`y`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `y` | `number` |

##### Returns

`void`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L32)

___

#### minZ

• `get` **minZ**(): `number`

##### Returns

`number`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:46](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L46)

• `set` **minZ**(`z`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `z` | `number` |

##### Returns

`void`

##### Defined in

[packages/cad-model/src/utilities/BoundingBoxClipper.ts:41](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/utilities/BoundingBoxClipper.ts#L41)


<a name="classescognite_revealcameramanagerhelpermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / CameraManagerHelper

## Class: CameraManagerHelper

[@cognite/reveal](#modulescognite_revealmd).CameraManagerHelper

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [calculateCameraStateToFitBoundingBox](#calculatecamerastatetofitboundingbox)
- [calculateNewTargetFromRotation](#calculatenewtargetfromrotation)
- [updateCameraNearAndFar](#updatecameranearandfar)

### Constructors

#### constructor

• **new CameraManagerHelper**()

### Methods

#### calculateCameraStateToFitBoundingBox

▸ `Static` **calculateCameraStateToFitBoundingBox**(`camera`, `box`, `radiusFactor?`): `Object`

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `camera` | `PerspectiveCamera` | `undefined` |  |
| `box` | `Box3` | `undefined` |  |
| `radiusFactor` | `number` | `2` |  |

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `position` | `Vector3` |
| `target` | `Vector3` |

##### Defined in

[packages/camera-manager/src/CameraManagerHelper.ts:95](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L95)

___

#### calculateNewTargetFromRotation

▸ `Static` **calculateNewTargetFromRotation**(`camera`, `rotation`, `currentTarget`): `Vector3`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `camera` | `PerspectiveCamera` |  |
| `rotation` | `Quaternion` |  |
| `currentTarget` | `Vector3` |  |

##### Returns

`Vector3`

##### Defined in

[packages/camera-manager/src/CameraManagerHelper.ts:41](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L41)

___

#### updateCameraNearAndFar

▸ `Static` **updateCameraNearAndFar**(`camera`, `combinedBbox`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `camera` | `PerspectiveCamera` |  |
| `combinedBbox` | `Box3` |  |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManagerHelper.ts:65](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L65)


<a name="classescognite_revealclusteredareacollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / ClusteredAreaCollection

## Class: ClusteredAreaCollection

[@cognite/reveal](#modulescognite_revealmd).ClusteredAreaCollection

### Implements

- [`AreaCollection`](#interfacescognite_revealareacollectionmd)

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [isEmpty](#isempty)

#### Methods

- [addAreas](#addareas)
- [areas](#areas)
- [intersectWith](#intersectwith)
- [intersectsBox](#intersectsbox)

### Constructors

#### constructor

• **new ClusteredAreaCollection**()

### Accessors

#### isEmpty

• `get` **isEmpty**(): `boolean`

##### Returns

`boolean`

##### Implementation of

[AreaCollection](#interfacescognite_revealareacollectionmd).[isEmpty](#isempty)

##### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:16](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L16)

### Methods

#### addAreas

▸ **addAreas**(`boxes`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `boxes` | `Iterable`<`Box3`\> |

##### Returns

`void`

##### Implementation of

[AreaCollection](#interfacescognite_revealareacollectionmd).[addAreas](#addareas)

##### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:34](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L34)

___

#### areas

▸ **areas**(): `Generator`<`Box3`, `any`, `unknown`\>

##### Returns

`Generator`<`Box3`, `any`, `unknown`\>

##### Implementation of

[AreaCollection](#interfacescognite_revealareacollectionmd).[areas](#areas)

##### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:20](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L20)

___

#### intersectWith

▸ **intersectWith**(`boxes`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `boxes` | `Iterable`<`Box3`\> |

##### Returns

`void`

##### Implementation of

[AreaCollection](#interfacescognite_revealareacollectionmd).[intersectWith](#intersectwith)

##### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:38](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L38)

___

#### intersectsBox

▸ **intersectsBox**(`box`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `box` | `Box3` |

##### Returns

`boolean`

##### Implementation of

[AreaCollection](#interfacescognite_revealareacollectionmd).[intersectsBox](#intersectsbox)

##### Defined in

[packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:24](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L24)


<a name="classescognite_revealcognite3dmodelmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / Cognite3DModel

## Class: Cognite3DModel

[@cognite/reveal](#modulescognite_revealmd).Cognite3DModel

### Hierarchy

- `Object3D`

  ↳ **`Cognite3DModel`**

### Implements

- [`CogniteModelBase`](#interfacescognite_revealcognitemodelbasemd)
- [`CdfModelNodeCollectionDataProvider`](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd)

### Table of contents

#### Properties

- [modelId](#modelid)
- [revisionId](#revisionid)
- [type](#type)

#### Accessors

- [modelUnit](#modelunit)
- [modelUnitToMetersFactor](#modelunittometersfactor)
- [nodeCount](#nodecount)
- [styledNodeCollections](#stylednodecollections)

#### Methods

- [assignStyledNodeCollection](#assignstylednodecollection)
- [dispose](#dispose)
- [getAncestorTreeIndices](#getancestortreeindices)
- [getBoundingBoxByNodeId](#getboundingboxbynodeid)
- [getBoundingBoxByTreeIndex](#getboundingboxbytreeindex)
- [getCameraConfiguration](#getcameraconfiguration)
- [getDefaultNodeAppearance](#getdefaultnodeappearance)
- [getModelBoundingBox](#getmodelboundingbox)
- [getModelTransformation](#getmodeltransformation)
- [getSubtreeTreeIndices](#getsubtreetreeindices)
- [iterateNodesByTreeIndex](#iteratenodesbytreeindex)
- [iterateSubtreeByTreeIndex](#iteratesubtreebytreeindex)
- [mapBoxFromCdfToModelCoordinates](#mapboxfromcdftomodelcoordinates)
- [mapBoxFromModelToCdfCoordinates](#mapboxfrommodeltocdfcoordinates)
- [mapFromCdfToModelCoordinates](#mapfromcdftomodelcoordinates)
- [mapNodeIdToTreeIndex](#mapnodeidtotreeindex)
- [mapNodeIdsToTreeIndices](#mapnodeidstotreeindices)
- [mapPositionFromModelToCdfCoordinates](#mappositionfrommodeltocdfcoordinates)
- [mapTreeIndexToNodeId](#maptreeindextonodeid)
- [mapTreeIndicesToNodeIds](#maptreeindicestonodeids)
- [removeAllStyledNodeCollections](#removeallstylednodecollections)
- [resetNodeTransform](#resetnodetransform)
- [resetNodeTransformByTreeIndex](#resetnodetransformbytreeindex)
- [setDefaultNodeAppearance](#setdefaultnodeappearance)
- [setModelTransformation](#setmodeltransformation)
- [setNodeTransform](#setnodetransform)
- [setNodeTransformByTreeIndex](#setnodetransformbytreeindex)
- [unassignStyledNodeCollection](#unassignstylednodecollection)

### Properties

#### modelId

• `Readonly` **modelId**: `number`

##### Implementation of

[CdfModelNodeCollectionDataProvider](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd).[modelId](#modelid)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:57](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L57)

___

#### revisionId

• `Readonly` **revisionId**: `number`

##### Implementation of

[CdfModelNodeCollectionDataProvider](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd).[revisionId](#revisionid)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:61](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L61)

___

#### type

• `Readonly` **type**: [`SupportedModelTypes`](#supportedmodeltypes) = `'cad'`

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[type](#type)

##### Overrides

THREE.Object3D.type

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:26](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L26)

### Accessors

#### modelUnit

• `get` **modelUnit**(): ``""`` \| [`WellKnownUnit`](#wellknownunit)

##### Returns

``""`` \| [`WellKnownUnit`](#wellknownunit)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:40](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L40)

___

#### modelUnitToMetersFactor

• `get` **modelUnitToMetersFactor**(): `number`

##### Returns

`number`

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:50](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L50)

___

#### nodeCount

• `get` **nodeCount**(): `number`

##### Returns

`number`

##### Implementation of

[CdfModelNodeCollectionDataProvider](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd).[nodeCount](#nodecount)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:452](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L452)

___

#### styledNodeCollections

• `get` **styledNodeCollections**(): { `appearance`: [`NodeAppearance`](#nodeappearance) ; `nodeCollection`: [`NodeCollection`](#classescognite_revealnodecollectionmd)  }[]

##### Returns

{ `appearance`: [`NodeAppearance`](#nodeappearance) ; `nodeCollection`: [`NodeCollection`](#classescognite_revealnodecollectionmd)  }[]

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:123](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L123)

### Methods

#### assignStyledNodeCollection

▸ **assignStyledNodeCollection**(`nodeCollection`, `appearance`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [`NodeCollection`](#classescognite_revealnodecollectionmd) |  |
| `appearance` | [`NodeAppearance`](#nodeappearance) |  |

##### Returns

`void`

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:154](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L154)

___

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[dispose](#dispose)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:286](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L286)

___

#### getAncestorTreeIndices

▸ **getAncestorTreeIndices**(`treeIndex`, `generation`): `Promise`<[`NumericRange`](#classescognite_revealnumericrangemd)\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` |  |
| `generation` | `number` |  |

##### Returns

`Promise`<[`NumericRange`](#classescognite_revealnumericrangemd)\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:311](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L311)

___

#### getBoundingBoxByNodeId

▸ **getBoundingBoxByNodeId**(`nodeId`, `box?`): `Promise`<`Box3`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeId` | `number` |  |
| `box?` | `Box3` |  |

##### Returns

`Promise`<`Box3`\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:394](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L394)

___

#### getBoundingBoxByTreeIndex

▸ **getBoundingBoxByTreeIndex**(`treeIndex`, `box?`): `Promise`<`Box3`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` |  |
| `box?` | `Box3` |  |

##### Returns

`Promise`<`Box3`\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:428](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L428)

___

#### getCameraConfiguration

▸ **getCameraConfiguration**(): [`CameraConfiguration`](#cameraconfiguration)

##### Returns

[`CameraConfiguration`](#cameraconfiguration)

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[getCameraConfiguration](#getcameraconfiguration)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:358](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L358)

___

#### getDefaultNodeAppearance

▸ **getDefaultNodeAppearance**(): [`NodeAppearance`](#nodeappearance)

##### Returns

[`NodeAppearance`](#nodeappearance)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:116](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L116)

___

#### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`, `restrictToMostGeometry?`): `Box3`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `outBbox?` | `Box3` |  |
| `restrictToMostGeometry?` | `boolean` |  |

##### Returns

`Box3`

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[getModelBoundingBox](#getmodelboundingbox)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:342](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L342)

___

#### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` |  |

##### Returns

`Matrix4`

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[getModelTransformation](#getmodeltransformation)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:374](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L374)

___

#### getSubtreeTreeIndices

▸ **getSubtreeTreeIndices**(`treeIndex`): `Promise`<[`NumericRange`](#classescognite_revealnumericrangemd)\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` |  |

##### Returns

`Promise`<[`NumericRange`](#classescognite_revealnumericrangemd)\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:295](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L295)

___

#### iterateNodesByTreeIndex

▸ **iterateNodesByTreeIndex**(`action`): `Promise`<`void`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `action` | (`treeIndex`: `number`) => `void` |  |

##### Returns

`Promise`<`void`\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:445](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L445)

___

#### iterateSubtreeByTreeIndex

▸ **iterateSubtreeByTreeIndex**(`treeIndex`, `action`): `Promise`<`void`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` |  |
| `action` | (`treeIndex`: `number`) => `void` |  |

##### Returns

`Promise`<`void`\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:472](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L472)

___

#### mapBoxFromCdfToModelCoordinates

▸ **mapBoxFromCdfToModelCoordinates**(`box`, `out?`): `Box3`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `box` | `Box3` |  |
| `out?` | `Box3` |  |

##### Returns

`Box3`

##### Implementation of

[CdfModelNodeCollectionDataProvider](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd).[mapBoxFromCdfToModelCoordinates](#mapboxfromcdftomodelcoordinates)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:274](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L274)

___

#### mapBoxFromModelToCdfCoordinates

▸ **mapBoxFromModelToCdfCoordinates**(`box`, `out?`): `Box3`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `box` | `Box3` |  |
| `out?` | `Box3` |  |

##### Returns

`Box3`

##### Implementation of

[CdfModelNodeCollectionDataProvider](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd).[mapBoxFromModelToCdfCoordinates](#mapboxfrommodeltocdfcoordinates)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:256](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L256)

___

#### mapFromCdfToModelCoordinates

▸ **mapFromCdfToModelCoordinates**(`p`, `out?`): `Vector3`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | `Vector3` |  |
| `out?` | `Vector3` |  |

##### Returns

`Vector3`

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:220](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L220)

___

#### mapNodeIdToTreeIndex

▸ **mapNodeIdToTreeIndex**(`nodeId`): `Promise`<`number`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeId` | `number` |  |

##### Returns

`Promise`<`number`\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:527](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L527)

___

#### mapNodeIdsToTreeIndices

▸ **mapNodeIdsToTreeIndices**(`nodeIds`): `Promise`<`number`[]\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeIds` | `number`[] |  |

##### Returns

`Promise`<`number`[]\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:513](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L513)

___

#### mapPositionFromModelToCdfCoordinates

▸ **mapPositionFromModelToCdfCoordinates**(`p`, `out?`): `Vector3`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | `Vector3` |  |
| `out?` | `Vector3` |  |

##### Returns

`Vector3`

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:238](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L238)

___

#### mapTreeIndexToNodeId

▸ **mapTreeIndexToNodeId**(`treeIndex`): `Promise`<`number`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` |  |

##### Returns

`Promise`<`number`\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:553](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L553)

___

#### mapTreeIndicesToNodeIds

▸ **mapTreeIndicesToNodeIds**(`treeIndices`): `Promise`<`number`[]\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | `number`[] |  |

##### Returns

`Promise`<`number`[]\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:541](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L541)

___

#### removeAllStyledNodeCollections

▸ **removeAllStyledNodeCollections**(): `void`

##### Returns

`void`

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:186](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L186)

___

#### resetNodeTransform

▸ **resetNodeTransform**(`treeIndices`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | [`NumericRange`](#classescognite_revealnumericrangemd) |  |

##### Returns

`void`

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:208](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L208)

___

#### resetNodeTransformByTreeIndex

▸ **resetNodeTransformByTreeIndex**(`treeIndex`, `applyToChildren?`): `Promise`<`number`\>

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `treeIndex` | `number` | `undefined` |  |
| `applyToChildren` | `boolean` | `true` |  |

##### Returns

`Promise`<`number`\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:498](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L498)

___

#### setDefaultNodeAppearance

▸ **setDefaultNodeAppearance**(`appearance`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `appearance` | [`NodeAppearance`](#nodeappearance) |  |

##### Returns

`void`

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:108](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L108)

___

#### setModelTransformation

▸ **setModelTransformation**(`matrix`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `matrix` | `Matrix4` |  |

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[setModelTransformation](#setmodeltransformation)

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:366](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L366)

___

#### setNodeTransform

▸ **setNodeTransform**(`treeIndices`, `transformMatrix`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | [`NumericRange`](#classescognite_revealnumericrangemd) |  |
| `transformMatrix` | `Matrix4` |  |

##### Returns

`void`

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:200](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L200)

___

#### setNodeTransformByTreeIndex

▸ **setNodeTransformByTreeIndex**(`treeIndex`, `transform`, `applyToChildren?`): `Promise`<`number`\>

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `treeIndex` | `number` | `undefined` |  |
| `transform` | `Matrix4` | `undefined` |  |
| `applyToChildren` | `boolean` | `true` |  |

##### Returns

`Promise`<`number`\>

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:483](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L483)

___

#### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [`NodeCollection`](#classescognite_revealnodecollectionmd) |  |

##### Returns

`void`

##### Defined in

[packages/cad-model/src/wrappers/Cognite3DModel.ts:172](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/wrappers/Cognite3DModel.ts#L172)


<a name="classescognite_revealcognite3dviewermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / Cognite3DViewer

## Class: Cognite3DViewer

[@cognite/reveal](#modulescognite_revealmd).Cognite3DViewer

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [cadBudget](#cadbudget)
- [cameraManager](#cameramanager)
- [domElement](#domelement)
- [models](#models)
- [pointCloudBudget](#pointcloudbudget)
- [renderer](#renderer)

#### Methods

- [addCadModel](#addcadmodel)
- [addModel](#addmodel)
- [addObject3D](#addobject3d)
- [addPointCloudModel](#addpointcloudmodel)
- [determineModelType](#determinemodeltype)
- [dispose](#dispose)
- [fitCameraToBoundingBox](#fitcameratoboundingbox)
- [fitCameraToModel](#fitcameratomodel)
- [getCamera](#getcamera)
- [getClippingPlanes](#getclippingplanes)
- [getIntersectionFromPixel](#getintersectionfrompixel)
- [getScene](#getscene)
- [getScreenshot](#getscreenshot)
- [getVersion](#getversion)
- [getViewState](#getviewstate)
- [loadCameraFromModel](#loadcamerafrommodel)
- [off](#off)
- [on](#on)
- [removeModel](#removemodel)
- [removeObject3D](#removeobject3d)
- [requestRedraw](#requestredraw)
- [setBackgroundColor](#setbackgroundcolor)
- [setClippingPlanes](#setclippingplanes)
- [setLogLevel](#setloglevel)
- [setViewState](#setviewstate)
- [worldToScreen](#worldtoscreen)
- [isBrowserSupported](#isbrowsersupported)

### Constructors

#### constructor

• **new Cognite3DViewer**(`options`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`Cognite3DViewerOptions`](#interfacescognite_revealcognite3dvieweroptionsmd) |

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:201](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L201)

### Accessors

#### cadBudget

• `get` **cadBudget**(): [`CadModelBudget`](#cadmodelbudget)

##### Returns

[`CadModelBudget`](#cadmodelbudget)

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:155](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L155)

• `set` **cadBudget**(`budget`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `budget` | [`CadModelBudget`](#cadmodelbudget) |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:165](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L165)

___

#### cameraManager

• `get` **cameraManager**(): [`CameraManager`](#interfacescognite_revealcameramanagermd)

##### Returns

[`CameraManager`](#interfacescognite_revealcameramanagermd)

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:495](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L495)

___

#### domElement

• `get` **domElement**(): `HTMLElement`

##### Returns

`HTMLElement`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:92](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L92)

___

#### models

• `get` **models**(): [`CogniteModelBase`](#interfacescognite_revealcognitemodelbasemd)[]

##### Returns

[`CogniteModelBase`](#interfacescognite_revealcognitemodelbasemd)[]

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:190](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L190)

___

#### pointCloudBudget

• `get` **pointCloudBudget**(): [`PointCloudBudget`](#pointcloudbudget)

##### Returns

[`PointCloudBudget`](#pointcloudbudget)

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:175](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L175)

• `set` **pointCloudBudget**(`budget`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `budget` | [`PointCloudBudget`](#pointcloudbudget) |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:183](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L183)

___

#### renderer

• `get` **renderer**(): `WebGLRenderer`

##### Returns

`WebGLRenderer`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:99](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L99)

### Methods

#### addCadModel

▸ **addCadModel**(`options`): `Promise`<[`Cognite3DModel`](#classescognite_revealcognite3dmodelmd)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`AddModelOptions`](#interfacescognite_revealaddmodeloptionsmd) |

##### Returns

`Promise`<[`Cognite3DModel`](#classescognite_revealcognite3dmodelmd)\>

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:572](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L572)

___

#### addModel

▸ **addModel**(`options`): `Promise`<[`Cognite3DModel`](#classescognite_revealcognite3dmodelmd) \| [`CognitePointCloudModel`](#classescognite_revealcognitepointcloudmodelmd)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`AddModelOptions`](#interfacescognite_revealaddmodeloptionsmd) |

##### Returns

`Promise`<[`Cognite3DModel`](#classescognite_revealcognite3dmodelmd) \| [`CognitePointCloudModel`](#classescognite_revealcognitepointcloudmodelmd)\>

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:539](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L539)

___

#### addObject3D

▸ **addObject3D**(`object`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `Object3D`<`Event`\> |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:713](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L713)

___

#### addPointCloudModel

▸ **addPointCloudModel**(`options`): `Promise`<[`CognitePointCloudModel`](#classescognite_revealcognitepointcloudmodelmd)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`AddModelOptions`](#interfacescognite_revealaddmodeloptionsmd) |

##### Returns

`Promise`<[`CognitePointCloudModel`](#classescognite_revealcognitepointcloudmodelmd)\>

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:600](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L600)

___

#### determineModelType

▸ **determineModelType**(`modelId`, `revisionId`): `Promise`<``""`` \| [`SupportedModelTypes`](#supportedmodeltypes)\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `modelId` | `number` |  |
| `revisionId` | `number` |  |

##### Returns

`Promise`<``""`` \| [`SupportedModelTypes`](#supportedmodeltypes)\>

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:680](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L680)

___

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:337](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L337)

___

#### fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`box`, `duration?`, `radiusFactor?`): `void`

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `box` | `Box3` | `undefined` |  |
| `duration?` | `number` | `undefined` |  |
| `radiusFactor` | `number` | `2` |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:881](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L881)

___

#### fitCameraToModel

▸ **fitCameraToModel**(`model`, `duration?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `model` | [`CogniteModelBase`](#interfacescognite_revealcognitemodelbasemd) |  |
| `duration?` | `number` |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:857](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L857)

___

#### getCamera

▸ **getCamera**(): `PerspectiveCamera`

##### Returns

`PerspectiveCamera`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:807](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L807)

___

#### getClippingPlanes

▸ **getClippingPlanes**(): `Plane`[]

##### Returns

`Plane`[]

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:799](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L799)

___

#### getIntersectionFromPixel

▸ **getIntersectionFromPixel**(`offsetX`, `offsetY`): `Promise`<[`Intersection`](#intersection)\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `offsetX` | `number` |  |
| `offsetY` | `number` |  |

##### Returns

`Promise`<[`Intersection`](#intersection)\>

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1026](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1026)

▸ **getIntersectionFromPixel**(`offsetX`, `offsetY`, `options`): `Promise`<[`Intersection`](#intersection)\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `offsetX` | `number` |  |
| `offsetY` | `number` |  |
| `options` | [`IntersectionFromPixelOptions`](#interfacescognite_revealintersectionfrompixeloptionsmd) |  |

##### Returns

`Promise`<[`Intersection`](#intersection)\>

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:1030](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L1030)

___

#### getScene

▸ **getScene**(): `Scene`

##### Returns

`Scene`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:815](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L815)

___

#### getScreenshot

▸ **getScreenshot**(`width?`, `height?`): `Promise`<`string`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `width` | `number` |  |
| `height` | `number` |  |

##### Returns

`Promise`<`string`\>

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:968](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L968)

___

#### getVersion

▸ **getVersion**(): `string`

##### Returns

`string`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:310](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L310)

___

#### getViewState

▸ **getViewState**(): [`ViewerState`](#viewerstate)

##### Returns

[`ViewerState`](#viewerstate)

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:503](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L503)

___

#### loadCameraFromModel

▸ **loadCameraFromModel**(`model`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `model` | [`CogniteModelBase`](#interfacescognite_revealcognitemodelbasemd) |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:829](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L829)

___

#### off

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"click"`` \| ``"hover"`` |  |
| `callback` | [`PointerEventDelegate`](#pointereventdelegate) |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:439](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L439)

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` |  |
| `callback` | [`CameraChangeDelegate`](#camerachangedelegate) |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:446](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L446)

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"sceneRendered"`` |  |
| `callback` | [`SceneRenderedDelegate`](#scenerendereddelegate) |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:453](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L453)

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` |  |
| `callback` | [`DisposedDelegate`](#disposeddelegate) |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:460](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L460)

___

#### on

▸ **on**(`event`, `callback`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` |  |
| `callback` | [`DisposedDelegate`](#disposeddelegate) |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:372](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L372)

▸ **on**(`event`, `callback`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"click"`` \| ``"hover"`` |  |
| `callback` | [`PointerEventDelegate`](#pointereventdelegate) |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:381](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L381)

▸ **on**(`event`, `callback`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` |  |
| `callback` | [`CameraChangeDelegate`](#camerachangedelegate) |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:390](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L390)

▸ **on**(`event`, `callback`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"sceneRendered"`` |  |
| `callback` | [`SceneRenderedDelegate`](#scenerendereddelegate) |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:396](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L396)

___

#### removeModel

▸ **removeModel**(`model`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `model` | [`CogniteModelBase`](#interfacescognite_revealcognitemodelbasemd) |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:622](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L622)

___

#### removeObject3D

▸ **removeObject3D**(`object`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `Object3D`<`Event`\> |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:734](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L734)

___

#### requestRedraw

▸ **requestRedraw**(): `void`

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:888](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L888)

___

#### setBackgroundColor

▸ **setBackgroundColor**(`color`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `color` | `Color` |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:751](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L751)

___

#### setClippingPlanes

▸ **setClippingPlanes**(`clippingPlanes`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clippingPlanes` | `Plane`[] |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:791](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L791)

___

#### setLogLevel

▸ **setLogLevel**(`level`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `level` | ``"error"`` \| ``"debug"`` \| ``"trace"`` \| ``"info"`` \| ``"warn"`` \| ``"silent"`` \| ``"none"`` |  |

##### Returns

`void`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:319](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L319)

___

#### setViewState

▸ **setViewState**(`state`): `Promise`<`void`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`ViewerState`](#viewerstate) |  |

##### Returns

`Promise`<`void`\>

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:513](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L513)

___

#### worldToScreen

▸ **worldToScreen**(`point`, `normalize?`): `Vector2`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `point` | `Vector3` |  |
| `normalize?` | `boolean` |  |

##### Returns

`Vector2`

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:926](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L926)

___

#### isBrowserSupported

▸ `Static` **isBrowserSupported**(): ``true``

##### Returns

``true``

##### Defined in

[packages/api/src/public/migration/Cognite3DViewer.ts:82](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/Cognite3DViewer.ts#L82)


<a name="classescognite_revealcognitepointcloudmodelmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / CognitePointCloudModel

## Class: CognitePointCloudModel

[@cognite/reveal](#modulescognite_revealmd).CognitePointCloudModel

### Hierarchy

- `Object3D`

  ↳ **`CognitePointCloudModel`**

### Implements

- [`CogniteModelBase`](#interfacescognite_revealcognitemodelbasemd)

### Table of contents

#### Properties

- [modelId](#modelid)
- [revisionId](#revisionid)
- [type](#type)

#### Accessors

- [pointColorType](#pointcolortype)
- [pointShape](#pointshape)
- [pointSize](#pointsize)
- [pointSizeType](#pointsizetype)
- [stylableObjectCount](#stylableobjectcount)
- [styledCollections](#styledcollections)
- [visiblePointCount](#visiblepointcount)

#### Methods

- [assignStyledObjectCollection](#assignstyledobjectcollection)
- [dispose](#dispose)
- [getCameraConfiguration](#getcameraconfiguration)
- [getClasses](#getclasses)
- [getDefaultPointCloudAppearance](#getdefaultpointcloudappearance)
- [getModelBoundingBox](#getmodelboundingbox)
- [getModelTransformation](#getmodeltransformation)
- [hasClass](#hasclass)
- [isClassVisible](#isclassvisible)
- [removeAllStyledObjectCollections](#removeallstyledobjectcollections)
- [setClassVisible](#setclassvisible)
- [setDefaultPointCloudAppearance](#setdefaultpointcloudappearance)
- [setModelTransformation](#setmodeltransformation)
- [traverseStylableObjects](#traversestylableobjects)
- [unassignStyledObjectCollection](#unassignstyledobjectcollection)

### Properties

#### modelId

• `Readonly` **modelId**: `number`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:30](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L30)

___

#### revisionId

• `Readonly` **revisionId**: `number`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:34](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L34)

___

#### type

• `Readonly` **type**: [`SupportedModelTypes`](#supportedmodeltypes) = `'pointcloud'`

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[type](#type)

##### Overrides

THREE.Object3D.type

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:29](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L29)

### Accessors

#### pointColorType

• `get` **pointColorType**(): [`PotreePointColorType`](#enumscognite_revealpotreepointcolortypemd)

##### Returns

[`PotreePointColorType`](#enumscognite_revealpotreepointcolortypemd)

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:158](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L158)

• `set` **pointColorType**(`type`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`PotreePointColorType`](#enumscognite_revealpotreepointcolortypemd) |

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:170](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L170)

___

#### pointShape

• `get` **pointShape**(): [`PotreePointShape`](#enumscognite_revealpotreepointshapemd)

##### Returns

[`PotreePointShape`](#enumscognite_revealpotreepointshapemd)

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:210](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L210)

• `set` **pointShape**(`shape`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `shape` | [`PotreePointShape`](#enumscognite_revealpotreepointshapemd) |

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:218](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L218)

___

#### pointSize

• `get` **pointSize**(): `number`

##### Returns

`number`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:177](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L177)

• `set` **pointSize**(`size`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `size` | `number` |

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:185](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L185)

___

#### pointSizeType

• `get` **pointSizeType**(): [`PotreePointSizeType`](#enumscognite_revealpotreepointsizetypemd)

##### Returns

[`PotreePointSizeType`](#enumscognite_revealpotreepointsizetypemd)

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:192](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L192)

• `set` **pointSizeType**(`type`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`PotreePointSizeType`](#enumscognite_revealpotreepointsizetypemd) |

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:201](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L201)

___

#### stylableObjectCount

• `get` **stylableObjectCount**(): `number`

##### Returns

`number`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:294](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L294)

___

#### styledCollections

• `get` **styledCollections**(): `StyledPointCloudObjectCollection`[]

##### Returns

`StyledPointCloudObjectCollection`[]

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:242](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L242)

___

#### visiblePointCount

• `get` **visiblePointCount**(): `number`

##### Returns

`number`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:151](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L151)

### Methods

#### assignStyledObjectCollection

▸ **assignStyledObjectCollection**(`objectCollection`, `appearance`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `objectCollection` | [`PointCloudObjectCollection`](#classescognite_revealpointcloudobjectcollectionmd) |  |
| `appearance` | [`PointCloudAppearance`](#pointcloudappearance) |  |

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:252](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L252)

___

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[dispose](#dispose)

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:60](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L60)

___

#### getCameraConfiguration

▸ **getCameraConfiguration**(): [`CameraConfiguration`](#cameraconfiguration)

##### Returns

[`CameraConfiguration`](#cameraconfiguration)

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[getCameraConfiguration](#getcameraconfiguration)

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:88](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L88)

___

#### getClasses

▸ **getClasses**(): `number`[]

##### Returns

`number`[]

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:144](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L144)

___

#### getDefaultPointCloudAppearance

▸ **getDefaultPointCloudAppearance**(): [`PointCloudAppearance`](#pointcloudappearance)

##### Returns

[`PointCloudAppearance`](#pointcloudappearance)

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:225](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L225)

___

#### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`): `Box3`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `outBbox?` | `Box3` |  |

##### Returns

`Box3`

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[getModelBoundingBox](#getmodelboundingbox)

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:79](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L79)

___

#### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` |  |

##### Returns

`Matrix4`

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[getModelTransformation](#getmodeltransformation)

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:104](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L104)

___

#### hasClass

▸ **hasClass**(`pointClass`): `boolean`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` |  |

##### Returns

`boolean`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:136](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L136)

___

#### isClassVisible

▸ **isClassVisible**(`pointClass`): `boolean`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` |  |

##### Returns

`boolean`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:126](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L126)

___

#### removeAllStyledObjectCollections

▸ **removeAllStyledObjectCollections**(): `void`

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:287](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L287)

___

#### setClassVisible

▸ **setClassVisible**(`pointClass`, `visible`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` |  |
| `visible` | `boolean` |  |

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:115](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L115)

___

#### setDefaultPointCloudAppearance

▸ **setDefaultPointCloudAppearance**(`appearance`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `appearance` | [`PointCloudAppearance`](#pointcloudappearance) |  |

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:233](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L233)

___

#### setModelTransformation

▸ **setModelTransformation**(`transformationMatrix`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `transformationMatrix` | `Matrix4` |  |

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfacescognite_revealcognitemodelbasemd).[setModelTransformation](#setmodeltransformation)

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:96](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L96)

___

#### traverseStylableObjects

▸ **traverseStylableObjects**(`callback`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (`annotationMetadata`: `PointCloudObjectMetadata`) => `void` |

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:307](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L307)

___

#### unassignStyledObjectCollection

▸ **unassignStyledObjectCollection**(`objectCollection`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `objectCollection` | [`PointCloudObjectCollection`](#classescognite_revealpointcloudobjectcollectionmd) |  |

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/CognitePointCloudModel.ts:270](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L270)


<a name="classescognite_revealcombocontrolsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / ComboControls

## Class: ComboControls

[@cognite/reveal](#modulescognite_revealmd).ComboControls

### Hierarchy

- `EventDispatcher`

  ↳ **`ComboControls`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [EPSILON](#epsilon)
- [dampingFactor](#dampingfactor)
- [dispose](#dispose)
- [dollyFactor](#dollyfactor)
- [dynamicTarget](#dynamictarget)
- [enableDamping](#enabledamping)
- [enableKeyboardNavigation](#enablekeyboardnavigation)
- [enabled](#enabled)
- [firstPersonRotationFactor](#firstpersonrotationfactor)
- [keyboardDollySpeed](#keyboarddollyspeed)
- [keyboardPanSpeed](#keyboardpanspeed)
- [keyboardRotationSpeedAzimuth](#keyboardrotationspeedazimuth)
- [keyboardRotationSpeedPolar](#keyboardrotationspeedpolar)
- [keyboardSpeedFactor](#keyboardspeedfactor)
- [lookAtViewTarget](#lookatviewtarget)
- [maxAzimuthAngle](#maxazimuthangle)
- [maxDeltaDownscaleCoefficient](#maxdeltadownscalecoefficient)
- [maxDeltaRatio](#maxdeltaratio)
- [maxPolarAngle](#maxpolarangle)
- [maxZoom](#maxzoom)
- [minAzimuthAngle](#minazimuthangle)
- [minDeltaDownscaleCoefficient](#mindeltadownscalecoefficient)
- [minDeltaRatio](#mindeltaratio)
- [minDistance](#mindistance)
- [minPolarAngle](#minpolarangle)
- [minZoom](#minzoom)
- [minZoomDistance](#minzoomdistance)
- [mouseFirstPersonRotationSpeed](#mousefirstpersonrotationspeed)
- [orthographicCameraDollyFactor](#orthographiccameradollyfactor)
- [panDollyMinDistanceFactor](#pandollymindistancefactor)
- [pinchEpsilon](#pinchepsilon)
- [pinchPanSpeed](#pinchpanspeed)
- [pointerRotationSpeedAzimuth](#pointerrotationspeedazimuth)
- [pointerRotationSpeedPolar](#pointerrotationspeedpolar)
- [useScrollTarget](#usescrolltarget)
- [zoomToCursor](#zoomtocursor)

#### Accessors

- [cameraRawRotation](#camerarawrotation)

#### Methods

- [getScrollTarget](#getscrolltarget)
- [getState](#getstate)
- [setScrollTarget](#setscrolltarget)
- [setState](#setstate)
- [setViewTarget](#setviewtarget)
- [triggerCameraChangeEvent](#triggercamerachangeevent)
- [update](#update)

### Constructors

#### constructor

• **new ComboControls**(`camera`, `domElement`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `camera` | `PerspectiveCamera` \| `OrthographicCamera` |
| `domElement` | `HTMLElement` |

##### Overrides

EventDispatcher.constructor

##### Defined in

[packages/camera-manager/src/ComboControls.ts:108](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L108)

### Properties

#### EPSILON

• **EPSILON**: `number` = `0.001`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:70](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L70)

___

#### dampingFactor

• **dampingFactor**: `number` = `0.25`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:48](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L48)

___

#### dispose

• **dispose**: () => `void`

##### Type declaration

▸ (): `void`

###### Returns

`void`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:71](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L71)

___

#### dollyFactor

• **dollyFactor**: `number` = `0.99`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:52](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L52)

___

#### dynamicTarget

• **dynamicTarget**: `boolean` = `true`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:49](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L49)

___

#### enableDamping

• **enableDamping**: `boolean` = `true`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:47](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L47)

___

#### enableKeyboardNavigation

• **enableKeyboardNavigation**: `boolean` = `true`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:61](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L61)

___

#### enabled

• **enabled**: `boolean` = `true`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:46](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L46)

___

#### firstPersonRotationFactor

• **firstPersonRotationFactor**: `number` = `0.4`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:58](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L58)

___

#### keyboardDollySpeed

• **keyboardDollySpeed**: `number` = `2`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:65](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L65)

___

#### keyboardPanSpeed

• **keyboardPanSpeed**: `number` = `10`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:66](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L66)

___

#### keyboardRotationSpeedAzimuth

• **keyboardRotationSpeedAzimuth**: `number` = `defaultKeyboardRotationSpeed`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:62](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L62)

___

#### keyboardRotationSpeedPolar

• **keyboardRotationSpeedPolar**: `number` = `defaultKeyboardRotationSpeed`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:63](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L63)

___

#### keyboardSpeedFactor

• **keyboardSpeedFactor**: `number` = `3`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:67](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L67)

___

#### lookAtViewTarget

• **lookAtViewTarget**: `boolean` = `false`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:76](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L76)

___

#### maxAzimuthAngle

• **maxAzimuthAngle**: `number` = `Infinity`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:56](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L56)

___

#### maxDeltaDownscaleCoefficient

• **maxDeltaDownscaleCoefficient**: `number` = `1`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:82](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L82)

___

#### maxDeltaRatio

• **maxDeltaRatio**: `number` = `8`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:80](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L80)

___

#### maxPolarAngle

• **maxPolarAngle**: `number` = `Math.PI`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:54](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L54)

___

#### maxZoom

• **maxZoom**: `number` = `Infinity`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:73](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L73)

___

#### minAzimuthAngle

• **minAzimuthAngle**: `number` = `-Infinity`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:55](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L55)

___

#### minDeltaDownscaleCoefficient

• **minDeltaDownscaleCoefficient**: `number` = `0.1`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:81](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L81)

___

#### minDeltaRatio

• **minDeltaRatio**: `number` = `1`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:79](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L79)

___

#### minDistance

• **minDistance**: `number` = `0.8`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:50](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L50)

___

#### minPolarAngle

• **minPolarAngle**: `number` = `0`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:53](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L53)

___

#### minZoom

• **minZoom**: `number` = `0`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:72](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L72)

___

#### minZoomDistance

• **minZoomDistance**: `number` = `0.4`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:51](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L51)

___

#### mouseFirstPersonRotationSpeed

• **mouseFirstPersonRotationSpeed**: `number`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:64](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L64)

___

#### orthographicCameraDollyFactor

• **orthographicCameraDollyFactor**: `number` = `0.3`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:74](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L74)

___

#### panDollyMinDistanceFactor

• **panDollyMinDistanceFactor**: `number` = `10.0`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:57](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L57)

___

#### pinchEpsilon

• **pinchEpsilon**: `number` = `2`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:68](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L68)

___

#### pinchPanSpeed

• **pinchPanSpeed**: `number` = `1`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:69](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L69)

___

#### pointerRotationSpeedAzimuth

• **pointerRotationSpeedAzimuth**: `number` = `defaultPointerRotationSpeed`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:59](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L59)

___

#### pointerRotationSpeedPolar

• **pointerRotationSpeedPolar**: `number` = `defaultPointerRotationSpeed`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:60](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L60)

___

#### useScrollTarget

• **useScrollTarget**: `boolean` = `false`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:77](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L77)

___

#### zoomToCursor

• **zoomToCursor**: `boolean` = `true`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:78](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L78)

### Accessors

#### cameraRawRotation

• `get` **cameraRawRotation**(): `Quaternion`

##### Returns

`Quaternion`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:255](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L255)

### Methods

#### getScrollTarget

▸ **getScrollTarget**(): `Vector3`

##### Returns

`Vector3`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:267](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L267)

___

#### getState

▸ **getState**(): `Object`

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `position` | `Vector3` |
| `target` | `Vector3` |

##### Defined in

[packages/camera-manager/src/ComboControls.ts:230](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L230)

___

#### setScrollTarget

▸ **setScrollTarget**(`target`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `Vector3` |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:263](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L263)

___

#### setState

▸ **setState**(`position`, `target`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `position` | `Vector3` |
| `target` | `Vector3` |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:238](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L238)

___

#### setViewTarget

▸ **setViewTarget**(`target`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `Vector3` |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:259](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L259)

___

#### triggerCameraChangeEvent

▸ **triggerCameraChangeEvent**(): `void`

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:271](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L271)

___

#### update

▸ **update**(`deltaTime`, `forceUpdate?`): `boolean`

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `deltaTime` | `number` | `undefined` |
| `forceUpdate` | `boolean` | `false` |

##### Returns

`boolean`

##### Defined in

[packages/camera-manager/src/ComboControls.ts:144](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/ComboControls.ts#L144)


<a name="classescognite_revealdefaultcameramanagermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / DefaultCameraManager

## Class: DefaultCameraManager

[@cognite/reveal](#modulescognite_revealmd).DefaultCameraManager

### Implements

- [`CameraManager`](#interfacescognite_revealcameramanagermd)

### Table of contents

#### Properties

- [automaticControlsSensitivity](#automaticcontrolssensitivity)
- [automaticNearFarPlane](#automaticnearfarplane)

#### Accessors

- [cameraControls](#cameracontrols)
- [cameraControlsEnabled](#cameracontrolsenabled)
- [keyboardNavigationEnabled](#keyboardnavigationenabled)

#### Methods

- [dispose](#dispose)
- [fitCameraToBoundingBox](#fitcameratoboundingbox)
- [getCamera](#getcamera)
- [getCameraControlsOptions](#getcameracontrolsoptions)
- [getCameraState](#getcamerastate)
- [off](#off)
- [on](#on)
- [setCameraControlsOptions](#setcameracontrolsoptions)
- [setCameraState](#setcamerastate)
- [update](#update)

### Properties

#### automaticControlsSensitivity

• **automaticControlsSensitivity**: `boolean` = `true`

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:79](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L79)

___

#### automaticNearFarPlane

• **automaticNearFarPlane**: `boolean` = `true`

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:71](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L71)

### Accessors

#### cameraControls

• `get` **cameraControls**(): [`ComboControls`](#classescognite_revealcombocontrolsmd)

##### Returns

[`ComboControls`](#classescognite_revealcombocontrolsmd)

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:141](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L141)

___

#### cameraControlsEnabled

• `get` **cameraControlsEnabled**(): `boolean`

##### Returns

`boolean`

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:157](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L157)

• `set` **cameraControlsEnabled**(`enabled`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:150](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L150)

___

#### keyboardNavigationEnabled

• `get` **keyboardNavigationEnabled**(): `boolean`

##### Returns

`boolean`

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:171](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L171)

• `set` **keyboardNavigationEnabled**(`enabled`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:164](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L164)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Implementation of

[CameraManager](#interfacescognite_revealcameramanagermd).[dispose](#dispose)

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:241](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L241)

___

#### fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`box`, `duration?`, `radiusFactor?`): `void`

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `box` | `Box3` | `undefined` |
| `duration?` | `number` | `undefined` |
| `radiusFactor` | `number` | `2` |

##### Returns

`void`

##### Implementation of

[CameraManager](#interfacescognite_revealcameramanagermd).[fitCameraToBoundingBox](#fitcameratoboundingbox)

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:127](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L127)

___

#### getCamera

▸ **getCamera**(): `PerspectiveCamera`

##### Returns

`PerspectiveCamera`

##### Implementation of

[CameraManager](#interfacescognite_revealcameramanagermd).[getCamera](#getcamera)

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:175](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L175)

___

#### getCameraControlsOptions

▸ **getCameraControlsOptions**(): [`CameraControlsOptions`](#cameracontrolsoptions)

##### Returns

[`CameraControlsOptions`](#cameracontrolsoptions)

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:216](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L216)

___

#### getCameraState

▸ **getCameraState**(): `Required`<[`CameraState`](#camerastate)\>

##### Returns

`Required`<[`CameraState`](#camerastate)\>

##### Implementation of

[CameraManager](#interfacescognite_revealcameramanagermd).[getCameraState](#getcamerastate)

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:205](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L205)

___

#### off

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | [`CameraChangeDelegate`](#camerachangedelegate) |

##### Returns

`void`

##### Implementation of

[CameraManager](#interfacescognite_revealcameramanagermd).[off](#off)

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:117](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L117)

___

#### on

▸ **on**(`event`, `callback`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | [`CameraChangeDelegate`](#camerachangedelegate) |

##### Returns

`void`

##### Implementation of

[CameraManager](#interfacescognite_revealcameramanagermd).[on](#on)

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:107](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L107)

___

#### setCameraControlsOptions

▸ **setCameraControlsOptions**(`controlsOptions`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `controlsOptions` | [`CameraControlsOptions`](#cameracontrolsoptions) |  |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:224](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L224)

___

#### setCameraState

▸ **setCameraState**(`state`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`CameraState`](#camerastate) |  |

##### Returns

`void`

##### Implementation of

[CameraManager](#interfacescognite_revealcameramanagermd).[setCameraState](#setcamerastate)

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:185](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L185)

___

#### update

▸ **update**(`deltaTime`, `boundingBox`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `deltaTime` | `number` |
| `boundingBox` | `Box3` |

##### Returns

`void`

##### Implementation of

[CameraManager](#interfacescognite_revealcameramanagermd).[update](#update)

##### Defined in

[packages/camera-manager/src/DefaultCameraManager.ts:231](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L231)


<a name="classescognite_revealindexsetmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / IndexSet

## Class: IndexSet

[@cognite/reveal](#modulescognite_revealmd).IndexSet

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [rootNode](#rootnode)

#### Accessors

- [count](#count)

#### Methods

- [add](#add)
- [addRange](#addrange)
- [clear](#clear)
- [clone](#clone)
- [contains](#contains)
- [differenceWith](#differencewith)
- [forEachRange](#foreachrange)
- [hasIntersectionWith](#hasintersectionwith)
- [intersectWith](#intersectwith)
- [invertedRanges](#invertedranges)
- [remove](#remove)
- [removeRange](#removerange)
- [toIndexArray](#toindexarray)
- [toPlainSet](#toplainset)
- [toRangeArray](#torangearray)
- [unionWith](#unionwith)

### Constructors

#### constructor

• **new IndexSet**(`values?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `values?` | `Iterable`<`number`\> |

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:13](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L13)

• **new IndexSet**(`values?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `values?` | [`NumericRange`](#classescognite_revealnumericrangemd) |

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:14](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L14)

### Properties

#### rootNode

• `Optional` **rootNode**: `IndexNode`

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:11](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L11)

### Accessors

#### count

• `get` **count**(): `number`

##### Returns

`number`

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:68](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L68)

### Methods

#### add

▸ **add**(`index`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

##### Returns

`void`

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:33](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L33)

___

#### addRange

▸ **addRange**(`range`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](#classescognite_revealnumericrangemd) |

##### Returns

`void`

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:39](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L39)

___

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:211](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L211)

___

#### clone

▸ **clone**(): [`IndexSet`](#classescognite_revealindexsetmd)

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:215](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L215)

___

#### contains

▸ **contains**(`index`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

##### Returns

`boolean`

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:60](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L60)

___

#### differenceWith

▸ **differenceWith**(`otherSet`): [`IndexSet`](#classescognite_revealindexsetmd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [`IndexSet`](#classescognite_revealindexsetmd) |

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:135](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L135)

___

#### forEachRange

▸ **forEachRange**(`visitor`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `visitor` | (`range`: [`NumericRange`](#classescognite_revealnumericrangemd)) => `void` |

##### Returns

`void`

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L27)

___

#### hasIntersectionWith

▸ **hasIntersectionWith**(`otherSet`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [`IndexSet`](#classescognite_revealindexsetmd) \| `Set`<`number`\> \| `Map`<`number`, `number`\> |

##### Returns

`boolean`

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:145](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L145)

___

#### intersectWith

▸ **intersectWith**(`otherSet`): [`IndexSet`](#classescognite_revealindexsetmd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [`IndexSet`](#classescognite_revealindexsetmd) |

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:171](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L171)

___

#### invertedRanges

▸ **invertedRanges**(): [`NumericRange`](#classescognite_revealnumericrangemd)[]

##### Returns

[`NumericRange`](#classescognite_revealnumericrangemd)[]

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:105](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L105)

___

#### remove

▸ **remove**(`index`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

##### Returns

`void`

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:47](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L47)

___

#### removeRange

▸ **removeRange**(`range`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](#classescognite_revealnumericrangemd) |

##### Returns

`void`

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:52](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L52)

___

#### toIndexArray

▸ **toIndexArray**(): `number`[]

##### Returns

`number`[]

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:84](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L84)

___

#### toPlainSet

▸ **toPlainSet**(): `Set`<`number`\>

##### Returns

`Set`<`number`\>

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:98](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L98)

___

#### toRangeArray

▸ **toRangeArray**(): [`NumericRange`](#classescognite_revealnumericrangemd)[]

##### Returns

[`NumericRange`](#classescognite_revealnumericrangemd)[]

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:76](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L76)

___

#### unionWith

▸ **unionWith**(`otherSet`): [`IndexSet`](#classescognite_revealindexsetmd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [`IndexSet`](#classescognite_revealindexsetmd) |

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Defined in

[packages/utilities/src/indexset/IndexSet.ts:123](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/indexset/IndexSet.ts#L123)


<a name="classescognite_revealintersectionnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / IntersectionNodeCollection

## Class: IntersectionNodeCollection

[@cognite/reveal](#modulescognite_revealmd).IntersectionNodeCollection

### Hierarchy

- `CombineNodeCollectionBase`

  ↳ **`IntersectionNodeCollection`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken-1)
- [isLoading](#isloading)

#### Methods

- [add](#add)
- [clear](#clear)
- [getAreas](#getareas)
- [getIndexSet](#getindexset)
- [makeDirty](#makedirty)
- [off](#off)
- [on](#on)
- [remove](#remove)
- [serialize](#serialize)

### Constructors

#### constructor

• **new IntersectionNodeCollection**(`nodeCollections?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollections?` | [`NodeCollection`](#classescognite_revealnodecollectionmd)[] |

##### Overrides

CombineNodeCollectionBase.constructor

##### Defined in

[packages/cad-styling/src/IntersectionNodeCollection.ts:22](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/IntersectionNodeCollection.ts#L22)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"IntersectionNodeCollection"``

##### Defined in

[packages/cad-styling/src/IntersectionNodeCollection.ts:20](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/IntersectionNodeCollection.ts#L20)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Inherited from

CombineNodeCollectionBase.classToken

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Inherited from

CombineNodeCollectionBase.isLoading

##### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:67](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L67)

### Methods

#### add

▸ **add**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [`NodeCollection`](#classescognite_revealnodecollectionmd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.add

##### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L26)

___

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.clear

##### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:46](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L46)

___

#### getAreas

▸ **getAreas**(): [`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Returns

[`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Overrides

CombineNodeCollectionBase.getAreas

##### Defined in

[packages/cad-styling/src/IntersectionNodeCollection.ts:52](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/IntersectionNodeCollection.ts#L52)

___

#### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](#classescognite_revealindexsetmd)

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Inherited from

CombineNodeCollectionBase.getIndexSet

##### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:59](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L59)

___

#### makeDirty

▸ **makeDirty**(): `void`

##### Returns

`void`

##### Overrides

CombineNodeCollectionBase.makeDirty

##### Defined in

[packages/cad-styling/src/IntersectionNodeCollection.ts:46](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/IntersectionNodeCollection.ts#L46)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.off

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.on

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### remove

▸ **remove**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [`NodeCollection`](#classescognite_revealnodecollectionmd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.remove

##### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L32)

___

#### serialize

▸ **serialize**(): [`SerializedNodeCollection`](#serializednodecollection)

##### Returns

[`SerializedNodeCollection`](#serializednodecollection)

##### Overrides

CombineNodeCollectionBase.serialize

##### Defined in

[packages/cad-styling/src/IntersectionNodeCollection.ts:26](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/IntersectionNodeCollection.ts#L26)


<a name="classescognite_revealinvertednodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / InvertedNodeCollection

## Class: InvertedNodeCollection

[@cognite/reveal](#modulescognite_revealmd).InvertedNodeCollection

### Hierarchy

- [`NodeCollection`](#classescognite_revealnodecollectionmd)

  ↳ **`InvertedNodeCollection`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken-1)
- [isLoading](#isloading)

#### Methods

- [clear](#clear)
- [getAreas](#getareas)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)

### Constructors

#### constructor

• **new InvertedNodeCollection**(`model`, `innerSet`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [`CdfModelNodeCollectionDataProvider`](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd) |
| `innerSet` | [`NodeCollection`](#classescognite_revealnodecollectionmd) |

##### Overrides

NodeCollection.constructor

##### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:21](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L21)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"InvertedNodeCollection"``

##### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:15](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L15)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Inherited from

NodeCollection.classToken

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Overrides

NodeCollection.isLoading

##### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L32)

### Methods

#### clear

▸ **clear**(): `never`

##### Returns

`never`

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[clear](#clear)

##### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:58](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L58)

___

#### getAreas

▸ **getAreas**(): [`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Returns

[`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[getAreas](#getareas)

##### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:47](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L47)

___

#### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](#classescognite_revealindexsetmd)

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[getIndexSet](#getindexset)

##### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:36](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L36)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollection](#classescognite_revealnodecollectionmd).[off](#off)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollection](#classescognite_revealnodecollectionmd).[on](#on)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ **serialize**(): [`SerializedNodeCollection`](#serializednodecollection)

##### Returns

[`SerializedNodeCollection`](#serializednodecollection)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[serialize](#serialize)

##### Defined in

[packages/cad-styling/src/InvertedNodeCollection.ts:51](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L51)


<a name="classescognite_revealnodeappearanceprovidermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / NodeAppearanceProvider

## Class: NodeAppearanceProvider

[@cognite/reveal](#modulescognite_revealmd).NodeAppearanceProvider

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [isLoading](#isloading)

#### Methods

- [applyStyles](#applystyles)
- [assignStyledNodeCollection](#assignstylednodecollection)
- [clear](#clear)
- [getPrioritizedAreas](#getprioritizedareas)
- [off](#off)
- [on](#on)
- [unassignStyledNodeCollection](#unassignstylednodecollection)

### Constructors

#### constructor

• **new NodeAppearanceProvider**()

### Accessors

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:155](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L155)

### Methods

#### applyStyles

▸ **applyStyles**(`applyCb`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `applyCb` | `ApplyStyleDelegate` |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:118](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L118)

___

#### assignStyledNodeCollection

▸ **assignStyledNodeCollection**(`nodeCollection`, `appearance`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [`NodeCollection`](#classescognite_revealnodecollectionmd) |
| `appearance` | [`NodeAppearance`](#nodeappearance) |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:82](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L82)

___

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:146](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L146)

___

#### getPrioritizedAreas

▸ **getPrioritizedAreas**(): `PrioritizedArea`[]

##### Returns

`PrioritizedArea`[]

##### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:125](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L125)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:60](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L60)

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"loadingStateChanged"`` |
| `listener` | (`isLoading`: `boolean`) => `void` |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:61](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L61)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L37)

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"loadingStateChanged"`` |
| `listener` | (`isLoading`: `boolean`) => `void` |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:38](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L38)

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"prioritizedAreasChanged"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:39](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L39)

___

#### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [`NodeCollection`](#classescognite_revealnodecollectionmd) |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:106](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L106)


<a name="classescognite_revealnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / NodeCollection

## Class: NodeCollection

[@cognite/reveal](#modulescognite_revealmd).NodeCollection

### Hierarchy

- **`NodeCollection`**

  ↳ [`TreeIndexNodeCollection`](#classescognite_revealtreeindexnodecollectionmd)

  ↳ [`PropertyFilterNodeCollection`](#classescognite_revealpropertyfilternodecollectionmd)

  ↳ [`SinglePropertyFilterNodeCollection`](#classescognite_revealsinglepropertyfilternodecollectionmd)

  ↳ [`AssetNodeCollection`](#classescognite_revealassetnodecollectionmd)

  ↳ [`InvertedNodeCollection`](#classescognite_revealinvertednodecollectionmd)

### Table of contents

#### Accessors

- [classToken](#classtoken)
- [isLoading](#isloading)

#### Methods

- [clear](#clear)
- [getAreas](#getareas)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `Abstract` `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L37)

### Methods

#### clear

▸ `Abstract` **clear**(): `void`

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:40](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L40)

___

#### getAreas

▸ `Abstract` **getAreas**(): [`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Returns

[`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:39](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L39)

___

#### getIndexSet

▸ `Abstract` **getIndexSet**(): [`IndexSet`](#classescognite_revealindexsetmd)

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:38](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L38)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ `Abstract` **serialize**(): [`SerializedNodeCollection`](#serializednodecollection)

##### Returns

[`SerializedNodeCollection`](#serializednodecollection)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:41](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L41)


<a name="classescognite_revealnumericrangemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / NumericRange

## Class: NumericRange

[@cognite/reveal](#modulescognite_revealmd).NumericRange

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [count](#count)
- [from](#from)
- [toInclusive](#toinclusive)

#### Methods

- [contains](#contains)
- [equal](#equal)
- [forEach](#foreach)
- [intersectionWith](#intersectionwith)
- [intersects](#intersects)
- [intersectsOrCoinciding](#intersectsorcoinciding)
- [isInside](#isinside)
- [toArray](#toarray)
- [toString](#tostring)
- [union](#union)
- [values](#values)
- [createFromInterval](#createfrominterval)
- [isNumericRange](#isnumericrange)

### Constructors

#### constructor

• **new NumericRange**(`from`, `count`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `from` | `number` |
| `count` | `number` |

##### Defined in

[packages/utilities/src/NumericRange.ts:10](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L10)

### Properties

#### count

• `Readonly` **count**: `number`

##### Defined in

[packages/utilities/src/NumericRange.ts:7](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L7)

___

#### from

• `Readonly` **from**: `number`

##### Defined in

[packages/utilities/src/NumericRange.ts:6](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L6)

___

#### toInclusive

• `Readonly` **toInclusive**: `number`

##### Defined in

[packages/utilities/src/NumericRange.ts:8](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L8)

### Methods

#### contains

▸ **contains**(`value`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

##### Returns

`boolean`

##### Defined in

[packages/utilities/src/NumericRange.ts:38](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L38)

___

#### equal

▸ **equal**(`other`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `other` | [`NumericRange`](#classescognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[packages/utilities/src/NumericRange.ts:34](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L34)

___

#### forEach

▸ **forEach**(`action`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `action` | (`value`: `number`) => `void` |

##### Returns

`void`

##### Defined in

[packages/utilities/src/NumericRange.ts:72](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L72)

___

#### intersectionWith

▸ **intersectionWith**(`range`): [`NumericRange`](#classescognite_revealnumericrangemd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](#classescognite_revealnumericrangemd) |

##### Returns

[`NumericRange`](#classescognite_revealnumericrangemd)

##### Defined in

[packages/utilities/src/NumericRange.ts:50](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L50)

___

#### intersects

▸ **intersects**(`range`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](#classescognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[packages/utilities/src/NumericRange.ts:42](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L42)

___

#### intersectsOrCoinciding

▸ **intersectsOrCoinciding**(`range`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](#classescognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[packages/utilities/src/NumericRange.ts:46](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L46)

___

#### isInside

▸ **isInside**(`range`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](#classescognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[packages/utilities/src/NumericRange.ts:61](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L61)

___

#### toArray

▸ **toArray**(): `number`[]

##### Returns

`number`[]

##### Defined in

[packages/utilities/src/NumericRange.ts:30](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L30)

___

#### toString

▸ **toString**(): `string`

##### Returns

`string`

##### Defined in

[packages/utilities/src/NumericRange.ts:78](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L78)

___

#### union

▸ **union**(`range`): [`NumericRange`](#classescognite_revealnumericrangemd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`NumericRange`](#classescognite_revealnumericrangemd) |

##### Returns

[`NumericRange`](#classescognite_revealnumericrangemd)

##### Defined in

[packages/utilities/src/NumericRange.ts:65](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L65)

___

#### values

▸ **values**(): `Generator`<`number`, `any`, `unknown`\>

##### Returns

`Generator`<`number`, `any`, `unknown`\>

##### Defined in

[packages/utilities/src/NumericRange.ts:24](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L24)

___

#### createFromInterval

▸ `Static` **createFromInterval**(`from`, `toInclusive`): [`NumericRange`](#classescognite_revealnumericrangemd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `from` | `number` |
| `toInclusive` | `number` |

##### Returns

[`NumericRange`](#classescognite_revealnumericrangemd)

##### Defined in

[packages/utilities/src/NumericRange.ts:20](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L20)

___

#### isNumericRange

▸ `Static` **isNumericRange**(`value`): value is NumericRange

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

##### Returns

value is NumericRange

##### Defined in

[packages/utilities/src/NumericRange.ts:82](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/NumericRange.ts#L82)


<a name="classescognite_revealpointcloudobjectcollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / PointCloudObjectCollection

## Class: PointCloudObjectCollection

[@cognite/reveal](#modulescognite_revealmd).PointCloudObjectCollection

### Hierarchy

- **`PointCloudObjectCollection`**

  ↳ [`AnnotationIdPointCloudObjectCollection`](#classescognite_revealannotationidpointcloudobjectcollectionmd)

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [isLoading](#isloading)

#### Methods

- [getAnnotationIds](#getannotationids)
- [off](#off)
- [on](#on)

### Constructors

#### constructor

• **new PointCloudObjectCollection**()

### Accessors

#### isLoading

• `Abstract` `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Defined in

[packages/pointclouds/src/styling/PointCloudObjectCollection.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/PointCloudObjectCollection.ts#L23)

### Methods

#### getAnnotationIds

▸ `Abstract` **getAnnotationIds**(): `Iterable`<`number`\>

##### Returns

`Iterable`<`number`\>

##### Defined in

[packages/pointclouds/src/styling/PointCloudObjectCollection.ts:18](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/PointCloudObjectCollection.ts#L18)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/styling/PointCloudObjectCollection.ts:30](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/PointCloudObjectCollection.ts#L30)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[packages/pointclouds/src/styling/PointCloudObjectCollection.ts:25](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/PointCloudObjectCollection.ts#L25)


<a name="classescognite_revealpropertyfilternodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / PropertyFilterNodeCollection

## Class: PropertyFilterNodeCollection

[@cognite/reveal](#modulescognite_revealmd).PropertyFilterNodeCollection

### Hierarchy

- [`NodeCollection`](#classescognite_revealnodecollectionmd)

  ↳ **`PropertyFilterNodeCollection`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken-1)
- [isLoading](#isloading)

#### Methods

- [clear](#clear)
- [executeFilter](#executefilter)
- [getAreas](#getareas)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)

### Constructors

#### constructor

• **new PropertyFilterNodeCollection**(`client`, `model`, `options?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `default` |
| `model` | [`CdfModelNodeCollectionDataProvider`](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd) |
| `options` | `PropertyFilterNodeCollectionOptions` |

##### Overrides

NodeCollection.constructor

##### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:53](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L53)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"PropertyFilterNodeCollection"``

##### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:38](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L38)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Inherited from

NodeCollection.classToken

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Overrides

NodeCollection.isLoading

##### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:64](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L64)

### Methods

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[clear](#clear)

##### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:126](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L126)

___

#### executeFilter

▸ **executeFilter**(`filter`): `Promise`<`void`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | `Object` |  |

##### Returns

`Promise`<`void`\>

##### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:77](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L77)

___

#### getAreas

▸ **getAreas**(): [`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Returns

[`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[getAreas](#getareas)

##### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:138](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L138)

___

#### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](#classescognite_revealindexsetmd)

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[getIndexSet](#getindexset)

##### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:134](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L134)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollection](#classescognite_revealnodecollectionmd).[off](#off)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollection](#classescognite_revealnodecollectionmd).[on](#on)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ **serialize**(): [`SerializedNodeCollection`](#serializednodecollection)

##### Returns

[`SerializedNodeCollection`](#serializednodecollection)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[serialize](#serialize)

##### Defined in

[packages/cad-styling/src/PropertyFilterNodeCollection.ts:142](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L142)


<a name="classescognite_revealsinglepropertyfilternodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / SinglePropertyFilterNodeCollection

## Class: SinglePropertyFilterNodeCollection

[@cognite/reveal](#modulescognite_revealmd).SinglePropertyFilterNodeCollection

### Hierarchy

- [`NodeCollection`](#classescognite_revealnodecollectionmd)

  ↳ **`SinglePropertyFilterNodeCollection`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken-1)
- [isLoading](#isloading)

#### Methods

- [clear](#clear)
- [executeFilter](#executefilter)
- [getAreas](#getareas)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)

### Constructors

#### constructor

• **new SinglePropertyFilterNodeCollection**(`client`, `model`, `options?`)

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `default` |  |
| `model` | [`CdfModelNodeCollectionDataProvider`](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd) |  |
| `options` | `PropertyFilterNodeCollectionOptions` |  |

##### Overrides

NodeCollection.constructor

##### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:50](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L50)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"SinglePropertyNodeCollection"``

##### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:29](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L29)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Inherited from

NodeCollection.classToken

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Overrides

NodeCollection.isLoading

##### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:61](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L61)

### Methods

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[clear](#clear)

##### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:125](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L125)

___

#### executeFilter

▸ **executeFilter**(`propertyCategory`, `propertyKey`, `propertyValues`): `Promise`<`void`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `propertyCategory` | `string` |  |
| `propertyKey` | `string` |  |
| `propertyValues` | `string`[] |  |

##### Returns

`Promise`<`void`\>

##### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:75](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L75)

___

#### getAreas

▸ **getAreas**(): [`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Returns

[`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[getAreas](#getareas)

##### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:137](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L137)

___

#### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](#classescognite_revealindexsetmd)

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[getIndexSet](#getindexset)

##### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:133](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L133)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollection](#classescognite_revealnodecollectionmd).[off](#off)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollection](#classescognite_revealnodecollectionmd).[on](#on)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ **serialize**(): [`SerializedNodeCollection`](#serializednodecollection)

##### Returns

[`SerializedNodeCollection`](#serializednodecollection)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[serialize](#serialize)

##### Defined in

[packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:147](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L147)


<a name="classescognite_revealtreeindexnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / TreeIndexNodeCollection

## Class: TreeIndexNodeCollection

[@cognite/reveal](#modulescognite_revealmd).TreeIndexNodeCollection

### Hierarchy

- [`NodeCollection`](#classescognite_revealnodecollectionmd)

  ↳ **`TreeIndexNodeCollection`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken-1)
- [isLoading](#isloading)

#### Methods

- [addAreaPoints](#addareapoints)
- [addAreas](#addareas)
- [clear](#clear)
- [clearAreas](#clearareas)
- [getAreas](#getareas)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [serialize](#serialize)
- [updateSet](#updateset)

### Constructors

#### constructor

• **new TreeIndexNodeCollection**(`treeIndexSet?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndexSet?` | [`IndexSet`](#classescognite_revealindexsetmd) |

##### Overrides

NodeCollection.constructor

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L23)

• **new TreeIndexNodeCollection**(`treeIndices?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndices?` | `Iterable`<`number`\> |

##### Overrides

NodeCollection.constructor

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:24](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L24)

• **new TreeIndexNodeCollection**(`treeIndexRange?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndexRange?` | [`NumericRange`](#classescognite_revealnumericrangemd) |

##### Overrides

NodeCollection.constructor

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:25](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L25)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"TreeIndexNodeCollection"``

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:18](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L18)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Inherited from

NodeCollection.classToken

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Overrides

NodeCollection.isLoading

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:99](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L99)

### Methods

#### addAreaPoints

▸ **addAreaPoints**(`points`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `points` | `Vector3`[] |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:85](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L85)

___

#### addAreas

▸ **addAreas**(`areas`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `areas` | `Box3`[] |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:73](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L73)

___

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[clear](#clear)

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:45](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L45)

___

#### clearAreas

▸ **clearAreas**(): `void`

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:95](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L95)

___

#### getAreas

▸ **getAreas**(): [`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Returns

[`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[getAreas](#getareas)

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:54](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L54)

___

#### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](#classescognite_revealindexsetmd)

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[getIndexSet](#getindexset)

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:50](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L50)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollection](#classescognite_revealnodecollectionmd).[off](#off)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

[NodeCollection](#classescognite_revealnodecollectionmd).[on](#on)

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ **serialize**(): [`SerializedNodeCollection`](#serializednodecollection)

##### Returns

[`SerializedNodeCollection`](#serializednodecollection)

##### Overrides

[NodeCollection](#classescognite_revealnodecollectionmd).[serialize](#serialize)

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:103](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L103)

___

#### updateSet

▸ **updateSet**(`treeIndices`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndices` | [`IndexSet`](#classescognite_revealindexsetmd) |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/TreeIndexNodeCollection.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L37)


<a name="classescognite_revealunionnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / UnionNodeCollection

## Class: UnionNodeCollection

[@cognite/reveal](#modulescognite_revealmd).UnionNodeCollection

### Hierarchy

- `CombineNodeCollectionBase`

  ↳ **`UnionNodeCollection`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken-1)
- [isLoading](#isloading)

#### Methods

- [add](#add)
- [clear](#clear)
- [getAreas](#getareas)
- [getIndexSet](#getindexset)
- [off](#off)
- [on](#on)
- [remove](#remove)
- [serialize](#serialize)

### Constructors

#### constructor

• **new UnionNodeCollection**(`nodeCollections?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollections?` | [`NodeCollection`](#classescognite_revealnodecollectionmd)[] |

##### Overrides

CombineNodeCollectionBase.constructor

##### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:21](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L21)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"UnionNodeCollection"``

##### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:19](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L19)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Inherited from

CombineNodeCollectionBase.classToken

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Inherited from

CombineNodeCollectionBase.isLoading

##### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:67](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L67)

### Methods

#### add

▸ **add**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [`NodeCollection`](#classescognite_revealnodecollectionmd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.add

##### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L26)

___

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.clear

##### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:46](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L46)

___

#### getAreas

▸ **getAreas**(): [`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Returns

[`AreaCollection`](#interfacescognite_revealareacollectionmd)

##### Overrides

CombineNodeCollectionBase.getAreas

##### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:45](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L45)

___

#### getIndexSet

▸ **getIndexSet**(): [`IndexSet`](#classescognite_revealindexsetmd)

##### Returns

[`IndexSet`](#classescognite_revealindexsetmd)

##### Inherited from

CombineNodeCollectionBase.getIndexSet

##### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:59](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L59)

___

#### off

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.off

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

___

#### on

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.on

##### Defined in

[packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### remove

▸ **remove**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [`NodeCollection`](#classescognite_revealnodecollectionmd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.remove

##### Defined in

[packages/cad-styling/src/CombineNodeCollectionBase.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L32)

___

#### serialize

▸ **serialize**(): [`SerializedNodeCollection`](#serializednodecollection)

##### Returns

[`SerializedNodeCollection`](#serializednodecollection)

##### Overrides

CombineNodeCollectionBase.serialize

##### Defined in

[packages/cad-styling/src/UnionNodeCollection.ts:25](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L25)


<a name="classescognite_reveal_extensions_datasourcecdfmodelidentifiermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd) / CdfModelIdentifier

## Class: CdfModelIdentifier

[@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd).CdfModelIdentifier

### Implements

- [`ModelIdentifier`](#interfacescognite_reveal_extensions_datasourcemodelidentifiermd)

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [modelId](#modelid)
- [revealInternalId](#revealinternalid)
- [revisionId](#revisionid)

#### Methods

- [toString](#tostring)

### Constructors

#### constructor

• **new CdfModelIdentifier**(`modelId`, `revisionId`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `modelId` | `number` |
| `revisionId` | `number` |

##### Defined in

[packages/modeldata-api/src/CdfModelIdentifier.ts:16](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L16)

### Properties

#### modelId

• `Readonly` **modelId**: `number`

##### Defined in

[packages/modeldata-api/src/CdfModelIdentifier.ts:13](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L13)

___

#### revealInternalId

• `Readonly` **revealInternalId**: `symbol`

##### Implementation of

[ModelIdentifier](#interfacescognite_reveal_extensions_datasourcemodelidentifiermd).[revealInternalId](#revealinternalid)

##### Defined in

[packages/modeldata-api/src/CdfModelIdentifier.ts:11](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L11)

___

#### revisionId

• `Readonly` **revisionId**: `number`

##### Defined in

[packages/modeldata-api/src/CdfModelIdentifier.ts:14](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L14)

### Methods

#### toString

▸ **toString**(): `string`

##### Returns

`string`

##### Defined in

[packages/modeldata-api/src/CdfModelIdentifier.ts:22](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L22)


<a name="classescognite_reveal_toolsaxisviewtoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / AxisViewTool

## Class: AxisViewTool

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).AxisViewTool

### Hierarchy

- [`Cognite3DViewerToolBase`](#classescognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **`AxisViewTool`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [dispose](#dispose)
- [off](#off)

### Constructors

#### constructor

• **new AxisViewTool**(`viewer`, `config?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](#classescognite_revealcognite3dviewermd) |
| `config?` | [`AxisBoxConfig`](#axisboxconfig) |

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[packages/tools/src/AxisView/AxisViewTool.ts:42](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/AxisView/AxisViewTool.ts#L42)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[packages/tools/src/AxisView/AxisViewTool.ts:66](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/AxisView/AxisViewTool.ts#L66)

___

#### off

▸ **off**(`event`, `handler`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` |  |
| `handler` | () => `void` |  |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)


<a name="classescognite_reveal_toolscognite3dviewertoolbasemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / Cognite3DViewerToolBase

## Class: Cognite3DViewerToolBase

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).Cognite3DViewerToolBase

### Hierarchy

- **`Cognite3DViewerToolBase`**

  ↳ [`HtmlOverlayTool`](#classescognite_reveal_toolshtmloverlaytoolmd)

  ↳ [`ExplodedViewTool`](#classescognite_reveal_toolsexplodedviewtoolmd)

  ↳ [`DebugCameraTool`](#classescognite_reveal_toolsdebugcameratoolmd)

  ↳ [`AxisViewTool`](#classescognite_reveal_toolsaxisviewtoolmd)

  ↳ [`GeomapTool`](#classescognite_reveal_toolsgeomaptoolmd)

  ↳ [`TimelineTool`](#classescognite_reveal_toolstimelinetoolmd)

  ↳ [`DebugLoadedSectorsTool`](#classescognite_reveal_toolsdebugloadedsectorstoolmd)

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [dispose](#dispose)
- [off](#off)

### Constructors

#### constructor

• **new Cognite3DViewerToolBase**()

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:52](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L52)

___

#### off

▸ **off**(`event`, `handler`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` |  |
| `handler` | () => `void` |  |

##### Returns

`void`

##### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)


<a name="classescognite_reveal_toolsdebugcameratoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / DebugCameraTool

## Class: DebugCameraTool

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).DebugCameraTool

### Hierarchy

- [`Cognite3DViewerToolBase`](#classescognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **`DebugCameraTool`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [dispose](#dispose)
- [hideCameraHelper](#hidecamerahelper)
- [off](#off)
- [showCameraHelper](#showcamerahelper)

### Constructors

#### constructor

• **new DebugCameraTool**(`viewer`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](#classescognite_revealcognite3dviewermd) |

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[packages/tools/src/DebugCameraTool.ts:20](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/DebugCameraTool.ts#L20)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[packages/tools/src/DebugCameraTool.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/DebugCameraTool.ts#L32)

___

#### hideCameraHelper

▸ **hideCameraHelper**(): `void`

##### Returns

`void`

##### Defined in

[packages/tools/src/DebugCameraTool.ts:43](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/DebugCameraTool.ts#L43)

___

#### off

▸ **off**(`event`, `handler`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` |  |
| `handler` | () => `void` |  |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

#### showCameraHelper

▸ **showCameraHelper**(): `void`

##### Returns

`void`

##### Defined in

[packages/tools/src/DebugCameraTool.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/DebugCameraTool.ts#L37)


<a name="classescognite_reveal_toolsdebugloadedsectorstoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / DebugLoadedSectorsTool

## Class: DebugLoadedSectorsTool

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).DebugLoadedSectorsTool

### Hierarchy

- [`Cognite3DViewerToolBase`](#classescognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **`DebugLoadedSectorsTool`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [dispose](#dispose)
- [off](#off)
- [setOptions](#setoptions)
- [showSectorBoundingBoxes](#showsectorboundingboxes)

### Constructors

#### constructor

• **new DebugLoadedSectorsTool**(`viewer`, `options?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](#classescognite_revealcognite3dviewermd) |
| `options` | [`DebugLoadedSectorsToolOptions`](#debugloadedsectorstooloptions) |

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[packages/tools/src/DebugLoadedSectorsTool.ts:28](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L28)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[packages/tools/src/DebugLoadedSectorsTool.ts:48](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L48)

___

#### off

▸ **off**(`event`, `handler`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` |  |
| `handler` | () => `void` |  |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

#### setOptions

▸ **setOptions**(`options`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`DebugLoadedSectorsToolOptions`](#debugloadedsectorstooloptions) |

##### Returns

`void`

##### Defined in

[packages/tools/src/DebugLoadedSectorsTool.ts:36](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L36)

___

#### showSectorBoundingBoxes

▸ **showSectorBoundingBoxes**(`model`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [`Cognite3DModel`](#classescognite_revealcognite3dmodelmd) |

##### Returns

`void`

##### Defined in

[packages/tools/src/DebugLoadedSectorsTool.ts:52](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L52)


<a name="classescognite_reveal_toolsexplodedviewtoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / ExplodedViewTool

## Class: ExplodedViewTool

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).ExplodedViewTool

### Hierarchy

- [`Cognite3DViewerToolBase`](#classescognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **`ExplodedViewTool`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [readyPromise](#readypromise)

#### Methods

- [dispose](#dispose)
- [expand](#expand)
- [off](#off)
- [reset](#reset)

### Constructors

#### constructor

• **new ExplodedViewTool**(`treeIndex`, `cadModel`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndex` | `number` |
| `cadModel` | [`Cognite3DModel`](#classescognite_revealcognite3dmodelmd) |

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[packages/tools/src/ExplodedViewTool.ts:18](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/ExplodedViewTool.ts#L18)

### Accessors

#### readyPromise

• `get` **readyPromise**(): `Promise`<`void`\>

##### Returns

`Promise`<`void`\>

##### Defined in

[packages/tools/src/ExplodedViewTool.ts:14](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/ExplodedViewTool.ts#L14)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:52](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L52)

___

#### expand

▸ **expand**(`expandRadius`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `expandRadius` | `number` |

##### Returns

`Promise`<`void`\>

##### Defined in

[packages/tools/src/ExplodedViewTool.ts:29](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/ExplodedViewTool.ts#L29)

___

#### off

▸ **off**(`event`, `handler`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` |  |
| `handler` | () => `void` |  |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

#### reset

▸ **reset**(): `void`

##### Returns

`void`

##### Defined in

[packages/tools/src/ExplodedViewTool.ts:46](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/ExplodedViewTool.ts#L46)


<a name="classescognite_reveal_toolsgeomaptoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / GeomapTool

## Class: GeomapTool

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).GeomapTool

### Hierarchy

- [`Cognite3DViewerToolBase`](#classescognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **`GeomapTool`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [dispose](#dispose)
- [latLongToWorldCoordinates](#latlongtoworldcoordinates)
- [off](#off)

### Constructors

#### constructor

• **new GeomapTool**(`viewer`, `config`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](#classescognite_revealcognite3dviewermd) |
| `config` | [`MapConfig`](#mapconfig) |

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[packages/tools/src/Geomap/GeomapTool.ts:19](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/GeomapTool.ts#L19)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[packages/tools/src/Geomap/GeomapTool.ts:36](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/GeomapTool.ts#L36)

___

#### latLongToWorldCoordinates

▸ **latLongToWorldCoordinates**(`latLong`): `Object`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `latLong` | `LatLongPosition` |  |

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

##### Defined in

[packages/tools/src/Geomap/GeomapTool.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/GeomapTool.ts#L32)

___

#### off

▸ **off**(`event`, `handler`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` |  |
| `handler` | () => `void` |  |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)


<a name="classescognite_reveal_toolshtmloverlaytoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / HtmlOverlayTool

## Class: HtmlOverlayTool

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).HtmlOverlayTool

### Hierarchy

- [`Cognite3DViewerToolBase`](#classescognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **`HtmlOverlayTool`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Accessors

- [elements](#elements)

#### Methods

- [add](#add)
- [clear](#clear)
- [dispose](#dispose)
- [forceUpdate](#forceupdate)
- [off](#off)
- [remove](#remove)
- [visible](#visible)

### Constructors

#### constructor

• **new HtmlOverlayTool**(`viewer`, `options?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](#classescognite_revealcognite3dviewermd) |
| `options?` | `HtmlOverlayToolOptions` |

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:166](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L166)

### Accessors

#### elements

• `get` **elements**(): { `element`: `HTMLElement` ; `position3D`: `Vector3`  }[]

##### Returns

{ `element`: `HTMLElement` ; `position3D`: `Vector3`  }[]

##### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:186](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L186)

### Methods

#### add

▸ **add**(`htmlElement`, `position3D`, `options?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `htmlElement` | `HTMLElement` |  |
| `position3D` | `Vector3` |  |
| `options` | [`HtmlOverlayOptions`](#htmloverlayoptions) |  |

##### Returns

`void`

##### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:210](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L210)

___

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:258](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L258)

___

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:196](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L196)

___

#### forceUpdate

▸ **forceUpdate**(): `void`

##### Returns

`void`

##### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:292](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L292)

___

#### off

▸ **off**(`event`, `handler`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` |  |
| `handler` | () => `void` |  |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

#### remove

▸ **remove**(`htmlElement`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `htmlElement` | `HTMLElement` |  |

##### Returns

`void`

##### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:246](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L246)

___

#### visible

▸ **visible**(`enable`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `enable` | `boolean` |  |

##### Returns

`void`

##### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:270](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L270)


<a name="classescognite_reveal_toolskeyframemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / Keyframe

## Class: Keyframe

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).Keyframe

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [activate](#activate)
- [assignStyledNodeCollection](#assignstylednodecollection)
- [deactivate](#deactivate)
- [getKeyframeDate](#getkeyframedate)
- [unassignStyledNodeCollection](#unassignstylednodecollection)

### Constructors

#### constructor

• **new Keyframe**(`model`, `date`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [`Cognite3DModel`](#classescognite_revealcognite3dmodelmd) |
| `date` | `Date` |

##### Defined in

[packages/tools/src/Timeline/Keyframe.ts:17](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/Keyframe.ts#L17)

### Methods

#### activate

▸ **activate**(): `void`

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/Keyframe.ts:33](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/Keyframe.ts#L33)

___

#### assignStyledNodeCollection

▸ **assignStyledNodeCollection**(`nodeCollection`, `nodeAppearance`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [`NodeCollection`](#classescognite_revealnodecollectionmd) |  |
| `nodeAppearance` | [`NodeAppearance`](#nodeappearance) |  |

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/Keyframe.ts:54](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/Keyframe.ts#L54)

___

#### deactivate

▸ **deactivate**(): `void`

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/Keyframe.ts:42](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/Keyframe.ts#L42)

___

#### getKeyframeDate

▸ **getKeyframeDate**(): `Date`

##### Returns

`Date`

##### Defined in

[packages/tools/src/Timeline/Keyframe.ts:26](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/Keyframe.ts#L26)

___

#### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [`NodeCollection`](#classescognite_revealnodecollectionmd) |  |

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/Keyframe.ts:69](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/Keyframe.ts#L69)


<a name="classescognite_reveal_toolstimelinetoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / TimelineTool

## Class: TimelineTool

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).TimelineTool

### Hierarchy

- [`Cognite3DViewerToolBase`](#classescognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **`TimelineTool`**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Methods

- [createKeyframe](#createkeyframe)
- [dispose](#dispose)
- [getAllKeyframes](#getallkeyframes)
- [getKeyframeByDate](#getkeyframebydate)
- [off](#off)
- [pause](#pause)
- [play](#play)
- [removeKeyframe](#removekeyframe)
- [removeKeyframeByDate](#removekeyframebydate)
- [resume](#resume)
- [stop](#stop)
- [subscribe](#subscribe)
- [unsubscribe](#unsubscribe)

### Constructors

#### constructor

• **new TimelineTool**(`cadModel`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `cadModel` | [`Cognite3DModel`](#classescognite_revealcognite3dmodelmd) |

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:22](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L22)

### Methods

#### createKeyframe

▸ **createKeyframe**(`date`): [`Keyframe`](#classescognite_reveal_toolskeyframemd)

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `Date` |  |

##### Returns

[`Keyframe`](#classescognite_reveal_toolskeyframemd)

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:63](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L63)

___

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:184](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L184)

___

#### getAllKeyframes

▸ **getAllKeyframes**(): [`Keyframe`](#classescognite_reveal_toolskeyframemd)[]

##### Returns

[`Keyframe`](#classescognite_reveal_toolskeyframemd)[]

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:180](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L180)

___

#### getKeyframeByDate

▸ **getKeyframeByDate**(`date`): [`Keyframe`](#classescognite_reveal_toolskeyframemd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `date` | `Date` |

##### Returns

[`Keyframe`](#classescognite_reveal_toolskeyframemd)

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:76](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L76)

___

#### off

▸ **off**(`event`, `handler`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"disposed"`` |  |
| `handler` | () => `void` |  |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

#### pause

▸ **pause**(): `void`

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:161](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L161)

___

#### play

▸ **play**(`startDate`, `endDate`, `totalDurationInMilliSeconds`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `startDate` | `Date` |  |
| `endDate` | `Date` |  |
| `totalDurationInMilliSeconds` | `number` |  |

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:110](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L110)

___

#### removeKeyframe

▸ **removeKeyframe**(`keyframe`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `keyframe` | [`Keyframe`](#classescognite_reveal_toolskeyframemd) |  |

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:84](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L84)

___

#### removeKeyframeByDate

▸ **removeKeyframeByDate**(`date`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `Date` |  |

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:96](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L96)

___

#### resume

▸ **resume**(): `void`

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:170](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L170)

___

#### stop

▸ **stop**(): `void`

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:151](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L151)

___

#### subscribe

▸ **subscribe**(`event`, `listener`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"dateChanged"`` |  |
| `listener` | [`TimelineDateUpdateDelegate`](#timelinedateupdatedelegate) |  |

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:34](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L34)

___

#### unsubscribe

▸ **unsubscribe**(`event`, `listener`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"dateChanged"`` |  |
| `listener` | [`TimelineDateUpdateDelegate`](#timelinedateupdatedelegate) |  |

##### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:49](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/TimelineTool.ts#L49)

# Enums


<a name="enumscognite_revealnodeoutlinecolormd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / NodeOutlineColor

## Enumeration: NodeOutlineColor

[@cognite/reveal](#modulescognite_revealmd).NodeOutlineColor

### Table of contents

#### Enumeration Members

- [Black](#black)
- [Blue](#blue)
- [Cyan](#cyan)
- [Green](#green)
- [NoOutline](#nooutline)
- [Orange](#orange)
- [Red](#red)
- [White](#white)

### Enumeration Members

#### Black

• **Black** = ``2``

##### Defined in

[packages/cad-styling/src/NodeAppearance.ts:8](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearance.ts#L8)

___

#### Blue

• **Blue** = ``4``

##### Defined in

[packages/cad-styling/src/NodeAppearance.ts:10](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearance.ts#L10)

___

#### Cyan

• **Cyan** = ``3``

##### Defined in

[packages/cad-styling/src/NodeAppearance.ts:9](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearance.ts#L9)

___

#### Green

• **Green** = ``5``

##### Defined in

[packages/cad-styling/src/NodeAppearance.ts:11](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearance.ts#L11)

___

#### NoOutline

• **NoOutline** = ``0``

##### Defined in

[packages/cad-styling/src/NodeAppearance.ts:6](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearance.ts#L6)

___

#### Orange

• **Orange** = ``7``

##### Defined in

[packages/cad-styling/src/NodeAppearance.ts:13](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearance.ts#L13)

___

#### Red

• **Red** = ``6``

##### Defined in

[packages/cad-styling/src/NodeAppearance.ts:12](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearance.ts#L12)

___

#### White

• **White** = ``1``

##### Defined in

[packages/cad-styling/src/NodeAppearance.ts:7](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearance.ts#L7)


<a name="enumscognite_revealpotreepointcolortypemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / PotreePointColorType

## Enumeration: PotreePointColorType

[@cognite/reveal](#modulescognite_revealmd).PotreePointColorType

### Table of contents

#### Enumeration Members

- [Classification](#classification)
- [Color](#color)
- [Composite](#composite)
- [Depth](#depth)
- [Elevation](#elevation)
- [Height](#height)
- [Intensity](#intensity)
- [IntensityGradient](#intensitygradient)
- [LevelOfDetail](#levelofdetail)
- [Lod](#lod)
- [Normal](#normal)
- [Phong](#phong)
- [PointIndex](#pointindex)
- [ReturnNumber](#returnnumber)
- [Rgb](#rgb)
- [RgbHeight](#rgbheight)
- [Source](#source)

### Enumeration Members

#### Classification

• **Classification** = ``8``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:34](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L34)

___

#### Color

• **Color** = ``1``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:25](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L25)

___

#### Composite

• **Composite** = ``50``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:40](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L40)

___

#### Depth

• **Depth** = ``2``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:26](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L26)

___

#### Elevation

• **Elevation** = ``3``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:28](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L28)

___

#### Height

• **Height** = ``3``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L27)

___

#### Intensity

• **Intensity** = ``4``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:29](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L29)

___

#### IntensityGradient

• **IntensityGradient** = ``5``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:30](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L30)

___

#### LevelOfDetail

• **LevelOfDetail** = ``6``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L32)

___

#### Lod

• **Lod** = ``6``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:31](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L31)

___

#### Normal

• **Normal** = ``11``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L37)

___

#### Phong

• **Phong** = ``12``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:38](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L38)

___

#### PointIndex

• **PointIndex** = ``7``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:33](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L33)

___

#### ReturnNumber

• **ReturnNumber** = ``9``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:35](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L35)

___

#### Rgb

• **Rgb** = ``0``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:24](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L24)

___

#### RgbHeight

• **RgbHeight** = ``13``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:39](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L39)

___

#### Source

• **Source** = ``10``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:36](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L36)


<a name="enumscognite_revealpotreepointshapemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / PotreePointShape

## Enumeration: PotreePointShape

[@cognite/reveal](#modulescognite_revealmd).PotreePointShape

### Table of contents

#### Enumeration Members

- [Circle](#circle)
- [Paraboloid](#paraboloid)
- [Square](#square)

### Enumeration Members

#### Circle

• **Circle** = ``1``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:9](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L9)

___

#### Paraboloid

• **Paraboloid** = ``2``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:10](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L10)

___

#### Square

• **Square** = ``0``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:8](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L8)


<a name="enumscognite_revealpotreepointsizetypemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / PotreePointSizeType

## Enumeration: PotreePointSizeType

[@cognite/reveal](#modulescognite_revealmd).PotreePointSizeType

### Table of contents

#### Enumeration Members

- [Adaptive](#adaptive)
- [Attenuated](#attenuated)
- [Fixed](#fixed)

### Enumeration Members

#### Adaptive

• **Adaptive** = ``2``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:4](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L4)

___

#### Attenuated

• **Attenuated** = ``1``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:3](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L3)

___

#### Fixed

• **Fixed** = ``0``

##### Defined in

[packages/pointclouds/src/potree-three-loader/rendering/enums.ts:2](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/potree-three-loader/rendering/enums.ts#L2)


<a name="enumscognite_revealwellknownasprspointclasscodesmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / WellKnownAsprsPointClassCodes

## Enumeration: WellKnownAsprsPointClassCodes

[@cognite/reveal](#modulescognite_revealmd).WellKnownAsprsPointClassCodes

### Table of contents

#### Enumeration Members

- [BridgeDeck](#bridgedeck)
- [Building](#building)
- [Created](#created)
- [Default](#default)
- [Ground](#ground)
- [HighNoise](#highnoise)
- [HighVegetation](#highvegetation)
- [IgnoredGround](#ignoredground)
- [LowPoint](#lowpoint)
- [LowVegetation](#lowvegetation)
- [MedVegetation](#medvegetation)
- [OverheadStructure](#overheadstructure)
- [Rail](#rail)
- [ReservedOrBridgeDeck](#reservedorbridgedeck)
- [ReservedOrHighPoint](#reservedorhighpoint)
- [RoadSurface](#roadsurface)
- [Snow](#snow)
- [TemporalExclusion](#temporalexclusion)
- [TransmissionTower](#transmissiontower)
- [Unclassified](#unclassified)
- [UserDefinableOffset](#userdefinableoffset)
- [Water](#water)
- [WireConductor](#wireconductor)
- [WireGuard](#wireguard)
- [WireStructureConnector](#wirestructureconnector)

### Enumeration Members

#### BridgeDeck

• **BridgeDeck** = ``17``

##### Defined in

[packages/pointclouds/src/types.ts:59](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L59)

___

#### Building

• **Building** = ``6``

##### Defined in

[packages/pointclouds/src/types.ts:24](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L24)

___

#### Created

• **Created** = ``0``

##### Defined in

[packages/pointclouds/src/types.ts:18](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L18)

___

#### Default

• **Default** = ``-1``

##### Defined in

[packages/pointclouds/src/types.ts:14](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L14)

___

#### Ground

• **Ground** = ``2``

##### Defined in

[packages/pointclouds/src/types.ts:20](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L20)

___

#### HighNoise

• **HighNoise** = ``18``

##### Defined in

[packages/pointclouds/src/types.ts:65](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L65)

___

#### HighVegetation

• **HighVegetation** = ``5``

##### Defined in

[packages/pointclouds/src/types.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L23)

___

#### IgnoredGround

• **IgnoredGround** = ``20``

##### Defined in

[packages/pointclouds/src/types.ts:73](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L73)

___

#### LowPoint

• **LowPoint** = ``7``

##### Defined in

[packages/pointclouds/src/types.ts:28](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L28)

___

#### LowVegetation

• **LowVegetation** = ``3``

##### Defined in

[packages/pointclouds/src/types.ts:21](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L21)

___

#### MedVegetation

• **MedVegetation** = ``4``

##### Defined in

[packages/pointclouds/src/types.ts:22](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L22)

___

#### OverheadStructure

• **OverheadStructure** = ``19``

##### Defined in

[packages/pointclouds/src/types.ts:69](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L69)

___

#### Rail

• **Rail** = ``10``

##### Defined in

[packages/pointclouds/src/types.ts:35](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L35)

___

#### ReservedOrBridgeDeck

• **ReservedOrBridgeDeck** = ``12``

##### Defined in

[packages/pointclouds/src/types.ts:41](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L41)

___

#### ReservedOrHighPoint

• **ReservedOrHighPoint** = ``8``

##### Defined in

[packages/pointclouds/src/types.ts:33](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L33)

___

#### RoadSurface

• **RoadSurface** = ``11``

##### Defined in

[packages/pointclouds/src/types.ts:36](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L36)

___

#### Snow

• **Snow** = ``21``

##### Defined in

[packages/pointclouds/src/types.ts:74](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L74)

___

#### TemporalExclusion

• **TemporalExclusion** = ``22``

##### Defined in

[packages/pointclouds/src/types.ts:79](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L79)

___

#### TransmissionTower

• **TransmissionTower** = ``15``

##### Defined in

[packages/pointclouds/src/types.ts:50](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L50)

___

#### Unclassified

• **Unclassified** = ``1``

##### Defined in

[packages/pointclouds/src/types.ts:19](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L19)

___

#### UserDefinableOffset

• **UserDefinableOffset** = ``64``

##### Defined in

[packages/pointclouds/src/types.ts:85](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L85)

___

#### Water

• **Water** = ``9``

##### Defined in

[packages/pointclouds/src/types.ts:34](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L34)

___

#### WireConductor

• **WireConductor** = ``14``

##### Defined in

[packages/pointclouds/src/types.ts:49](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L49)

___

#### WireGuard

• **WireGuard** = ``13``

##### Defined in

[packages/pointclouds/src/types.ts:45](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L45)

___

#### WireStructureConnector

• **WireStructureConnector** = ``16``

##### Defined in

[packages/pointclouds/src/types.ts:54](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/types.ts#L54)


<a name="enumscognite_reveal_extensions_datasourcefile3dformatmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd) / File3dFormat

## Enumeration: File3dFormat

[@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd).File3dFormat

### Table of contents

#### Enumeration Members

- [AnyFormat](#anyformat)
- [EptPointCloud](#eptpointcloud)
- [GltfCadModel](#gltfcadmodel)
- [RevealCadModel](#revealcadmodel)

### Enumeration Members

#### AnyFormat

• **AnyFormat** = ``"all-outputs"``

##### Defined in

[packages/modeldata-api/src/types.ts:41](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/types.ts#L41)

___

#### EptPointCloud

• **EptPointCloud** = ``"ept-pointcloud"``

##### Defined in

[packages/modeldata-api/src/types.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/types.ts#L32)

___

#### GltfCadModel

• **GltfCadModel** = ``"gltf-directory"``

##### Defined in

[packages/modeldata-api/src/types.ts:40](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/types.ts#L40)

___

#### RevealCadModel

• **RevealCadModel** = ``"reveal-directory"``

##### Defined in

[packages/modeldata-api/src/types.ts:36](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/types.ts#L36)


<a name="enumscognite_reveal_toolsbingmapimageformatmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / BingMapImageFormat

## Enumeration: BingMapImageFormat

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).BingMapImageFormat

### Table of contents

#### Enumeration Members

- [GIF](#gif)
- [JPEG](#jpeg)
- [PNG](#png)

### Enumeration Members

#### GIF

• **GIF** = ``"gif"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:87](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L87)

___

#### JPEG

• **JPEG** = ``"jpeg"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:88](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L88)

___

#### PNG

• **PNG** = ``"png"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:89](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L89)


<a name="enumscognite_reveal_toolsbingmaptypemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / BingMapType

## Enumeration: BingMapType

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).BingMapType

### Table of contents

#### Enumeration Members

- [Aerial](#aerial)
- [Aerial\_Labels](#aerial_labels)
- [Oblique](#oblique)
- [Oblique\_Labels](#oblique_labels)
- [Road](#road)

### Enumeration Members

#### Aerial

• **Aerial** = ``"a"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:76](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L76)

___

#### Aerial\_Labels

• **Aerial\_Labels** = ``"h"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:78](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L78)

___

#### Oblique

• **Oblique** = ``"o"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:79](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L79)

___

#### Oblique\_Labels

• **Oblique\_Labels** = ``"b"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:80](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L80)

___

#### Road

• **Road** = ``"r"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:77](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L77)


<a name="enumscognite_reveal_toolscornermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / Corner

## Enumeration: Corner

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).Corner

### Table of contents

#### Enumeration Members

- [BottomLeft](#bottomleft)
- [BottomRight](#bottomright)
- [TopLeft](#topleft)
- [TopRight](#topright)

### Enumeration Members

#### BottomLeft

• **BottomLeft** = ``2``

##### Defined in

[packages/tools/src/AxisView/types.ts:100](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/AxisView/types.ts#L100)

___

#### BottomRight

• **BottomRight** = ``3``

##### Defined in

[packages/tools/src/AxisView/types.ts:101](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/AxisView/types.ts#L101)

___

#### TopLeft

• **TopLeft** = ``1``

##### Defined in

[packages/tools/src/AxisView/types.ts:99](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/AxisView/types.ts#L99)

___

#### TopRight

• **TopRight** = ``0``

##### Defined in

[packages/tools/src/AxisView/types.ts:98](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/AxisView/types.ts#L98)


<a name="enumscognite_reveal_toolsheremapimageformatmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / HereMapImageFormat

## Enumeration: HereMapImageFormat

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).HereMapImageFormat

### Table of contents

#### Enumeration Members

- [JPG](#jpg)
- [PNG](#png)
- [PNG8](#png8)

### Enumeration Members

#### JPG

• **JPG** = ``"jpg"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:118](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L118)

___

#### PNG

• **PNG** = ``"png"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:116](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L116)

___

#### PNG8

• **PNG8** = ``"png8"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:117](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L117)


<a name="enumscognite_reveal_toolsheremapschememd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / HereMapScheme

## Enumeration: HereMapScheme

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).HereMapScheme

### Table of contents

#### Enumeration Members

- [Day](#day)
- [Night](#night)
- [Satellite](#satellite)
- [Terrain](#terrain)

### Enumeration Members

#### Day

• **Day** = ``"normal.day"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:106](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L106)

___

#### Night

• **Night** = ``"normal.night"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:107](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L107)

___

#### Satellite

• **Satellite** = ``"satellite.day"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:109](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L109)

___

#### Terrain

• **Terrain** = ``"terrain.day"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:108](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L108)


<a name="enumscognite_reveal_toolsheremaptypemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / HereMapType

## Enumeration: HereMapType

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).HereMapType

### Table of contents

#### Enumeration Members

- [Aerial](#aerial)
- [Base](#base)
- [Pano](#pano)
- [Traffic](#traffic)

### Enumeration Members

#### Aerial

• **Aerial** = ``"aerial"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:96](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L96)

___

#### Base

• **Base** = ``"base"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:97](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L97)

___

#### Pano

• **Pano** = ``"pano"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:98](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L98)

___

#### Traffic

• **Traffic** = ``"traffic"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:99](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L99)


<a name="enumscognite_reveal_toolsmapprovidersmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / MapProviders

## Enumeration: MapProviders

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).MapProviders

### Table of contents

#### Enumeration Members

- [BingMap](#bingmap)
- [HereMap](#heremap)
- [MapboxMap](#mapboxmap)
- [OpenStreetMap](#openstreetmap)

### Enumeration Members

#### BingMap

• **BingMap** = ``"BingMap"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:9](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L9)

___

#### HereMap

• **HereMap** = ``"HereMap"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:10](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L10)

___

#### MapboxMap

• **MapboxMap** = ``"MapboxMap"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:11](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L11)

___

#### OpenStreetMap

• **OpenStreetMap** = ``"OpenStreetMap"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:12](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L12)


<a name="enumscognite_reveal_toolsmapboximageformatmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / MapboxImageFormat

## Enumeration: MapboxImageFormat

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).MapboxImageFormat

### Table of contents

#### Enumeration Members

- [JPG70](#jpg70)
- [JPG80](#jpg80)
- [JPG90](#jpg90)
- [PNG](#png)
- [PNG128](#png128)
- [PNG256](#png256)
- [PNG32](#png32)
- [PNG64](#png64)
- [PNGRAW](#pngraw)

### Enumeration Members

#### JPG70

• **JPG70** = ``"jpg70"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:66](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L66)

___

#### JPG80

• **JPG80** = ``"jpg80"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:67](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L67)

___

#### JPG90

• **JPG90** = ``"jpg90"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:68](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L68)

___

#### PNG

• **PNG** = ``"png"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:61](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L61)

___

#### PNG128

• **PNG128** = ``"png128"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:64](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L64)

___

#### PNG256

• **PNG256** = ``"png256"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:65](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L65)

___

#### PNG32

• **PNG32** = ``"png32"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:62](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L62)

___

#### PNG64

• **PNG64** = ``"png64"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:63](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L63)

___

#### PNGRAW

• **PNGRAW** = ``"pngraw"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:69](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L69)


<a name="enumscognite_reveal_toolsmapboxmodemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / MapboxMode

## Enumeration: MapboxMode

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).MapboxMode

### Table of contents

#### Enumeration Members

- [Map\_Id](#map_id)
- [Style](#style)

### Enumeration Members

#### Map\_Id

• **Map\_Id** = ``101``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:26](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L26)

___

#### Style

• **Style** = ``100``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:22](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L22)


<a name="enumscognite_reveal_toolsmapboxstylemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modulescognite_reveal_toolsmd) / MapboxStyle

## Enumeration: MapboxStyle

[@cognite/reveal/tools](#modulescognite_reveal_toolsmd).MapboxStyle

### Table of contents

#### Enumeration Members

- [Dark](#dark)
- [Light](#light)
- [Navigation\_Day](#navigation_day)
- [Navigation\_Guide\_Day](#navigation_guide_day)
- [Navigation\_Guide\_Night](#navigation_guide_night)
- [Navigation\_Night](#navigation_night)
- [Outdoor](#outdoor)
- [Satellite](#satellite)
- [Satellite\_Streets](#satellite_streets)
- [Streets](#streets)

### Enumeration Members

#### Dark

• **Dark** = ``"mapbox/dark-v9"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L37)

___

#### Light

• **Light** = ``"mapbox/light-v9"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:36](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L36)

___

#### Navigation\_Day

• **Navigation\_Day** = ``"mapbox/navigation-preview-day-v4"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:40](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L40)

___

#### Navigation\_Guide\_Day

• **Navigation\_Guide\_Day** = ``"mapbox/navigation-guidance-day-v4"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:42](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L42)

___

#### Navigation\_Guide\_Night

• **Navigation\_Guide\_Night** = ``"mapbox/navigation-guidance-night-v4"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:43](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L43)

___

#### Navigation\_Night

• **Navigation\_Night** = ``"mapbox/navigation-preview-night-v4"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:41](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L41)

___

#### Outdoor

• **Outdoor** = ``"mapbox/outdoors-v10"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:35](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L35)

___

#### Satellite

• **Satellite** = ``"mapbox/satellite-v9"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:38](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L38)

___

#### Satellite\_Streets

• **Satellite\_Streets** = ``"mapbox/satellite-streets-v10"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:39](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L39)

___

#### Streets

• **Streets** = ``"mapbox/streets-v10"``

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:34](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L34)

# Interfaces


<a name="interfacescognite_revealaddmodeloptionsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / AddModelOptions

## Interface: AddModelOptions

[@cognite/reveal](#modulescognite_revealmd).AddModelOptions

### Table of contents

#### Properties

- [geometryFilter](#geometryfilter)
- [localPath](#localpath)
- [modelId](#modelid)
- [revisionId](#revisionid)

### Properties

#### geometryFilter

• `Optional` **geometryFilter**: [`GeometryFilter`](#geometryfilter)

##### Defined in

[packages/api/src/public/migration/types.ts:156](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L156)

___

#### localPath

• `Optional` **localPath**: `string`

##### Defined in

[packages/api/src/public/migration/types.ts:155](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L155)

___

#### modelId

• **modelId**: `number`

##### Defined in

[packages/api/src/public/migration/types.ts:152](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L152)

___

#### revisionId

• **revisionId**: `number`

##### Defined in

[packages/api/src/public/migration/types.ts:153](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L153)


<a name="interfacescognite_revealareacollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / AreaCollection

## Interface: AreaCollection

[@cognite/reveal](#modulescognite_revealmd).AreaCollection

### Implemented by

- [`ClusteredAreaCollection`](#classescognite_revealclusteredareacollectionmd)

### Table of contents

#### Properties

- [isEmpty](#isempty)

#### Methods

- [addAreas](#addareas)
- [areas](#areas)
- [intersectWith](#intersectwith)
- [intersectsBox](#intersectsbox)

### Properties

#### isEmpty

• `Readonly` **isEmpty**: `boolean`

##### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:16](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L16)

### Methods

#### addAreas

▸ **addAreas**(`boxes`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `boxes` | `Iterable`<`Box3`\> |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:34](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L34)

___

#### areas

▸ **areas**(): `Generator`<`Box3`, `any`, `unknown`\>

##### Returns

`Generator`<`Box3`, `any`, `unknown`\>

##### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L23)

___

#### intersectWith

▸ **intersectWith**(`boxes`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `boxes` | `Iterable`<`Box3`\> |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:43](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L43)

___

#### intersectsBox

▸ **intersectsBox**(`box`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `box` | `Box3` |

##### Returns

`boolean`

##### Defined in

[packages/cad-styling/src/prioritized/AreaCollection.ts:28](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L28)


<a name="interfacescognite_revealcameramanagermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / CameraManager

## Interface: CameraManager

[@cognite/reveal](#modulescognite_revealmd).CameraManager

### Implemented by

- [`DefaultCameraManager`](#classescognite_revealdefaultcameramanagermd)

### Table of contents

#### Methods

- [dispose](#dispose)
- [fitCameraToBoundingBox](#fitcameratoboundingbox)
- [getCamera](#getcamera)
- [getCameraState](#getcamerastate)
- [off](#off)
- [on](#on)
- [setCameraState](#setcamerastate)
- [update](#update)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:77](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/CameraManager.ts#L77)

___

#### fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`boundingBox`, `duration?`, `radiusFactor?`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `boundingBox` | `Box3` | - |
| `duration?` | `number` |  |
| `radiusFactor?` | `number` |  |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:65](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/CameraManager.ts#L65)

___

#### getCamera

▸ **getCamera**(): `PerspectiveCamera`

##### Returns

`PerspectiveCamera`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:21](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/CameraManager.ts#L21)

___

#### getCameraState

▸ **getCameraState**(): `Required`<[`CameraState`](#camerastate)\>

##### Returns

`Required`<[`CameraState`](#camerastate)\>

##### Defined in

[packages/camera-manager/src/CameraManager.ts:44](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/CameraManager.ts#L44)

___

#### off

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` |  |
| `callback` | [`CameraChangeDelegate`](#camerachangedelegate) |  |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:57](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/CameraManager.ts#L57)

___

#### on

▸ **on**(`event`, `callback`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` |  |
| `callback` | [`CameraChangeDelegate`](#camerachangedelegate) |  |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:51](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/CameraManager.ts#L51)

___

#### setCameraState

▸ **setCameraState**(`state`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`CameraState`](#camerastate) |  |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:38](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/CameraManager.ts#L38)

___

#### update

▸ **update**(`deltaTime`, `boundingBox`): `void`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deltaTime` | `number` |  |
| `boundingBox` | `Box3` |  |

##### Returns

`void`

##### Defined in

[packages/camera-manager/src/CameraManager.ts:73](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/CameraManager.ts#L73)


<a name="interfacescognite_revealcdfmodelnodecollectiondataprovidermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / CdfModelNodeCollectionDataProvider

## Interface: CdfModelNodeCollectionDataProvider

[@cognite/reveal](#modulescognite_revealmd).CdfModelNodeCollectionDataProvider

### Implemented by

- [`Cognite3DModel`](#classescognite_revealcognite3dmodelmd)

### Table of contents

#### Properties

- [modelId](#modelid)
- [nodeCount](#nodecount)
- [revisionId](#revisionid)

#### Methods

- [mapBoxFromCdfToModelCoordinates](#mapboxfromcdftomodelcoordinates)
- [mapBoxFromModelToCdfCoordinates](#mapboxfrommodeltocdfcoordinates)

### Properties

#### modelId

• **modelId**: `number`

##### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:29](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L29)

___

#### nodeCount

• **nodeCount**: `number`

##### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:24](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L24)

___

#### revisionId

• **revisionId**: `number`

##### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:30](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L30)

### Methods

#### mapBoxFromCdfToModelCoordinates

▸ **mapBoxFromCdfToModelCoordinates**(`box`, `out?`): `Box3`

##### Parameters

| Name | Type |
| :------ | :------ |
| `box` | `Box3` |
| `out?` | `Box3` |

##### Returns

`Box3`

##### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:19](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L19)

___

#### mapBoxFromModelToCdfCoordinates

▸ **mapBoxFromModelToCdfCoordinates**(`box`, `out?`): `Box3`

##### Parameters

| Name | Type |
| :------ | :------ |
| `box` | `Box3` |
| `out?` | `Box3` |

##### Returns

`Box3`

##### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:14](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L14)


<a name="interfacescognite_revealcognite3dvieweroptionsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / Cognite3DViewerOptions

## Interface: Cognite3DViewerOptions

[@cognite/reveal](#modulescognite_revealmd).Cognite3DViewerOptions

### Table of contents

#### Properties

- [antiAliasingHint](#antialiasinghint)
- [cameraManager](#cameramanager)
- [continuousModelStreaming](#continuousmodelstreaming)
- [customDataSource](#customdatasource)
- [domElement](#domelement)
- [enableEdges](#enableedges)
- [loadingIndicatorStyle](#loadingindicatorstyle)
- [logMetrics](#logmetrics)
- [onLoading](#onloading)
- [renderTargetOptions](#rendertargetoptions)
- [renderer](#renderer)
- [sdk](#sdk)
- [ssaoQualityHint](#ssaoqualityhint)

### Properties

#### antiAliasingHint

• `Optional` **antiAliasingHint**: ``"disabled"`` \| ``"fxaa"`` \| ``"msaa2+fxaa"`` \| ``"msaa4+fxaa"`` \| ``"msaa8+fxaa"`` \| ``"msaa16+fxaa"`` \| ``"msaa2"`` \| ``"msaa4"`` \| ``"msaa8"`` \| ``"msaa16"``

##### Defined in

[packages/api/src/public/migration/types.ts:84](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L84)

___

#### cameraManager

• `Optional` **cameraManager**: [`CameraManager`](#interfacescognite_revealcameramanagermd)

##### Defined in

[packages/api/src/public/migration/types.ts:64](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L64)

___

#### continuousModelStreaming

• `Optional` **continuousModelStreaming**: `boolean`

##### Defined in

[packages/api/src/public/migration/types.ts:129](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L129)

___

#### customDataSource

• `Optional` **customDataSource**: [`DataSource`](#interfacescognite_reveal_extensions_datasourcedatasourcemd)

##### Defined in

[packages/api/src/public/migration/types.ts:120](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L120)

___

#### domElement

• `Optional` **domElement**: `HTMLElement`

##### Defined in

[packages/api/src/public/migration/types.ts:33](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L33)

___

#### enableEdges

• `Optional` **enableEdges**: `boolean`

##### Defined in

[packages/api/src/public/migration/types.ts:105](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L105)

___

#### loadingIndicatorStyle

• `Optional` **loadingIndicatorStyle**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `opacity` | `number` |  |
| `placement` | ``"topLeft"`` \| ``"topRight"`` \| ``"bottomLeft"`` \| ``"bottomRight"`` |  |

##### Defined in

[packages/api/src/public/migration/types.ts:46](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L46)

___

#### logMetrics

• `Optional` **logMetrics**: `boolean`

##### Defined in

[packages/api/src/public/migration/types.ts:36](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L36)

___

#### onLoading

• `Optional` **onLoading**: [`OnLoadingCallback`](#onloadingcallback)

##### Defined in

[packages/api/src/public/migration/types.ts:108](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L108)

___

#### renderTargetOptions

• `Optional` **renderTargetOptions**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `autoSetSize?` | `boolean` |
| `target` | `WebGLRenderTarget` |

##### Defined in

[packages/api/src/public/migration/types.ts:41](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L41)

___

#### renderer

• `Optional` **renderer**: `WebGLRenderer`

##### Defined in

[packages/api/src/public/migration/types.ts:66](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L66)

___

#### sdk

• **sdk**: `default`

##### Defined in

[packages/api/src/public/migration/types.ts:30](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L30)

___

#### ssaoQualityHint

• `Optional` **ssaoQualityHint**: ``"disabled"`` \| ``"medium"`` \| ``"high"`` \| ``"veryhigh"``

##### Defined in

[packages/api/src/public/migration/types.ts:100](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L100)


<a name="interfacescognite_revealcognitemodelbasemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / CogniteModelBase

## Interface: CogniteModelBase

[@cognite/reveal](#modulescognite_revealmd).CogniteModelBase

### Implemented by

- [`Cognite3DModel`](#classescognite_revealcognite3dmodelmd)
- [`CognitePointCloudModel`](#classescognite_revealcognitepointcloudmodelmd)

### Table of contents

#### Properties

- [type](#type)

#### Methods

- [dispose](#dispose)
- [getCameraConfiguration](#getcameraconfiguration)
- [getModelBoundingBox](#getmodelboundingbox)
- [getModelTransformation](#getmodeltransformation)
- [setModelTransformation](#setmodeltransformation)

### Properties

#### type

• `Readonly` **type**: [`SupportedModelTypes`](#supportedmodeltypes)

##### Defined in

[packages/model-base/src/CogniteModelBase.ts:13](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/model-base/src/CogniteModelBase.ts#L13)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Defined in

[packages/model-base/src/CogniteModelBase.ts:14](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/model-base/src/CogniteModelBase.ts#L14)

___

#### getCameraConfiguration

▸ **getCameraConfiguration**(): [`CameraConfiguration`](#cameraconfiguration)

##### Returns

[`CameraConfiguration`](#cameraconfiguration)

##### Defined in

[packages/model-base/src/CogniteModelBase.ts:16](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/model-base/src/CogniteModelBase.ts#L16)

___

#### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`, `restrictToMostGeometry?`): `Box3`

##### Parameters

| Name | Type |
| :------ | :------ |
| `outBbox?` | `Box3` |
| `restrictToMostGeometry?` | `boolean` |

##### Returns

`Box3`

##### Defined in

[packages/model-base/src/CogniteModelBase.ts:15](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/model-base/src/CogniteModelBase.ts#L15)

___

#### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

##### Parameters

| Name | Type |
| :------ | :------ |
| `out?` | `Matrix4` |

##### Returns

`Matrix4`

##### Defined in

[packages/model-base/src/CogniteModelBase.ts:18](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/model-base/src/CogniteModelBase.ts#L18)

___

#### setModelTransformation

▸ **setModelTransformation**(`matrix`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | `Matrix4` |

##### Returns

`void`

##### Defined in

[packages/model-base/src/CogniteModelBase.ts:17](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/model-base/src/CogniteModelBase.ts#L17)


<a name="interfacescognite_revealintersectionfrompixeloptionsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modulescognite_revealmd) / IntersectionFromPixelOptions

## Interface: IntersectionFromPixelOptions

[@cognite/reveal](#modulescognite_revealmd).IntersectionFromPixelOptions

### Table of contents

#### Properties

- [pointIntersectionThreshold](#pointintersectionthreshold)

### Properties

#### pointIntersectionThreshold

• `Optional` **pointIntersectionThreshold**: `number`

##### Defined in

[packages/api/src/public/migration/types.ts:206](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L206)


<a name="interfacescognite_reveal_extensions_datasourcebloboutputmetadatamd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd) / BlobOutputMetadata

## Interface: BlobOutputMetadata

[@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd).BlobOutputMetadata

### Table of contents

#### Properties

- [blobId](#blobid)
- [format](#format)
- [version](#version)

### Properties

#### blobId

• **blobId**: `number`

##### Defined in

[packages/modeldata-api/src/types.ts:45](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/types.ts#L45)

___

#### format

• **format**: `string`

##### Defined in

[packages/modeldata-api/src/types.ts:46](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/types.ts#L46)

___

#### version

• **version**: `number`

##### Defined in

[packages/modeldata-api/src/types.ts:47](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/types.ts#L47)


<a name="interfacescognite_reveal_extensions_datasourcedatasourcemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd) / DataSource

## Interface: DataSource

[@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd).DataSource

### Table of contents

#### Methods

- [getModelDataProvider](#getmodeldataprovider)
- [getModelMetadataProvider](#getmodelmetadataprovider)
- [getNodesApiClient](#getnodesapiclient)

### Methods

#### getModelDataProvider

▸ **getModelDataProvider**(): [`ModelDataProvider`](#interfacescognite_reveal_extensions_datasourcemodeldataprovidermd)

##### Returns

[`ModelDataProvider`](#interfacescognite_reveal_extensions_datasourcemodeldataprovidermd)

##### Defined in

[packages/data-source/src/DataSource.ts:28](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/data-source/src/DataSource.ts#L28)

___

#### getModelMetadataProvider

▸ **getModelMetadataProvider**(): [`ModelMetadataProvider`](#interfacescognite_reveal_extensions_datasourcemodelmetadataprovidermd)

##### Returns

[`ModelMetadataProvider`](#interfacescognite_reveal_extensions_datasourcemodelmetadataprovidermd)

##### Defined in

[packages/data-source/src/DataSource.ts:22](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/data-source/src/DataSource.ts#L22)

___

#### getNodesApiClient

▸ **getNodesApiClient**(): [`NodesApiClient`](#interfacescognite_reveal_extensions_datasourcenodesapiclientmd)

##### Returns

[`NodesApiClient`](#interfacescognite_reveal_extensions_datasourcenodesapiclientmd)

##### Defined in

[packages/data-source/src/DataSource.ts:17](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/data-source/src/DataSource.ts#L17)


<a name="interfacescognite_reveal_extensions_datasourcemodeldataprovidermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd) / ModelDataProvider

## Interface: ModelDataProvider

[@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd).ModelDataProvider

### Hierarchy

- `JsonFileProvider`

- `BinaryFileProvider`

  ↳ **`ModelDataProvider`**

### Table of contents

#### Methods

- [getBinaryFile](#getbinaryfile)
- [getJsonFile](#getjsonfile)

### Methods

#### getBinaryFile

▸ **getBinaryFile**(`baseUrl`, `fileName`): `Promise`<`ArrayBuffer`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseUrl` | `string` |  |
| `fileName` | `string` |  |

##### Returns

`Promise`<`ArrayBuffer`\>

##### Overrides

BinaryFileProvider.getBinaryFile

##### Defined in

[packages/modeldata-api/src/types.ts:28](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/types.ts#L28)

___

#### getJsonFile

▸ **getJsonFile**(`baseUrl`, `fileName`): `Promise`<`any`\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseUrl` | `string` |  |
| `fileName` | `string` |  |

##### Returns

`Promise`<`any`\>

##### Overrides

JsonFileProvider.getJsonFile

##### Defined in

[packages/modeldata-api/src/types.ts:22](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/types.ts#L22)


<a name="interfacescognite_reveal_extensions_datasourcemodelidentifiermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd) / ModelIdentifier

## Interface: ModelIdentifier

[@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd).ModelIdentifier

### Implemented by

- [`CdfModelIdentifier`](#classescognite_reveal_extensions_datasourcecdfmodelidentifiermd)

### Table of contents

#### Properties

- [revealInternalId](#revealinternalid)

### Properties

#### revealInternalId

• `Readonly` **revealInternalId**: `symbol`

##### Defined in

[packages/modeldata-api/src/ModelIdentifier.ts:12](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/ModelIdentifier.ts#L12)


<a name="interfacescognite_reveal_extensions_datasourcemodelmetadataprovidermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd) / ModelMetadataProvider

## Interface: ModelMetadataProvider

[@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd).ModelMetadataProvider

### Table of contents

#### Methods

- [getModelCamera](#getmodelcamera)
- [getModelMatrix](#getmodelmatrix)
- [getModelOutputs](#getmodeloutputs)
- [getModelUri](#getmodeluri)

### Methods

#### getModelCamera

▸ **getModelCamera**(`identifier`): `Promise`<{ `position`: `Vector3` ; `target`: `Vector3`  }\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `identifier` | [`ModelIdentifier`](#interfacescognite_reveal_extensions_datasourcemodelidentifiermd) |

##### Returns

`Promise`<{ `position`: `Vector3` ; `target`: `Vector3`  }\>

##### Defined in

[packages/modeldata-api/src/ModelMetadataProvider.ts:14](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/ModelMetadataProvider.ts#L14)

___

#### getModelMatrix

▸ **getModelMatrix**(`identifier`, `format`): `Promise`<`Matrix4`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `identifier` | [`ModelIdentifier`](#interfacescognite_reveal_extensions_datasourcemodelidentifiermd) |
| `format` | `string` |

##### Returns

`Promise`<`Matrix4`\>

##### Defined in

[packages/modeldata-api/src/ModelMetadataProvider.ts:15](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/ModelMetadataProvider.ts#L15)

___

#### getModelOutputs

▸ **getModelOutputs**(`modelIdentifier`): `Promise`<[`BlobOutputMetadata`](#interfacescognite_reveal_extensions_datasourcebloboutputmetadatamd)[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `modelIdentifier` | [`ModelIdentifier`](#interfacescognite_reveal_extensions_datasourcemodelidentifiermd) |

##### Returns

`Promise`<[`BlobOutputMetadata`](#interfacescognite_reveal_extensions_datasourcebloboutputmetadatamd)[]\>

##### Defined in

[packages/modeldata-api/src/ModelMetadataProvider.ts:12](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/ModelMetadataProvider.ts#L12)

___

#### getModelUri

▸ **getModelUri**(`identifier`, `formatMetadata`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `identifier` | [`ModelIdentifier`](#interfacescognite_reveal_extensions_datasourcemodelidentifiermd) |
| `formatMetadata` | [`BlobOutputMetadata`](#interfacescognite_reveal_extensions_datasourcebloboutputmetadatamd) |

##### Returns

`Promise`<`string`\>

##### Defined in

[packages/modeldata-api/src/ModelMetadataProvider.ts:13](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/modeldata-api/src/ModelMetadataProvider.ts#L13)


<a name="interfacescognite_reveal_extensions_datasourcenodesapiclientmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd) / NodesApiClient

## Interface: NodesApiClient

[@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd).NodesApiClient

### Table of contents

#### Methods

- [determineNodeAncestorsByNodeId](#determinenodeancestorsbynodeid)
- [determineTreeIndexAndSubtreeSizesByNodeIds](#determinetreeindexandsubtreesizesbynodeids)
- [getBoundingBoxesByNodeIds](#getboundingboxesbynodeids)
- [mapNodeIdsToTreeIndices](#mapnodeidstotreeindices)
- [mapTreeIndicesToNodeIds](#maptreeindicestonodeids)

### Methods

#### determineNodeAncestorsByNodeId

▸ **determineNodeAncestorsByNodeId**(`modelId`, `revisionId`, `nodeId`, `generation`): `Promise`<{ `subtreeSize`: `number` ; `treeIndex`: `number`  }\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `modelId` | `number` |  |
| `revisionId` | `number` |  |
| `nodeId` | `number` |  |
| `generation` | `number` |  |

##### Returns

`Promise`<{ `subtreeSize`: `number` ; `treeIndex`: `number`  }\>

##### Defined in

[packages/nodes-api/src/NodesApiClient.ts:51](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/nodes-api/src/NodesApiClient.ts#L51)

___

#### determineTreeIndexAndSubtreeSizesByNodeIds

▸ **determineTreeIndexAndSubtreeSizesByNodeIds**(`modelId`, `revisionId`, `nodeIds`): `Promise`<{ `subtreeSize`: `number` ; `treeIndex`: `number`  }[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `modelId` | `number` |
| `revisionId` | `number` |
| `nodeIds` | `number`[] |

##### Returns

`Promise`<{ `subtreeSize`: `number` ; `treeIndex`: `number`  }[]\>

##### Defined in

[packages/nodes-api/src/NodesApiClient.ts:37](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/nodes-api/src/NodesApiClient.ts#L37)

___

#### getBoundingBoxesByNodeIds

▸ **getBoundingBoxesByNodeIds**(`modelId`, `revisionId`, `nodeIds`): `Promise`<`Box3`[]\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `modelId` | `number` |  |
| `revisionId` | `number` |  |
| `nodeIds` | `number`[] |  |

##### Returns

`Promise`<`Box3`[]\>

##### Defined in

[packages/nodes-api/src/NodesApiClient.ts:67](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/nodes-api/src/NodesApiClient.ts#L67)

___

#### mapNodeIdsToTreeIndices

▸ **mapNodeIdsToTreeIndices**(`modelId`, `revisionId`, `nodeIds`): `Promise`<`number`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `modelId` | `number` |
| `revisionId` | `number` |
| `nodeIds` | `number`[] |

##### Returns

`Promise`<`number`[]\>

##### Defined in

[packages/nodes-api/src/NodesApiClient.ts:27](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/nodes-api/src/NodesApiClient.ts#L27)

___

#### mapTreeIndicesToNodeIds

▸ **mapTreeIndicesToNodeIds**(`modelId`, `revisionId`, `treeIndices`): `Promise`<`number`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `modelId` | `number` |
| `revisionId` | `number` |
| `treeIndices` | `number`[] |

##### Returns

`Promise`<`number`[]\>

##### Defined in

[packages/nodes-api/src/NodesApiClient.ts:17](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/nodes-api/src/NodesApiClient.ts#L17)


<a name="modulesmd"></a>

[@cognite/reveal](#readmemd) / Modules

# @cognite/reveal

## Table of contents

### Modules

- [@cognite/reveal](#modulescognite_revealmd)
- [@cognite/reveal/extensions/datasource](#modulescognite_reveal_extensions_datasourcemd)
- [@cognite/reveal/tools](#modulescognite_reveal_toolsmd)

# Modules


<a name="modulescognite_revealmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / @cognite/reveal

## Module: @cognite/reveal

### Table of contents

#### Enumerations

- [NodeOutlineColor](#enumscognite_revealnodeoutlinecolormd)
- [PotreePointColorType](#enumscognite_revealpotreepointcolortypemd)
- [PotreePointShape](#enumscognite_revealpotreepointshapemd)
- [PotreePointSizeType](#enumscognite_revealpotreepointsizetypemd)
- [WellKnownAsprsPointClassCodes](#enumscognite_revealwellknownasprspointclasscodesmd)

#### Classes

- [AnnotationIdPointCloudObjectCollection](#classescognite_revealannotationidpointcloudobjectcollectionmd)
- [AssetNodeCollection](#classescognite_revealassetnodecollectionmd)
- [BoundingBoxClipper](#classescognite_revealboundingboxclippermd)
- [CameraManagerHelper](#classescognite_revealcameramanagerhelpermd)
- [ClusteredAreaCollection](#classescognite_revealclusteredareacollectionmd)
- [Cognite3DModel](#classescognite_revealcognite3dmodelmd)
- [Cognite3DViewer](#classescognite_revealcognite3dviewermd)
- [CognitePointCloudModel](#classescognite_revealcognitepointcloudmodelmd)
- [ComboControls](#classescognite_revealcombocontrolsmd)
- [DefaultCameraManager](#classescognite_revealdefaultcameramanagermd)
- [IndexSet](#classescognite_revealindexsetmd)
- [IntersectionNodeCollection](#classescognite_revealintersectionnodecollectionmd)
- [InvertedNodeCollection](#classescognite_revealinvertednodecollectionmd)
- [NodeAppearanceProvider](#classescognite_revealnodeappearanceprovidermd)
- [NodeCollection](#classescognite_revealnodecollectionmd)
- [NumericRange](#classescognite_revealnumericrangemd)
- [PointCloudObjectCollection](#classescognite_revealpointcloudobjectcollectionmd)
- [PropertyFilterNodeCollection](#classescognite_revealpropertyfilternodecollectionmd)
- [SinglePropertyFilterNodeCollection](#classescognite_revealsinglepropertyfilternodecollectionmd)
- [TreeIndexNodeCollection](#classescognite_revealtreeindexnodecollectionmd)
- [UnionNodeCollection](#classescognite_revealunionnodecollectionmd)

#### Interfaces

- [AddModelOptions](#interfacescognite_revealaddmodeloptionsmd)
- [AreaCollection](#interfacescognite_revealareacollectionmd)
- [CameraManager](#interfacescognite_revealcameramanagermd)
- [CdfModelNodeCollectionDataProvider](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd)
- [Cognite3DViewerOptions](#interfacescognite_revealcognite3dvieweroptionsmd)
- [CogniteModelBase](#interfacescognite_revealcognitemodelbasemd)
- [IntersectionFromPixelOptions](#interfacescognite_revealintersectionfrompixeloptionsmd)

#### Type Aliases

- [CadIntersection](#cadintersection)
- [CadModelBudget](#cadmodelbudget)
- [CameraChangeDelegate](#camerachangedelegate)
- [CameraConfiguration](#cameraconfiguration)
- [CameraControlsOptions](#cameracontrolsoptions)
- [CameraState](#camerastate)
- [CompletePointCloudAppearance](#completepointcloudappearance)
- [DisposedDelegate](#disposeddelegate)
- [GeometryFilter](#geometryfilter)
- [Intersection](#intersection)
- [LoadingStateChangeListener](#loadingstatechangelistener)
- [ModelState](#modelstate)
- [NodeAppearance](#nodeappearance)
- [NodeCollectionDescriptor](#nodecollectiondescriptor)
- [NodeCollectionSerializationContext](#nodecollectionserializationcontext)
- [OnLoadingCallback](#onloadingcallback)
- [PointCloudAppearance](#pointcloudappearance)
- [PointCloudBudget](#pointcloudbudget)
- [PointerEventDelegate](#pointereventdelegate)
- [RevealOptions](#revealoptions)
- [SceneRenderedDelegate](#scenerendereddelegate)
- [SerializedNodeCollection](#serializednodecollection)
- [SupportedModelTypes](#supportedmodeltypes)
- [TypeName](#typename)
- [ViewerState](#viewerstate)
- [WellKnownUnit](#wellknownunit)

#### Variables

- [DefaultNodeAppearance](#defaultnodeappearance)
- [DefaultPointCloudAppearance](#defaultpointcloudappearance)
- [REVEAL\_VERSION](#reveal_version)
- [revealEnv](#revealenv)

#### Functions

- [registerCustomNodeCollectionType](#registercustomnodecollectiontype)

### Type Aliases

#### CadIntersection

Ƭ **CadIntersection**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `distanceToCamera` | `number` |  |
| `model` | [`Cognite3DModel`](#classescognite_revealcognite3dmodelmd) |  |
| `point` | `THREE.Vector3` |  |
| `treeIndex` | `number` |  |
| `type` | ``"cad"`` |  |

##### Defined in

[packages/api/src/public/migration/types.ts:159](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L159)

___

#### CadModelBudget

Ƭ **CadModelBudget**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `highDetailProximityThreshold` | `number` |  |
| `maximumRenderCost` | `number` |  |

##### Defined in

[packages/cad-geometry-loaders/src/CadModelBudget.ts:10](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-geometry-loaders/src/CadModelBudget.ts#L10)

___

#### CameraChangeDelegate

Ƭ **CameraChangeDelegate**: (`position`: `THREE.Vector3`, `target`: `THREE.Vector3`) => `void`

##### Type declaration

▸ (`position`, `target`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `position` | `THREE.Vector3` |
| `target` | `THREE.Vector3` |

###### Returns

`void`

##### Defined in

[packages/camera-manager/src/types.ts:85](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/types.ts#L85)

___

#### CameraConfiguration

Ƭ **CameraConfiguration**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `position` | `THREE.Vector3` |
| `target` | `THREE.Vector3` |

##### Defined in

[packages/utilities/src/CameraConfiguration.ts:8](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/CameraConfiguration.ts#L8)

___

#### CameraControlsOptions

Ƭ **CameraControlsOptions**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `changeCameraTargetOnClick?` | `boolean` |  |
| `mouseWheelAction?` | ``"zoomToTarget"`` \| ``"zoomPastCursor"`` \| ``"zoomToCursor"`` |  |

##### Defined in

[packages/camera-manager/src/types.ts:5](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/types.ts#L5)

___

#### CameraState

Ƭ **CameraState**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `position?` | `THREE.Vector3` |  |
| `rotation?` | `THREE.Quaternion` |  |
| `target?` | `THREE.Vector3` |  |

##### Defined in

[packages/camera-manager/src/types.ts:66](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/camera-manager/src/types.ts#L66)

___

#### CompletePointCloudAppearance

Ƭ **CompletePointCloudAppearance**: `Required`<[`PointCloudAppearance`](#pointcloudappearance)\>

##### Defined in

[packages/pointclouds/src/styling/PointCloudAppearance.ts:10](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/PointCloudAppearance.ts#L10)

___

#### DisposedDelegate

Ƭ **DisposedDelegate**: () => `void`

##### Type declaration

▸ (): `void`

###### Returns

`void`

##### Defined in

[packages/utilities/src/events/types.ts:15](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/events/types.ts#L15)

___

#### GeometryFilter

Ƭ **GeometryFilter**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `boundingBox?` | `THREE.Box3` |  |
| `isBoundingBoxInModelCoordinates?` | `boolean` |  |

##### Defined in

[packages/cad-model/src/types.ts:21](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/types.ts#L21)

___

#### Intersection

Ƭ **Intersection**: [`CadIntersection`](#cadintersection) \| `PointCloudIntersection`

##### Defined in

[packages/api/src/public/migration/types.ts:186](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L186)

___

#### LoadingStateChangeListener

Ƭ **LoadingStateChangeListener**: (`loadingState`: `LoadingState`) => `any`

##### Type declaration

▸ (`loadingState`): `any`

###### Parameters

| Name | Type |
| :------ | :------ |
| `loadingState` | `LoadingState` |

###### Returns

`any`

##### Defined in

[packages/api/src/public/types.ts:29](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/types.ts#L29)

___

#### ModelState

Ƭ **ModelState**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `defaultNodeAppearance` | [`NodeAppearance`](#nodeappearance) |
| `modelId` | `number` |
| `revisionId` | `number` |
| `styledSets` | { `appearance`: [`NodeAppearance`](#nodeappearance) ; `options?`: `any` ; `state`: `any` ; `token`: `string`  }[] |

##### Defined in

[packages/api/src/utilities/ViewStateHelper.ts:31](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/utilities/ViewStateHelper.ts#L31)

___

#### NodeAppearance

Ƭ **NodeAppearance**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `color?` | [`number`, `number`, `number`] |  |
| `outlineColor?` | [`NodeOutlineColor`](#enumscognite_revealnodeoutlinecolormd) |  |
| `prioritizedForLoadingHint?` | `number` |  |
| `renderGhosted?` | `boolean` |  |
| `renderInFront?` | `boolean` |  |
| `visible?` | `boolean` |  |

##### Defined in

[packages/cad-styling/src/NodeAppearance.ts:20](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearance.ts#L20)

___

#### NodeCollectionDescriptor

Ƭ **NodeCollectionDescriptor**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `options?` | `any` |
| `state` | `any` |
| `token` | [`TypeName`](#typename) |

##### Defined in

[packages/cad-styling/src/NodeCollectionDeserializer.ts:22](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L22)

___

#### NodeCollectionSerializationContext

Ƭ **NodeCollectionSerializationContext**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `client` | `CogniteClient` |
| `model` | [`CdfModelNodeCollectionDataProvider`](#interfacescognite_revealcdfmodelnodecollectiondataprovidermd) |

##### Defined in

[packages/cad-styling/src/NodeCollectionDeserializer.ts:21](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L21)

___

#### OnLoadingCallback

Ƭ **OnLoadingCallback**: (`itemsLoaded`: `number`, `itemsRequested`: `number`, `itemsCulled`: `number`) => `void`

##### Type declaration

▸ (`itemsLoaded`, `itemsRequested`, `itemsCulled`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `itemsLoaded` | `number` |
| `itemsRequested` | `number` |
| `itemsCulled` | `number` |

###### Returns

`void`

##### Defined in

[packages/api/src/public/migration/types.ts:23](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/migration/types.ts#L23)

___

#### PointCloudAppearance

Ƭ **PointCloudAppearance**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `color?` | [`number`, `number`, `number`] |
| `visible?` | `boolean` |

##### Defined in

[packages/pointclouds/src/styling/PointCloudAppearance.ts:5](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/PointCloudAppearance.ts#L5)

___

#### PointCloudBudget

Ƭ **PointCloudBudget**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `numberOfPoints` | `number` |  |

##### Defined in

[packages/pointclouds/src/PointCloudBudget.ts:10](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/PointCloudBudget.ts#L10)

___

#### PointerEventDelegate

Ƭ **PointerEventDelegate**: (`event`: { `button?`: `number` ; `offsetX`: `number` ; `offsetY`: `number`  }) => `void`

##### Type declaration

▸ (`event`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.button?` | `number` |
| `event.offsetX` | `number` |
| `event.offsetY` | `number` |

###### Returns

`void`

##### Defined in

[packages/utilities/src/events/types.ts:9](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/events/types.ts#L9)

___

#### RevealOptions

Ƭ **RevealOptions**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `continuousModelStreaming?` | `boolean` |
| `internal?` | { `cad?`: `InternalRevealCadOptions`  } |
| `internal.cad?` | `InternalRevealCadOptions` |
| `logMetrics?` | `boolean` |
| `outputRenderTarget?` | { `autoSize?`: `boolean` ; `target`: `THREE.WebGLRenderTarget`  } |
| `outputRenderTarget.autoSize?` | `boolean` |
| `outputRenderTarget.target` | `THREE.WebGLRenderTarget` |
| `renderOptions?` | `RenderOptions` |

##### Defined in

[packages/api/src/public/types.ts:16](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/public/types.ts#L16)

___

#### SceneRenderedDelegate

Ƭ **SceneRenderedDelegate**: (`event`: { `camera`: `THREE.PerspectiveCamera` ; `frameNumber`: `number` ; `renderTime`: `number` ; `renderer`: `THREE.WebGLRenderer`  }) => `void`

##### Type declaration

▸ (`event`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.camera` | `THREE.PerspectiveCamera` |
| `event.frameNumber` | `number` |
| `event.renderTime` | `number` |
| `event.renderer` | `THREE.WebGLRenderer` |

###### Returns

`void`

##### Defined in

[packages/utilities/src/events/types.ts:21](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/events/types.ts#L21)

___

#### SerializedNodeCollection

Ƭ **SerializedNodeCollection**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `options?` | `any` |
| `state` | `any` |
| `token` | `string` |

##### Defined in

[packages/cad-styling/src/SerializedNodeCollection.ts:4](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/SerializedNodeCollection.ts#L4)

___

#### SupportedModelTypes

Ƭ **SupportedModelTypes**: ``"pointcloud"`` \| ``"cad"``

##### Defined in

[packages/model-base/src/SupportedModelTypes.ts:4](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/model-base/src/SupportedModelTypes.ts#L4)

___

#### TypeName

Ƭ **TypeName**: `string`

##### Defined in

[packages/cad-styling/src/NodeCollectionDeserializer.ts:20](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L20)

___

#### ViewerState

Ƭ **ViewerState**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `camera?` | { `position`: { `x`: `number` ; `y`: `number` ; `z`: `number`  } ; `target`: { `x`: `number` ; `y`: `number` ; `z`: `number`  }  } |
| `camera.position` | { `x`: `number` ; `y`: `number` ; `z`: `number`  } |
| `camera.position.x` | `number` |
| `camera.position.y` | `number` |
| `camera.position.z` | `number` |
| `camera.target` | { `x`: `number` ; `y`: `number` ; `z`: `number`  } |
| `camera.target.x` | `number` |
| `camera.target.y` | `number` |
| `camera.target.z` | `number` |
| `clippingPlanes?` | `ClippingPlanesState`[] |
| `models?` | [`ModelState`](#modelstate)[] |

##### Defined in

[packages/api/src/utilities/ViewStateHelper.ts:15](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/src/utilities/ViewStateHelper.ts#L15)

___

#### WellKnownUnit

Ƭ **WellKnownUnit**: ``"Meters"`` \| ``"Centimeters"`` \| ``"Millimeters"`` \| ``"Micrometers"`` \| ``"Kilometers"`` \| ``"Feet"`` \| ``"Inches"`` \| ``"Yards"`` \| ``"Miles"`` \| ``"Mils"`` \| ``"Microinches"``

##### Defined in

[packages/cad-model/src/types.ts:8](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-model/src/types.ts#L8)

### Variables

#### DefaultNodeAppearance

• `Const` **DefaultNodeAppearance**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `Default` | [`NodeAppearance`](#nodeappearance) |
| `Ghosted` | [`NodeAppearance`](#nodeappearance) |
| `Hidden` | [`NodeAppearance`](#nodeappearance) |
| `Highlighted` | { `color?`: [`number`, `number`, `number`] ; `outlineColor?`: [`NodeOutlineColor`](#enumscognite_revealnodeoutlinecolormd) ; `prioritizedForLoadingHint?`: `number` ; `renderGhosted?`: `boolean` ; `renderInFront?`: `boolean` ; `visible?`: `boolean`  } |
| `Highlighted.color?` | [`number`, `number`, `number`] |
| `Highlighted.outlineColor?` | [`NodeOutlineColor`](#enumscognite_revealnodeoutlinecolormd) |
| `Highlighted.prioritizedForLoadingHint?` | `number` |
| `Highlighted.renderGhosted?` | `boolean` |
| `Highlighted.renderInFront?` | `boolean` |
| `Highlighted.visible?` | `boolean` |
| `InFront` | [`NodeAppearance`](#nodeappearance) |
| `Outlined` | [`NodeAppearance`](#nodeappearance) |

##### Defined in

[packages/cad-styling/src/NodeAppearance.ts:109](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeAppearance.ts#L109)

___

#### DefaultPointCloudAppearance

• `Const` **DefaultPointCloudAppearance**: [`CompletePointCloudAppearance`](#completepointcloudappearance)

##### Defined in

[packages/pointclouds/src/styling/PointCloudAppearance.ts:12](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/pointclouds/src/styling/PointCloudAppearance.ts#L12)

___

#### REVEAL\_VERSION

• `Const` **REVEAL\_VERSION**: `string` = `process.env.VERSION`

##### Defined in

[packages/api/index.ts:15](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/api/index.ts#L15)

___

#### revealEnv

• `Const` **revealEnv**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `publicPath` | `string` |

##### Defined in

[packages/utilities/src/revealEnv.ts:9](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/utilities/src/revealEnv.ts#L9)

### Functions

#### registerCustomNodeCollectionType

▸ **registerCustomNodeCollectionType**<`T`\>(`nodeCollectionType`, `deserializer`): `void`

##### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`NodeCollection`](#classescognite_revealnodecollectionmd)<`T`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollectionType` | `string` |
| `deserializer` | (`descriptor`: [`NodeCollectionDescriptor`](#nodecollectiondescriptor), `context`: [`NodeCollectionSerializationContext`](#nodecollectionserializationcontext)) => `Promise`<`T`\> |

##### Returns

`void`

##### Defined in

[packages/cad-styling/src/NodeCollectionDeserializer.ts:147](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L147)


<a name="modulescognite_reveal_extensions_datasourcemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / @cognite/reveal/extensions/datasource

## Module: @cognite/reveal/extensions/datasource

### Table of contents

#### Enumerations

- [File3dFormat](#enumscognite_reveal_extensions_datasourcefile3dformatmd)

#### Classes

- [CdfModelIdentifier](#classescognite_reveal_extensions_datasourcecdfmodelidentifiermd)

#### Interfaces

- [BlobOutputMetadata](#interfacescognite_reveal_extensions_datasourcebloboutputmetadatamd)
- [DataSource](#interfacescognite_reveal_extensions_datasourcedatasourcemd)
- [ModelDataProvider](#interfacescognite_reveal_extensions_datasourcemodeldataprovidermd)
- [ModelIdentifier](#interfacescognite_reveal_extensions_datasourcemodelidentifiermd)
- [ModelMetadataProvider](#interfacescognite_reveal_extensions_datasourcemodelmetadataprovidermd)
- [NodesApiClient](#interfacescognite_reveal_extensions_datasourcenodesapiclientmd)


<a name="modulescognite_reveal_toolsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / @cognite/reveal/tools

## Module: @cognite/reveal/tools

### Table of contents

#### Enumerations

- [BingMapImageFormat](#enumscognite_reveal_toolsbingmapimageformatmd)
- [BingMapType](#enumscognite_reveal_toolsbingmaptypemd)
- [Corner](#enumscognite_reveal_toolscornermd)
- [HereMapImageFormat](#enumscognite_reveal_toolsheremapimageformatmd)
- [HereMapScheme](#enumscognite_reveal_toolsheremapschememd)
- [HereMapType](#enumscognite_reveal_toolsheremaptypemd)
- [MapProviders](#enumscognite_reveal_toolsmapprovidersmd)
- [MapboxImageFormat](#enumscognite_reveal_toolsmapboximageformatmd)
- [MapboxMode](#enumscognite_reveal_toolsmapboxmodemd)
- [MapboxStyle](#enumscognite_reveal_toolsmapboxstylemd)

#### Classes

- [AxisViewTool](#classescognite_reveal_toolsaxisviewtoolmd)
- [Cognite3DViewerToolBase](#classescognite_reveal_toolscognite3dviewertoolbasemd)
- [DebugCameraTool](#classescognite_reveal_toolsdebugcameratoolmd)
- [DebugLoadedSectorsTool](#classescognite_reveal_toolsdebugloadedsectorstoolmd)
- [ExplodedViewTool](#classescognite_reveal_toolsexplodedviewtoolmd)
- [GeomapTool](#classescognite_reveal_toolsgeomaptoolmd)
- [HtmlOverlayTool](#classescognite_reveal_toolshtmloverlaytoolmd)
- [Keyframe](#classescognite_reveal_toolskeyframemd)
- [TimelineTool](#classescognite_reveal_toolstimelinetoolmd)

#### Type Aliases

- [AbsolutePosition](#absoluteposition)
- [AxisBoxCompassConfig](#axisboxcompassconfig)
- [AxisBoxConfig](#axisboxconfig)
- [AxisBoxFaceConfig](#axisboxfaceconfig)
- [BingMapConfig](#bingmapconfig)
- [DebugLoadedSectorsToolOptions](#debugloadedsectorstooloptions)
- [HereMapConfig](#heremapconfig)
- [HtmlOverlayCreateClusterDelegate](#htmloverlaycreateclusterdelegate)
- [HtmlOverlayOptions](#htmloverlayoptions)
- [HtmlOverlayPositionUpdatedDelegate](#htmloverlaypositionupdateddelegate)
- [MapConfig](#mapconfig)
- [MapboxConfig](#mapboxconfig)
- [RelativePosition](#relativeposition)
- [TimelineDateUpdateDelegate](#timelinedateupdatedelegate)

### Type Aliases

#### AbsolutePosition

Ƭ **AbsolutePosition**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `xAbsolute` | `number` |
| `yAbsolute` | `number` |

##### Defined in

[packages/tools/src/AxisView/types.ts:47](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/AxisView/types.ts#L47)

___

#### AxisBoxCompassConfig

Ƭ **AxisBoxCompassConfig**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `fontColor?` | `THREE.Color` | - |
| `fontSize?` | `number` | - |
| `labelDelta?` | `number` |  |
| `ringLabel?` | `string` |  |
| `tickColor?` | `THREE.Color` | - |

##### Defined in

[packages/tools/src/AxisView/types.ts:79](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/AxisView/types.ts#L79)

___

#### AxisBoxConfig

Ƭ **AxisBoxConfig**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `animationSpeed?` | `number` |  |
| `compass?` | [`AxisBoxCompassConfig`](#axisboxcompassconfig) |  |
| `faces?` | { `xNegativeFace?`: [`AxisBoxFaceConfig`](#axisboxfaceconfig) ; `xPositiveFace?`: [`AxisBoxFaceConfig`](#axisboxfaceconfig) ; `yNegativeFace?`: [`AxisBoxFaceConfig`](#axisboxfaceconfig) ; `yPositiveFace?`: [`AxisBoxFaceConfig`](#axisboxfaceconfig) ; `zNegativeFace?`: [`AxisBoxFaceConfig`](#axisboxfaceconfig) ; `zPositiveFace?`: [`AxisBoxFaceConfig`](#axisboxfaceconfig)  } |  |
| `faces.xNegativeFace?` | [`AxisBoxFaceConfig`](#axisboxfaceconfig) | - |
| `faces.xPositiveFace?` | [`AxisBoxFaceConfig`](#axisboxfaceconfig) | - |
| `faces.yNegativeFace?` | [`AxisBoxFaceConfig`](#axisboxfaceconfig) | - |
| `faces.yPositiveFace?` | [`AxisBoxFaceConfig`](#axisboxfaceconfig) | - |
| `faces.zNegativeFace?` | [`AxisBoxFaceConfig`](#axisboxfaceconfig) | - |
| `faces.zPositiveFace?` | [`AxisBoxFaceConfig`](#axisboxfaceconfig) | - |
| `position?` | [`AbsolutePosition`](#absoluteposition) \| [`RelativePosition`](#relativeposition) |  |
| `size?` | `number` |  |

##### Defined in

[packages/tools/src/AxisView/types.ts:10](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/AxisView/types.ts#L10)

___

#### AxisBoxFaceConfig

Ƭ **AxisBoxFaceConfig**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `faceColor?` | `THREE.Color` | - |
| `fontColor?` | `THREE.Color` | - |
| `fontSize?` | `number` | - |
| `label?` | `string` |  |
| `outlineColor?` | `THREE.Color` | - |
| `outlineSize?` | `number` | - |

##### Defined in

[packages/tools/src/AxisView/types.ts:64](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/AxisView/types.ts#L64)

___

#### BingMapConfig

Ƭ **BingMapConfig**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `APIKey` | `string` |  |
| `provider` | [`BingMap`](#bingmap) | - |
| `type?` | [`BingMapType`](#enumscognite_reveal_toolsbingmaptypemd) |  |

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:121](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L121)

___

#### DebugLoadedSectorsToolOptions

Ƭ **DebugLoadedSectorsToolOptions**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `colorBy?` | ``"depth"`` \| ``"lod"`` \| ``"loadedTimestamp"`` \| ``"drawcalls"`` \| ``"random"`` |
| `leafsOnly?` | `boolean` |
| `sectorPathFilterRegex?` | `string` |
| `showDetailedSectors?` | `boolean` |
| `showDiscardedSectors?` | `boolean` |
| `showSimpleSectors?` | `boolean` |

##### Defined in

[packages/tools/src/DebugLoadedSectorsTool.ts:13](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L13)

___

#### HereMapConfig

Ƭ **HereMapConfig**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `APIKey` | `string` |  |
| `appCode?` | `string` |  |
| `imageFormat?` | [`HereMapImageFormat`](#enumscognite_reveal_toolsheremapimageformatmd) |  |
| `provider` | [`HereMap`](#heremap) | - |
| `scheme?` | `string` |  |
| `size?` | `number` |  |
| `style?` | [`HereMapType`](#enumscognite_reveal_toolsheremaptypemd) |  |

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:133](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L133)

___

#### HtmlOverlayCreateClusterDelegate

Ƭ **HtmlOverlayCreateClusterDelegate**: (`overlayElements`: { `htmlElement`: `HTMLElement` ; `userData`: `any`  }[]) => `HTMLElement`

##### Type declaration

▸ (`overlayElements`): `HTMLElement`

###### Parameters

| Name | Type |
| :------ | :------ |
| `overlayElements` | { `htmlElement`: `HTMLElement` ; `userData`: `any`  }[] |

###### Returns

`HTMLElement`

##### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:32](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L32)

___

#### HtmlOverlayOptions

Ƭ **HtmlOverlayOptions**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `positionUpdatedCallback?` | [`HtmlOverlayPositionUpdatedDelegate`](#htmloverlaypositionupdateddelegate) |  |
| `userData?` | `any` |  |

##### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:42](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L42)

___

#### HtmlOverlayPositionUpdatedDelegate

Ƭ **HtmlOverlayPositionUpdatedDelegate**: (`element`: `HTMLElement`, `position2D`: `THREE.Vector2`, `position3D`: `THREE.Vector3`, `distanceToCamera`: `number`, `userData`: `any`) => `void`

##### Type declaration

▸ (`element`, `position2D`, `position3D`, `distanceToCamera`, `userData`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `element` | `HTMLElement` |
| `position2D` | `THREE.Vector2` |
| `position3D` | `THREE.Vector3` |
| `distanceToCamera` | `number` |
| `userData` | `any` |

###### Returns

`void`

##### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:20](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L20)

___

#### MapConfig

Ƭ **MapConfig**: { `latlong`: `LatLongPosition`  } & [`BingMapConfig`](#bingmapconfig) \| [`HereMapConfig`](#heremapconfig) \| [`MapboxConfig`](#mapboxconfig) \| `OpenStreetMapConfig`

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:198](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L198)

___

#### MapboxConfig

Ƭ **MapboxConfig**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `APIKey` | `string` |  |
| `id` | `string` |  |
| `mode?` | [`MapboxMode`](#enumscognite_reveal_toolsmapboxmodemd) |  |
| `provider` | [`MapboxMap`](#mapboxmap) | - |
| `tileFormat?` | [`MapboxImageFormat`](#enumscognite_reveal_toolsmapboximageformatmd) |  |
| `useHDPI?` | `boolean` |  |

##### Defined in

[packages/tools/src/Geomap/MapConfig.ts:169](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Geomap/MapConfig.ts#L169)

___

#### RelativePosition

Ƭ **RelativePosition**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `corner` | [`Corner`](#enumscognite_reveal_toolscornermd) |
| `padding` | `THREE.Vector2` |

##### Defined in

[packages/tools/src/AxisView/types.ts:56](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/AxisView/types.ts#L56)

___

#### TimelineDateUpdateDelegate

Ƭ **TimelineDateUpdateDelegate**: (`event`: { `activeKeyframe`: [`Keyframe`](#classescognite_reveal_toolskeyframemd) \| `undefined` ; `date`: `Date` ; `endDate`: `Date` ; `startDate`: `Date`  }) => `void`

##### Type declaration

▸ (`event`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.activeKeyframe` | [`Keyframe`](#classescognite_reveal_toolskeyframemd) \| `undefined` |
| `event.date` | `Date` |
| `event.endDate` | `Date` |
| `event.startDate` | `Date` |

###### Returns

`void`

##### Defined in

[packages/tools/src/Timeline/types.ts:8](https://github.com/cognitedata/reveal/blob/605bfbe25/viewer/packages/tools/src/Timeline/types.ts#L8)
