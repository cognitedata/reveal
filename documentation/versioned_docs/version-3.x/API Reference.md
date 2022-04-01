
<a name="readmemd"></a>

@cognite/reveal / [Modules](#modulesmd)

`@cognite/reveal` has three modules:
- [@cognite/reveal](#module-cognitereveal) is the main module and has the main entry point of Reveal, [`Cognite3DViewer`](#class-cognite3dviewer). CAD models are represented by [`Cognite3DModel`](#class-cognite3dmodel) and points clouds by [`CognitePointCloudModel`](#class-cognitepointcloudmodel).
- [@congite/reveal/tools](#module-cogniterevealtools) contains a set of tools, e.g. [`AxisViewTool`](#class-axisviewtool), [`GeomapTool`](#class-geomaptool), [`TimelineTool`](#class-timelinetool), [`ExplodedViewTool`](#class-explodedviewtool) and [`HtmlOverlayTool`](#class-htmloverlaytool) that works with `Cognite3DViewer`.
- [@cognite/reveal/extensions/datasource](#module-cogniterevealextensionsdatasource) allows providing custom data sources for geometry and model metadata.

# Classes


<a name="classes_cognite_revealassetnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / AssetNodeCollection

## Class: AssetNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).AssetNodeCollection

Represents a set of nodes associated with an [asset in Cognite Fusion](https://docs.cognite.com/api/v1/#tag/Assets)
linked to the 3D model using [asset mappings](https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping). A node
is considered to be part of an asset if it has a direct asset mapping or if one of its ancestors has an asset mapping
to the asset.

### Hierarchy

- [NodeCollection](#classes_cognite_revealnodecollectionmd)

  ↳ **AssetNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
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
| `modelMetadataProvider` | [CdfModelNodeCollectionDataProvider](#interfaces_cognite_revealcdfmodelnodecollectiondataprovidermd) |

##### Overrides

NodeCollection.constructor

##### Defined in

[viewer/packages/cad-styling/src/AssetNodeCollection.ts:34](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L34)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"AssetNodeCollection"``

##### Defined in

[viewer/packages/cad-styling/src/AssetNodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L27)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Defined in

[viewer/packages/cad-styling/src/AssetNodeCollection.ts:43](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L43)

### Methods

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[clear](#clear)

##### Defined in

[viewer/packages/cad-styling/src/AssetNodeCollection.ts:122](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L122)

___

#### executeFilter

▸ **executeFilter**(`filter`): `Promise`<void\>

Updates the node collection to hold nodes associated with the asset given, or
assets within the bounding box or all assets associated with the 3D model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | `Object` |  |
| `filter.assetId?` | `number` | ID of a single [asset](https://docs.cognite.com/dev/concepts/resource_types/assets.html) (optional) |
| `filter.boundingBox?` | `Box3` | When provided, only assets within the provided bounds will be included in the filter. |

##### Returns

`Promise`<void\>

##### Defined in

[viewer/packages/cad-styling/src/AssetNodeCollection.ts:54](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L54)

___

#### getAreas

▸ **getAreas**(): [AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Returns

[AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[getAreas](#getareas)

##### Defined in

[viewer/packages/cad-styling/src/AssetNodeCollection.ts:133](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L133)

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

[viewer/packages/cad-styling/src/AssetNodeCollection.ts:118](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L118)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[getIndexSet](#getindexset)

##### Defined in

[viewer/packages/cad-styling/src/AssetNodeCollection.ts:129](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L129)

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

[NodeCollection](#classes_cognite_revealnodecollectionmd).[off](#off)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[NodeCollection](#classes_cognite_revealnodecollectionmd).[on](#on)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[serialize](#serialize)

##### Defined in

[viewer/packages/cad-styling/src/AssetNodeCollection.ts:137](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/AssetNodeCollection.ts#L137)


<a name="classes_cognite_revealboundingboxclippermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / BoundingBoxClipper

## Class: BoundingBoxClipper

[@cognite/reveal](#modules_cognite_revealmd).BoundingBoxClipper

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

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:16](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L16)

### Accessors

#### clippingPlanes

• `get` **clippingPlanes**(): `Plane`[]

##### Returns

`Plane`[]

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:104](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L104)

___

#### maxX

• `get` **maxX**(): `number`

##### Returns

`number`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:55](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L55)

• `set` **maxX**(`x`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:50](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L50)

___

#### maxY

• `get` **maxY**(): `number`

##### Returns

`number`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:64](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L64)

• `set` **maxY**(`y`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `y` | `number` |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:59](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L59)

___

#### maxZ

• `get` **maxZ**(): `number`

##### Returns

`number`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:73](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L73)

• `set` **maxZ**(`z`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `z` | `number` |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:68](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L68)

___

#### minX

• `get` **minX**(): `number`

##### Returns

`number`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:28](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L28)

• `set` **minX**(`x`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L23)

___

#### minY

• `get` **minY**(): `number`

##### Returns

`number`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L37)

• `set` **minY**(`y`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `y` | `number` |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L32)

___

#### minZ

• `get` **minZ**(): `number`

##### Returns

`number`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:46](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L46)

• `set` **minZ**(`z`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `z` | `number` |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/BoundingBoxClipper.ts:41](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/BoundingBoxClipper.ts#L41)


<a name="classes_cognite_revealcameramanagerhelpermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / CameraManagerHelper

## Class: CameraManagerHelper

[@cognite/reveal](#modules_cognite_revealmd).CameraManagerHelper

Helper methods for implementing a camera manager.

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

Calculates camera position and target that allows to see the content of provided bounding box.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `camera` | `PerspectiveCamera` | `undefined` | Used camera instance. |
| `box` | `Box3` | `undefined` | Bounding box to be fitted. |
| `radiusFactor` | `number` | 2 | The ratio of the distance from camera to center of box and radius of the box. |

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `position` | `Vector3` |
| `target` | `Vector3` |

##### Defined in

[viewer/packages/camera-manager/src/CameraManagerHelper.ts:95](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L95)

___

#### calculateNewTargetFromRotation

▸ `Static` **calculateNewTargetFromRotation**(`camera`, `rotation`, `currentTarget`): `Vector3`

Calculates camera target based on new camera rotation.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `camera` | `PerspectiveCamera` | Used camera instance. |
| `rotation` | `Quaternion` | New camera rotation in quaternion form. |
| `currentTarget` | `Vector3` | Current camera target. |

##### Returns

`Vector3`

##### Defined in

[viewer/packages/camera-manager/src/CameraManagerHelper.ts:41](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L41)

___

#### updateCameraNearAndFar

▸ `Static` **updateCameraNearAndFar**(`camera`, `combinedBbox`): `void`

Updates near and far plane of the camera based on the bounding box.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `camera` | `PerspectiveCamera` | Used camera instance. |
| `combinedBbox` | `Box3` | Bounding box of all objects on the scene. |

##### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/CameraManagerHelper.ts:65](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/CameraManagerHelper.ts#L65)


<a name="classes_cognite_revealclusteredareacollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / ClusteredAreaCollection

## Class: ClusteredAreaCollection

[@cognite/reveal](#modules_cognite_revealmd).ClusteredAreaCollection

AreaCollection that stores a representative box set by merging
inserted boxes that are overlapping or close to each other.
It uses simple heuristics to determine which boxes are to be merged.

### Implements

- [AreaCollection](#interfaces_cognite_revealareacollectionmd)

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

[AreaCollection](#interfaces_cognite_revealareacollectionmd).[isEmpty](#isempty)

##### Defined in

[viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:16](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L16)

### Methods

#### addAreas

▸ **addAreas**(`boxes`): `void`

Add areas to be covered by the representative set of this
AreaCollection.

##### Parameters

| Name | Type |
| :------ | :------ |
| `boxes` | `Iterable`<Box3\> |

##### Returns

`void`

##### Implementation of

[AreaCollection](#interfaces_cognite_revealareacollectionmd).[addAreas](#addareas)

##### Defined in

[viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:34](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L34)

___

#### areas

▸ **areas**(): `Generator`<Box3, any, unknown\>

Return some set of boxes that cover the boxes inserted with `addAreas`.
It is required that each inserted box is completely covered by some
subset of boxes in the set returned from `areas`

##### Returns

`Generator`<Box3, any, unknown\>

##### Implementation of

[AreaCollection](#interfaces_cognite_revealareacollectionmd).[areas](#areas)

##### Defined in

[viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:20](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L20)

___

#### intersectWith

▸ **intersectWith**(`boxes`): `void`

Alter the representative set to cover only the intersection between the
representative set of this AreaCollection and the incoming boxes.
Note that the intersection of two representative sets A' and B' that
represent the original box sets A and B will cover the intersection between
A and B, and will thus be a valid representative set for the intersection of A and B.

##### Parameters

| Name | Type |
| :------ | :------ |
| `boxes` | `Iterable`<Box3\> |

##### Returns

`void`

##### Implementation of

[AreaCollection](#interfaces_cognite_revealareacollectionmd).[intersectWith](#intersectwith)

##### Defined in

[viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:38](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L38)

___

#### intersectsBox

▸ **intersectsBox**(`box`): `boolean`

Return whether the input box intersects the AreaCollection.

##### Parameters

| Name | Type |
| :------ | :------ |
| `box` | `Box3` |

##### Returns

`boolean`

##### Implementation of

[AreaCollection](#interfaces_cognite_revealareacollectionmd).[intersectsBox](#intersectsbox)

##### Defined in

[viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts:24](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/prioritized/ClusteredAreaCollection.ts#L24)


<a name="classes_cognite_revealcognite3dmodelmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / Cognite3DModel

## Class: Cognite3DModel

[@cognite/reveal](#modules_cognite_revealmd).Cognite3DModel

### Hierarchy

- `Object3D`

  ↳ **Cognite3DModel**

### Implements

- [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd)
- [CdfModelNodeCollectionDataProvider](#interfaces_cognite_revealcdfmodelnodecollectiondataprovidermd)

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

The CDF model ID of the model.

##### Implementation of

[CdfModelNodeCollectionDataProvider](#interfaces_cognite_revealcdfmodelnodecollectiondataprovidermd).[modelId](#modelid)

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:56](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L56)

___

#### revisionId

• `Readonly` **revisionId**: `number`

The CDF revision ID of the model.

##### Implementation of

[CdfModelNodeCollectionDataProvider](#interfaces_cognite_revealcdfmodelnodecollectiondataprovidermd).[revisionId](#revisionid)

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:60](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L60)

___

#### type

• `Readonly` **type**: [SupportedModelTypes](#supportedmodeltypes) = 'cad'

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[type](#type)

##### Overrides

THREE.Object3D.type

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:25](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L25)

### Accessors

#### modelUnit

• `get` **modelUnit**(): ``""`` \| [WellKnownUnit](#wellknownunit)

Returns the unit the coordinates for the model is stored. Returns an empty string
if no unit has been stored.
Note that coordinates in Reveal always are converted to meters using {@see modelUnitToMetersFactor}.

##### Returns

``""`` \| [WellKnownUnit](#wellknownunit)

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:39](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L39)

___

#### modelUnitToMetersFactor

• `get` **modelUnitToMetersFactor**(): `number`

Returns the conversion factor that converts from model coordinates to meters. Note that this can
return undefined if the model has been stored in an unsupported unit.

##### Returns

`number`

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:49](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L49)

___

#### nodeCount

• `get` **nodeCount**(): `number`

Returns the number of nodes in the model.

##### Returns

`number`

##### Implementation of

[CdfModelNodeCollectionDataProvider](#interfaces_cognite_revealcdfmodelnodecollectiondataprovidermd).[nodeCount](#nodecount)

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:450](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L450)

___

#### styledNodeCollections

• `get` **styledNodeCollections**(): { `appearance`: [NodeAppearance](#nodeappearance) ; `nodeCollection`: [NodeCollection](#classes_cognite_revealnodecollectionmd)  }[]

Returns all currently registered node collections and associated appearance.

##### Returns

{ `appearance`: [NodeAppearance](#nodeappearance) ; `nodeCollection`: [NodeCollection](#classes_cognite_revealnodecollectionmd)  }[]

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:122](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L122)

### Methods

#### assignStyledNodeCollection

▸ **assignStyledNodeCollection**(`nodeCollection`, `appearance`): `void`

Customizes rendering style for a set of nodes, e.g. to highlight, hide
or color code a set of 3D objects. This allows for custom look and feel
of the 3D model which is useful to highlight certain parts or to
color code the 3D model based on information (e.g. coloring the 3D model
by construction status).

The [NodeCollection](#classes_cognite_revealnodecollectionmd) can be updated dynamically and the rendered nodes will be
updated automatically as the styling changes. The appearance of the style nodes
cannot be changed.

When nodes are in several styled sets, the style is combined in the order
the sets were added, i.e. styled sets added late can overwrite styled sets added
early.

If the `nodeCollection` provided already has an assigned style, this style will
be replaced with style provided.

**`example`**
```js
model.setDefaultNodeAppearance({ rendererGhosted: true });
const visibleNodes = new TreeIndexNodeCollection(someTreeIndices);
model.assignStyledNodeCollection(visibleSet, { rendererGhosted: false });
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [NodeCollection](#classes_cognite_revealnodecollectionmd) | Dynamic set of nodes to apply the provided appearance to. |
| `appearance` | [NodeAppearance](#nodeappearance) | Appearance to style the provided set with. |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:153](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L153)

___

#### dispose

▸ **dispose**(): `void`

Cleans up used resources.

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[dispose](#dispose)

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:285](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L285)

___

#### getAncestorTreeIndices

▸ **getAncestorTreeIndices**(`treeIndex`, `generation`): `Promise`<[NumericRange](#classes_cognite_revealnumericrangemd)\>

Determines the tree index range of a subtree of an ancestor of the provided
node defined by a tree index.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | Tree index of node to find ancestor tree index range for. |
| `generation` | `number` | What "generation" to find. 0 is the node itself, 1 means parent, 2 means grandparent etc. If the node doesn't have as many ancestors, the root of the model is returned. This can be determined by checking that the range returned includes 0. |

##### Returns

`Promise`<[NumericRange](#classes_cognite_revealnumericrangemd)\>

Tree index range of the subtree spanned by the ancestor at the
"generation" specified, or the root.

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:309](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L309)

___

#### getBoundingBoxByNodeId

▸ **getBoundingBoxByNodeId**(`nodeId`, `box?`): `Promise`<Box3\>

Fetches a bounding box from the CDF by the nodeId.

**`example`**
```js
const box = new THREE.Box3()
const nodeId = 100500;
await model.getBoundingBoxByNodeId(nodeId, box);
// box now has the bounding box
```
```js
// the following code does the same
const box = await model.getBoundingBoxByNodeId(nodeId);
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeId` | `number` |  |
| `box?` | `Box3` | Optional. Used to write result to. |

##### Returns

`Promise`<Box3\>

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:392](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L392)

___

#### getBoundingBoxByTreeIndex

▸ **getBoundingBoxByTreeIndex**(`treeIndex`, `box?`): `Promise`<Box3\>

Determine the bounding box of the node identified by the tree index provided. Note that this
function uses the CDF API to look up the bounding box.

**`example`**
```js
const box = new THREE.Box3()
const treeIndex = 42;
await model.getBoundingBoxByTreeIndex(treeIndex, box);
// box now has the bounding box
```
```js
// the following code does the same
const box = await model.getBoundingBoxByTreeIndex(treeIndex);
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | Tree index of the node to find bounding box for. |
| `box?` | `Box3` | Optional preallocated container to hold the bounding box. |

##### Returns

`Promise`<Box3\>

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:426](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L426)

___

#### getCameraConfiguration

▸ **getCameraConfiguration**(): [CameraConfiguration](#cameraconfiguration)

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

##### Returns

[CameraConfiguration](#cameraconfiguration)

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getCameraConfiguration](#getcameraconfiguration)

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:356](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L356)

___

#### getDefaultNodeAppearance

▸ **getDefaultNodeAppearance**(): [NodeAppearance](#nodeappearance)

Gets the default appearance for nodes that are not styled using
[assignStyledNodeCollection](#assignstylednodecollection).

##### Returns

[NodeAppearance](#nodeappearance)

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:115](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L115)

___

#### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`, `restrictToMostGeometry?`): `Box3`

Determines the full bounding box of the model.

**`example`**
```js
const box = new THREE.Box3()
model.getModelBoundingBox(box);
// box now has the bounding box
```
```js
// the following code does the same
const box = model.getModelBoundingBox();
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `outBbox?` | `Box3` | Optional. Used to write result to. |
| `restrictToMostGeometry?` | `boolean` | Optional. When true, returned bounds are restricted to where most of the geometry is located. This is useful for models that have junk geometry located far from the "main" model. Added in version 1.3.0. |

##### Returns

`Box3`

Model bounding box.

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getModelBoundingBox](#getmodelboundingbox)

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:340](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L340)

___

#### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

Gets transformation matrix of the model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` | Preallocated `THREE.Matrix4` (optional). |

##### Returns

`Matrix4`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getModelTransformation](#getmodeltransformation)

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:372](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L372)

___

#### getSubtreeTreeIndices

▸ **getSubtreeTreeIndices**(`treeIndex`): `Promise`<[NumericRange](#classes_cognite_revealnumericrangemd)\>

Determines the range of tree indices for a given subtree.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | Index of the root of the subtree to get the index range for. |

##### Returns

`Promise`<[NumericRange](#classes_cognite_revealnumericrangemd)\>

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:293](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L293)

___

#### iterateNodesByTreeIndex

▸ **iterateNodesByTreeIndex**(`action`): `Promise`<void\>

Iterates over all nodes in the model and applies the provided action to each node (identified by tree index).
The passed action is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
applied until promise is resolved (iteration is done).

**`example`**
```js
const logIndex = (treeIndex) => console.log(treeIndex);
await model.iterateNodesByTreeIndex(logIndex); // 0, 1, 2, ...
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `action` | (`treeIndex`: `number`) => `void` | Function that will be called with a treeIndex argument. |

##### Returns

`Promise`<void\>

Promise that is resolved once the iteration is done.

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:443](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L443)

___

#### iterateSubtreeByTreeIndex

▸ **iterateSubtreeByTreeIndex**(`treeIndex`, `action`): `Promise`<void\>

Iterates over all nodes in a subtree of the model and applies the provided action to each node
(identified by tree index). The provided node is included in the visited set.  The passed action
is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
applied until promise is resolved (iteration is done).

**`example`**
```js
// make a subtree to be gray
await model.iterateNodesByTreeIndex(treeIndex => {
  model.setNodeColorByTreeIndex(treeIndex, 127, 127, 127);
});
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | Tree index of the top parent of the subtree. |
| `action` | (`treeIndex`: `number`) => `void` | Function that will be called with a treeIndex argument. |

##### Returns

`Promise`<void\>

Promise that is resolved once the iteration is done.

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:470](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L470)

___

#### mapBoxFromCdfToModelCoordinates

▸ **mapBoxFromCdfToModelCoordinates**(`box`, `out?`): `Box3`

Maps from a 3D position in "CDF space" to coordinates in "ThreeJS model space".
This is necessary because CDF has a right-handed Z-up coordinate system while ThreeJS
uses a right-hand Y-up coordinate system. This function also accounts for transformation
applied to the model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `box` | `Box3` | The box in CDF model coordinates. |
| `out?` | `Box3` | Optional preallocated buffer for storing the result. May be same input as `box`. |

##### Returns

`Box3`

Transformed box.

##### Implementation of

CdfModelNodeCollectionDataProvider.mapBoxFromCdfToModelCoordinates

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:273](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L273)

___

#### mapBoxFromModelToCdfCoordinates

▸ **mapBoxFromModelToCdfCoordinates**(`box`, `out?`): `Box3`

Maps from a 3D position in "ThreeJS model space" to coordinates in "CDF space".
This is necessary because CDF has a right-handed Z-up coordinate system while ThreeJS
uses a right-hand Y-up coordinate system. This function also accounts for transformation
applied to the model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `box` | `Box3` | The box in ThreeJS/model coordinates. |
| `out?` | `Box3` | Optional preallocated buffer for storing the result. May be same input as `box`. |

##### Returns

`Box3`

Transformed box.

##### Implementation of

CdfModelNodeCollectionDataProvider.mapBoxFromModelToCdfCoordinates

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:255](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L255)

___

#### mapFromCdfToModelCoordinates

▸ **mapFromCdfToModelCoordinates**(`p`, `out?`): `Vector3`

Maps a position retrieved from the CDF API (e.g. 3D node information) to
coordinates in "ThreeJS model space". This is necessary because CDF has a right-handed
Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | `Vector3` | The CDF coordinate to transform. |
| `out?` | `Vector3` | Optional preallocated buffer for storing the result. May be `p`. |

##### Returns

`Vector3`

Transformed position.

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:219](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L219)

___

#### mapNodeIdToTreeIndex

▸ **mapNodeIdToTreeIndex**(`nodeId`): `Promise`<number\>

Maps a single node ID to tree index. This is useful when you e.g. have a
node ID from an asset mapping and want to highlight the given asset using
[mapNodeIdsToTreeIndices](#mapnodeidstotreeindices) is recommended for better performance when
mapping multiple IDs.

**`throws`** If an invalid/non-existant node ID is provided the function throws an error.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeId` | `number` | A Node ID to map to a tree index. |

##### Returns

`Promise`<number\>

TreeIndex of the provided node.

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:525](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L525)

___

#### mapNodeIdsToTreeIndices

▸ **mapNodeIdsToTreeIndices**(`nodeIds`): `Promise`<number[]\>

Maps a list of Node IDs to tree indices. This function is useful when you have
a list of nodes, e.g. from Asset Mappings, that you want to highlight, hide,
color etc in the viewer.

**`throws`** If an invalid/non-existant node ID is provided the function throws an error.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeIds` | `number`[] | List of node IDs to map to tree indices. |

##### Returns

`Promise`<number[]\>

A list of tree indices corresponing to the elements in the input.

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:511](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L511)

___

#### mapPositionFromModelToCdfCoordinates

▸ **mapPositionFromModelToCdfCoordinates**(`p`, `out?`): `Vector3`

Maps from a 3D position in "ThreeJS model space" (e.g. a ray intersection coordinate)
to coordinates in "CDF space". This is necessary because CDF has a right-handed
Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.
This function also accounts for transformation applied to the model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | `Vector3` | The ThreeJS coordinate to transform. |
| `out?` | `Vector3` | Optional preallocated buffer for storing the result. May be `p`. |

##### Returns

`Vector3`

Transformed position.

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:237](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L237)

___

#### mapTreeIndexToNodeId

▸ **mapTreeIndexToNodeId**(`treeIndex`): `Promise`<number\>

Maps a single tree index to node ID for use with the API. If you have multiple
tree indices to map, [mapNodeIdsToTreeIndices](#mapnodeidstotreeindices) is recommended for better
performance.

**`throws`** If an invalid/non-existent node ID is provided the function throws an error.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndex` | `number` | A tree index to map to a Node ID. |

##### Returns

`Promise`<number\>

TreeIndex of the provided node.

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:551](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L551)

___

#### mapTreeIndicesToNodeIds

▸ **mapTreeIndicesToNodeIds**(`treeIndices`): `Promise`<number[]\>

Maps a list of tree indices to node IDs for use with the Cognite SDK.
This function is useful if you have a list of tree indices, e.g. from
[Cognite3DModel.iterateSubtreeByTreeIndex](#iteratesubtreebytreeindex), and want to perform
some operations on these nodes using the SDK.

**`throws`** If an invalid tree index is provided the function throws an error.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | `number`[] | Tree indices to map to node IDs. |

##### Returns

`Promise`<number[]\>

A list of node IDs corresponding to the elements of the input.

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:539](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L539)

___

#### removeAllStyledNodeCollections

▸ **removeAllStyledNodeCollections**(): `void`

Removes all styled collections, resetting the appearance of all nodes to the
default appearance.

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:185](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L185)

___

#### resetNodeTransform

▸ **resetNodeTransform**(`treeIndices`): `void`

Resets the transformation for the nodes given.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | [NumericRange](#classes_cognite_revealnumericrangemd) | Tree indices of the nodes to reset transforms for. |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:207](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L207)

___

#### resetNodeTransformByTreeIndex

▸ **resetNodeTransformByTreeIndex**(`treeIndex`, `applyToChildren?`): `Promise`<number\>

Remove override transform of the node by tree index.

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `treeIndex` | `number` | `undefined` |
| `applyToChildren` | `boolean` | true |

##### Returns

`Promise`<number\>

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:496](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L496)

___

#### setDefaultNodeAppearance

▸ **setDefaultNodeAppearance**(`appearance`): `void`

Sets the default appearance for nodes that are not styled using
[assignStyledNodeCollection](#assignstylednodecollection). Updating the default style can be an
expensive operation, so use with care.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `appearance` | [NodeAppearance](#nodeappearance) | Default node appearance. |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:107](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L107)

___

#### setModelTransformation

▸ **setModelTransformation**(`matrix`): `void`

Sets transformation matrix of the model. This overrides the current transformation.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `matrix` | `Matrix4` | Transformation matrix. |

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[setModelTransformation](#setmodeltransformation)

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:364](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L364)

___

#### setNodeTransform

▸ **setNodeTransform**(`treeIndices`, `transformMatrix`): `void`

Apply a transformation matrix to the tree indices given, changing
rotation, scale and/or position.

Note that setting multiple transformations for the same
node isn't supported and might lead to undefined results.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `treeIndices` | [NumericRange](#classes_cognite_revealnumericrangemd) | Tree indices of nodes to apply the transformation to. |
| `transformMatrix` | `Matrix4` | Transformation to apply. |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:199](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L199)

___

#### setNodeTransformByTreeIndex

▸ **setNodeTransformByTreeIndex**(`treeIndex`, `transform`, `applyToChildren?`): `Promise`<number\>

Set override transform of the node by tree index.

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `treeIndex` | `number` | `undefined` |
| `transform` | `Matrix4` | `undefined` |
| `applyToChildren` | `boolean` | true |

##### Returns

`Promise`<number\>

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:481](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L481)

___

#### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

Removes styling for previously added styled collection, resetting the style to the default (or
the style imposed by other styled collections).

**`throws`** Error if node collection isn't assigned to the model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [NodeCollection](#classes_cognite_revealnodecollectionmd) | Node collection previously added using [assignStyledNodeCollection](#assignstylednodecollection). |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-model/src/Cognite3DModel.ts:171](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/Cognite3DModel.ts#L171)


<a name="classes_cognite_revealcognite3dviewermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / Cognite3DViewer

## Class: Cognite3DViewer

[@cognite/reveal](#modules_cognite_revealmd).Cognite3DViewer

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
- [addUiObject](#adduiobject)
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
- [removeUiObject](#removeuiobject)
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
| `options` | [Cognite3DViewerOptions](#interfaces_cognite_revealcognite3dvieweroptionsmd) |

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:194](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L194)

### Accessors

#### cadBudget

• `get` **cadBudget**(): [CadModelBudget](#cadmodelbudget)

Gets the current budget for downloading geometry for CAD models. Note that this
budget is shared between all added CAD models and not a per-model budget.

##### Returns

[CadModelBudget](#cadmodelbudget)

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:150](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L150)

• `set` **cadBudget**(`budget`): `void`

Sets the current budget for downloading geometry for CAD models. Note that this
budget is shared between all added CAD models and not a per-model budget.

##### Parameters

| Name | Type |
| :------ | :------ |
| `budget` | [CadModelBudget](#cadmodelbudget) |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:160](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L160)

___

#### cameraManager

• `get` **cameraManager**(): [CameraManager](#interfaces_cognite_revealcameramanagermd)

##### Returns

[CameraManager](#interfaces_cognite_revealcameramanagermd)

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:459](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L459)

___

#### domElement

• `get` **domElement**(): `HTMLElement`

The DOM element the viewer will insert its rendering canvas into.
The DOM element can be specified in the options when the viewer is created.
If not specified, the DOM element will be created automatically.
The DOM element cannot be changed after the viewer has been created.

##### Returns

`HTMLElement`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:89](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L89)

___

#### models

• `get` **models**(): [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd)[]

Gets a list of models currently added to the viewer.

##### Returns

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd)[]

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:185](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L185)

___

#### pointCloudBudget

• `get` **pointCloudBudget**(): [PointCloudBudget](#pointcloudbudget)

Returns the point cloud budget. The budget is shared between all loaded
point cloud models.

##### Returns

[PointCloudBudget](#pointcloudbudget)

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:170](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L170)

• `set` **pointCloudBudget**(`budget`): `void`

Sets the point cloud budget. The budget is shared between all loaded
point cloud models.

##### Parameters

| Name | Type |
| :------ | :------ |
| `budget` | [PointCloudBudget](#pointcloudbudget) |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:178](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L178)

___

#### renderer

• `get` **renderer**(): `WebGLRenderer`

Returns the renderer used to produce images from 3D geometry.

##### Returns

`WebGLRenderer`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:96](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L96)

### Methods

#### addCadModel

▸ **addCadModel**(`options`): `Promise`<[Cognite3DModel](#classes_cognite_revealcognite3dmodelmd)\>

Add a new CAD 3D model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](#fitcameratomodel) to see the model after the model has loaded.

**`example`**
```js
const options = {
modelId:     'COGNITE_3D_MODEL_ID',
revisionId:  'COGNITE_3D_REVISION_ID',
};
viewer.addCadModel(options).then(model => {
viewer.fitCameraToModel(model, 0);
});
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [AddModelOptions](#interfaces_cognite_revealaddmodeloptionsmd) |

##### Returns

`Promise`<[Cognite3DModel](#classes_cognite_revealcognite3dmodelmd)\>

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:536](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L536)

___

#### addModel

▸ **addModel**(`options`): `Promise`<[Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) \| [CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)\>

Add a new model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](#fitcameratomodel) to see the model after the model has loaded.

**`example`**
```js
const options = {
modelId:     'COGNITE_3D_MODEL_ID',
revisionId:  'COGNITE_3D_REVISION_ID',
};
viewer.addModel(options).then(model => {
viewer.fitCameraToModel(model, 0);
});
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [AddModelOptions](#interfaces_cognite_revealaddmodeloptionsmd) |

##### Returns

`Promise`<[Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) \| [CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)\>

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:503](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L503)

___

#### addObject3D

▸ **addObject3D**(`object`): `void`

Add a THREE.Object3D to the viewer.

**`example`**
```js
const sphere = new THREE.Mesh(
new THREE.SphereBufferGeometry(),
new THREE.MeshBasicMaterial()
);
viewer.addObject3D(sphere);
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `Object3D`<Event\> |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:668](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L668)

___

#### addPointCloudModel

▸ **addPointCloudModel**(`options`): `Promise`<[CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)\>

Add a new pointcloud 3D model to the viewer.
Call [Cognite3DViewer.fitCameraToModel](#fitcameratomodel) to see the model after the model has loaded.

**`example`**
```js
const options = {
modelId:     'COGNITE_3D_MODEL_ID',
revisionId:  'COGNITE_3D_REVISION_ID',
};
viewer.addPointCloudModel(options).then(model => {
viewer.fitCameraToModel(model, 0);
});
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [AddModelOptions](#interfaces_cognite_revealaddmodeloptionsmd) |

##### Returns

`Promise`<[CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)\>

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:564](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L564)

___

#### addUiObject

▸ **addUiObject**(`object`, `screenPos`, `size`): `void`

Add an object that will be considered a UI object. It will be rendered in the last stage and with orthographic projection.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `object` | `Object3D`<Event\> |  |
| `screenPos` | `Vector2` | Screen space position of object (in pixels). |
| `size` | `Vector2` | Pixel width and height of the object. |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:708](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L708)

___

#### determineModelType

▸ **determineModelType**(`modelId`, `revisionId`): `Promise`<``""`` \| [SupportedModelTypes](#supportedmodeltypes)\>

Use to determine of which type the model is.

**`example`**
```typescript
const viewer = new Cognite3DViewer(...);
const type = await viewer.determineModelType(options.modelId, options.revisionId)
let model: Cognite3DModel | CognitePointCloudModel
switch (type) {
  case 'cad':
    model = await viewer.addCadModel(options);
    break;
  case 'pointcloud':
    model = await viewer.addPointCloudModel(options);
    break;
  default:
    throw new Error('Model is not supported');
}
viewer.fitCameraToModel(model);
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `modelId` | `number` | The model's id. |
| `revisionId` | `number` | The model's revision id. |

##### Returns

`Promise`<``""`` \| [SupportedModelTypes](#supportedmodeltypes)\>

Empty string if type is not supported.

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:635](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L635)

___

#### dispose

▸ **dispose**(): `void`

Dispose of WebGL resources. Can be used to free up memory when the viewer is no longer in use.

**`see`** [https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects)
```ts
// Viewer is no longer in use, free up memory
viewer.dispose();
```.

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:323](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L323)

___

#### fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`box`, `duration?`, `radiusFactor?`): `void`

Move camera to a place where the content of a bounding box is visible to the camera.

**`example`**
```js
// Fit camera to bounding box over 500 milliseconds
viewer.fitCameraToBoundingBox(boundingBox, 500);
```
```js
// Fit camera to bounding box instantaneously
viewer.fitCameraToBoundingBox(boundingBox, 0);
```
```js
// Place the camera closer to the bounding box
viewer.fitCameraToBoundingBox(boundingBox, 500, 2);
```

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `box` | `Box3` | `undefined` | The bounding box in world space. |
| `duration?` | `number` | `undefined` | The duration of the animation moving the camera. Set this to 0 (zero) to disable animation. |
| `radiusFactor` | `number` | 2 | The ratio of the distance from camera to center of box and radius of the box. |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:857](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L857)

___

#### fitCameraToModel

▸ **fitCameraToModel**(`model`, `duration?`): `void`

Move camera to a place where the 3D model is visible.
It uses the bounding box of the 3D model and calls [Cognite3DViewer.fitCameraToBoundingBox](#fitcameratoboundingbox).

**`example`**
```js
// Fit camera to model
viewer.fitCameraToModel(model);
```
```js
// Fit camera to model over 500 milliseconds
viewer.fitCameraToModel(model, 500);
```
```js
// Fit camera to model instantly
viewer.fitCameraToModel(model, 0);
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `model` | [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd) | The 3D model. |
| `duration?` | `number` | The duration of the animation moving the camera. Set this to 0 (zero) to disable animation. |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:833](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L833)

___

#### getCamera

▸ **getCamera**(): `PerspectiveCamera`

**`obvious`**

##### Returns

`PerspectiveCamera`

The THREE.Camera used for rendering.

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:783](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L783)

___

#### getClippingPlanes

▸ **getClippingPlanes**(): `Plane`[]

Returns the current active clipping planes.

##### Returns

`Plane`[]

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:775](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L775)

___

#### getIntersectionFromPixel

▸ **getIntersectionFromPixel**(`offsetX`, `offsetY`, `options?`): `Promise`<[Intersection](#intersection)\>

Raycasting model(s) for finding where the ray intersects with the model.

**`see`** [https://en.wikipedia.org/wiki/Ray_casting](https://en.wikipedia.org/wiki/Ray_casting).

**`example`** For CAD model
```js
const offsetX = 50 // pixels from the left
const offsetY = 100 // pixels from the top
const intersection = await viewer.getIntersectionFromPixel(offsetX, offsetY);
if (intersection) // it was a hit
  console.log(
  'You hit model ', intersection.model,
  ' at the node with tree index ', intersection.treeIndex,
  ' at this exact point ', intersection.point
  );
```

**`example`** For point cloud
```js
const offsetX = 50 // pixels from the left
const offsetY = 100 // pixels from the top
const intersection = await viewer.getIntersectionFromPixel(offsetX, offsetY);
if (intersection) // it was a hit
  console.log(
  'You hit model ', intersection.model,
  ' at the point index ', intersection.pointIndex,
  ' at this exact point ', intersection.point
  );
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `offsetX` | `number` | X coordinate in pixels (relative to the domElement). |
| `offsetY` | `number` | Y coordinate in pixels (relative to the domElement). |
| `options?` | [IntersectionFromPixelOptions](#interfaces_cognite_revealintersectionfrompixeloptionsmd) | Options to control the behavior of the intersection operation. Optional (new in 1.3.0). |

##### Returns

`Promise`<[Intersection](#intersection)\>

A promise that if there was an intersection then return the intersection object - otherwise it
returns `null` if there were no intersections.

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:1002](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L1002)

___

#### getScene

▸ **getScene**(): `Scene`

**`obvious`**

##### Returns

`Scene`

The THREE.Scene used for rendering.

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:791](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L791)

___

#### getScreenshot

▸ **getScreenshot**(`width?`, `height?`): `Promise`<string\>

Take screenshot from the current camera position.

**`example`**
```js
// Take a screenshot with custom resolution
const url = await viewer.getScreenshot(1920, 1080);
```
```js
// Add a screenshot with resolution of the canvas to the page
const url = await viewer.getScreenshot();
const image = document.createElement('img');
image.src = url;
document.body.appendChild(url);
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `width` | `number` | Width of the final image. Default is current canvas size. |
| `height` | `number` | Height of the final image. Default is current canvas size. |

##### Returns

`Promise`<string\>

A [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) of the image ('image/png').

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:944](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L944)

___

#### getVersion

▸ **getVersion**(): `string`

Returns reveal version installed.

##### Returns

`string`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:296](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L296)

___

#### getViewState

▸ **getViewState**(): [ViewerState](#viewerstate)

Gets the current viewer state which includes the camera pose as well as applied styling.

##### Returns

[ViewerState](#viewerstate)

JSON object containing viewer state.

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:467](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L467)

___

#### loadCameraFromModel

▸ **loadCameraFromModel**(`model`): `void`

Attempts to load the camera settings from the settings stored for the
provided model. See [https://docs.cognite.com/api/v1/#operation/get3DRevision](https://docs.cognite.com/api/v1/#operation/get3DRevision)
and [https://docs.cognite.com/api/v1/#operation/update3DRevisions](https://docs.cognite.com/api/v1/#operation/update3DRevisions) for
information on how this setting is retrieved and stored. This setting can
also be changed through the 3D models management interface in Cognite Fusion.
If no camera configuration is stored in CDF, [Cognite3DViewer.fitCameraToModel](#fitcameratomodel)
is used as a fallback.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `model` | [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd) | The model to load camera settings from. |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:805](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L805)

___

#### off

▸ **off**(`event`, `callback`): `void`

**`example`**
```js
viewer.off('click', onClick);
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"click"`` \| ``"hover"`` |
| `callback` | [PointerEventDelegate](#pointereventdelegate) |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:421](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L421)

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | `CameraChangeDelegate` |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:422](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L422)

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"sceneRendered"`` |
| `callback` | [SceneRenderedDelegate](#scenerendereddelegate) |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:423](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L423)

▸ **off**(`event`, `callback`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `callback` | [DisposedDelegate](#disposeddelegate) |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:424](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L424)

___

#### on

▸ **on**(`event`, `callback`): `void`

Triggered when the viewer is disposed. Listeners should clean up any
resources held and remove the reference to the viewer.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `callback` | [DisposedDelegate](#disposeddelegate) |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:354](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L354)

▸ **on**(`event`, `callback`): `void`

**`example`**
```js
const onClick = (event) => { console.log(event.offsetX, event.offsetY) };
viewer.on('click', onClick);
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"click"`` \| ``"hover"`` |
| `callback` | [PointerEventDelegate](#pointereventdelegate) |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:363](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L363)

▸ **on**(`event`, `callback`): `void`

**`example`**
```js
viewer.on('cameraChange', (position, target) => {
  console.log('Camera changed: ', position, target);
});
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | `CameraChangeDelegate` |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:372](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L372)

▸ **on**(`event`, `callback`): `void`

Event that is triggered immediatly after the scene has been rendered.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"sceneRendered"`` | Metadata about the rendering frame. |
| `callback` | [SceneRenderedDelegate](#scenerendereddelegate) | Callback to trigger when the event occurs. |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:378](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L378)

___

#### removeModel

▸ **removeModel**(`model`): `void`

Removes a model that was previously added using [Cognite3DViewer.addModel](#addmodel),
[Cognite3DViewer.addCadModel](#addcadmodel) or [Cognite3DViewer.addPointCloudModel](#addpointcloudmodel)
.

##### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd) |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:583](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L583)

___

#### removeObject3D

▸ **removeObject3D**(`object`): `void`

Remove a THREE.Object3D from the viewer.

**`example`**
```js
const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(), new THREE.MeshBasicMaterial());
viewer.addObject3D(sphere);
viewer.removeObject3D(sphere);
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `Object3D`<Event\> |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:689](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L689)

___

#### removeUiObject

▸ **removeUiObject**(`object`): `void`

Removes the UI object from the viewer.

##### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `Object3D`<Event\> |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:717](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L717)

___

#### requestRedraw

▸ **requestRedraw**(): `void`

Typically used when you perform some changes and can't see them unless you move camera.

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:864](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L864)

___

#### setBackgroundColor

▸ **setBackgroundColor**(`color`): `void`

Sets the color used as the clear color of the renderer.

##### Parameters

| Name | Type |
| :------ | :------ |
| `color` | `Color` |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:727](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L727)

___

#### setClippingPlanes

▸ **setClippingPlanes**(`clippingPlanes`): `void`

Sets per-pixel clipping planes. Pixels behind any of the planes will be sliced away.

**`example`**
```js
// Hide pixels with values less than 0 in the x direction
const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
viewer.setClippingPlanes([plane]);
```
```js
// Hide pixels with values greater than 20 in the x direction
 const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 20);
viewer.setClippingPlanes([plane]);
```
```js
// Hide pixels with values less than 0 in the x direction or greater than 0 in the y direction
const xPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
const yPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
viewer.setClippingPlanes([xPlane, yPlane]);
```
```js
// Hide pixels behind an arbitrary, non axis-aligned plane
 const plane = new THREE.Plane(new THREE.Vector3(1.5, 20, -19), 20);
viewer.setClippingPlanes([plane]);
```
```js
// Disable clipping planes
 viewer.setClippingPlanes([]);
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clippingPlanes` | `Plane`[] | The planes to use for clipping. |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:767](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L767)

___

#### setLogLevel

▸ **setLogLevel**(`level`): `void`

Sets the log level. Used for debugging.
Defaults to 'none' (which is identical to 'silent').

##### Parameters

| Name | Type |
| :------ | :------ |
| `level` | ``"trace"`` \| ``"debug"`` \| ``"info"`` \| ``"warn"`` \| ``"error"`` \| ``"silent"`` \| ``"none"`` |

##### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:305](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L305)

___

#### setViewState

▸ **setViewState**(`state`): `Promise`<void\>

Restores camera settings from the state provided, and clears all current styled
node collections and applies the `state` object.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [ViewerState](#viewerstate) | Viewer state retrieved from [Cognite3DViewer.getViewState](#getviewstate). |

##### Returns

`Promise`<void\>

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:477](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L477)

___

#### worldToScreen

▸ **worldToScreen**(`point`, `normalize?`): `Vector2`

Convert a point in world space to its coordinates in the canvas. This can be used to place HTML objects near 3D objects on top of the 3D viewer.

**`see`** [https://www.w3schools.com/graphics/canvas_coordinates.asp](https://www.w3schools.com/graphics/canvas_coordinates.asp).

**`example`**
```js
const boundingBoxCenter = new THREE.Vector3();
// Find center of bounding box in world space
model.getBoundingBox(nodeId).getCenter(boundingBoxCenter);
// Screen coordinates of that point
const screenCoordinates = viewer.worldToScreen(boundingBoxCenter);
```
```js
const boundingBoxCenter = new THREE.Vector3();
// Find center of bounding box in world space
model.getBoundingBox(nodeId).getCenter(boundingBoxCenter);
// Screen coordinates of that point normalized in the range [0,1]
const screenCoordinates = viewer.worldToScreen(boundingBoxCenter, true);
```
```js
const boundingBoxCenter = new THREE.Vector3();
// Find center of bounding box in world space
model.getBoundingBox(nodeId).getCenter(boundingBoxCenter);
// Screen coordinates of that point
const screenCoordinates = viewer.worldToScreen(boundingBoxCenter);
if (screenCoordinates == null) {
  // Object not visible on screen
} else {
  // Object is visible on screen
}
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `point` | `Vector3` | World space coordinate. |
| `normalize?` | `boolean` | Optional. If true, coordinates are normalized into [0,1]. If false, the values are in the range [0, <canvas_size>). |

##### Returns

`Vector2`

Returns 2D coordinates if the point is visible on screen, or `null` if object is outside screen.

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:902](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L902)

___

#### isBrowserSupported

▸ `Static` **isBrowserSupported**(): ``true``

For now it just always returns true.

**`see`** Https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#Browser_compatibility.

##### Returns

``true``

##### Defined in

[viewer/core/src/public/migration/Cognite3DViewer.ts:79](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/Cognite3DViewer.ts#L79)


<a name="classes_cognite_revealcognitepointcloudmodelmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / CognitePointCloudModel

## Class: CognitePointCloudModel

[@cognite/reveal](#modules_cognite_revealmd).CognitePointCloudModel

### Hierarchy

- `Object3D`

  ↳ **CognitePointCloudModel**

### Implements

- [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd)

### Table of contents

#### Properties

- [modelId](#modelid)
- [revisionId](#revisionid)
- [type](#type)

#### Accessors

- [pointColorType](#pointcolortype)
- [pointShape](#pointshape)
- [pointSize](#pointsize)
- [visiblePointCount](#visiblepointcount)

#### Methods

- [dispose](#dispose)
- [getCameraConfiguration](#getcameraconfiguration)
- [getClasses](#getclasses)
- [getModelBoundingBox](#getmodelboundingbox)
- [getModelTransformation](#getmodeltransformation)
- [hasClass](#hasclass)
- [isClassVisible](#isclassvisible)
- [setClassVisible](#setclassvisible)
- [setModelTransformation](#setmodeltransformation)

### Properties

#### modelId

• `Readonly` **modelId**: `number`

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:19](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L19)

___

#### revisionId

• `Readonly` **revisionId**: `number`

The modelId of the point cloud model in Cognite Data Fusion.

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L23)

___

#### type

• `Readonly` **type**: [SupportedModelTypes](#supportedmodeltypes) = 'pointcloud'

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[type](#type)

##### Overrides

THREE.Object3D.type

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:18](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L18)

### Accessors

#### pointColorType

• `get` **pointColorType**(): [PotreePointColorType](#enums_cognite_revealpotreepointcolortypemd)

Determines how points currently are colored.

##### Returns

[PotreePointColorType](#enums_cognite_revealpotreepointcolortypemd)

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:146](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L146)

• `set` **pointColorType**(`type`): `void`

Specifies how points are colored.

**`default`** PotreePointColorType.Rgb

**`example`**
```js
model.pointColorType = PotreePointColorType.Rgb
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [PotreePointColorType](#enums_cognite_revealpotreepointcolortypemd) |

##### Returns

`void`

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:158](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L158)

___

#### pointShape

• `get` **pointShape**(): [PotreePointShape](#enums_cognite_revealpotreepointshapemd)

Sets the point shape of each rendered point in the point cloud.

**`default`** `PotreePointShape.Circle`

**`see`** [PotreePointShape](#enums_cognite_revealpotreepointshapemd).

##### Returns

[PotreePointShape](#enums_cognite_revealpotreepointshapemd)

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:182](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L182)

• `set` **pointShape**(`shape`): `void`

Gets the point shape of each rendered point in the point cloud.

**`see`** [PotreePointShape](#enums_cognite_revealpotreepointshapemd).

##### Parameters

| Name | Type |
| :------ | :------ |
| `shape` | [PotreePointShape](#enums_cognite_revealpotreepointshapemd) |

##### Returns

`void`

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:190](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L190)

___

#### pointSize

• `get` **pointSize**(): `number`

Returns the size of each rendered point in the point cloud.

##### Returns

`number`

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:165](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L165)

• `set` **pointSize**(`size`): `void`

Sets the size of each rendered point in the point cloud.

**`default`** `1`

##### Parameters

| Name | Type |
| :------ | :------ |
| `size` | `number` |

##### Returns

`void`

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:173](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L173)

___

#### visiblePointCount

• `get` **visiblePointCount**(): `number`

Returns the current number of visible/loaded points.

##### Returns

`number`

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:139](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L139)

### Methods

#### dispose

▸ **dispose**(): `void`

Used to clean up memory.

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[dispose](#dispose)

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:48](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L48)

___

#### getCameraConfiguration

▸ **getCameraConfiguration**(): [CameraConfiguration](#cameraconfiguration)

Retrieves the camera position and target stored for the model. Typically this
is used to store a good starting position for a model. Returns `undefined` if there
isn't any stored camera configuration for the model.

##### Returns

[CameraConfiguration](#cameraconfiguration)

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getCameraConfiguration](#getcameraconfiguration)

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:76](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L76)

___

#### getClasses

▸ **getClasses**(): `number`[]

Returns a list of sorted classification codes present in the model.

##### Returns

`number`[]

A sorted list of classification codes from the model.

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:132](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L132)

___

#### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`): `Box3`

**`example`**
```js
const box = new THREE.Box3()
model.getModelBoundingBox(box);
// box now has the bounding box
```
```js
// the following code does the same
const box = model.getModelBoundingBox();
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `outBbox?` | `Box3` | Optional. Used to write result to. |

##### Returns

`Box3`

Model's bounding box.

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getModelBoundingBox](#getmodelboundingbox)

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:67](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L67)

___

#### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

Gets transformation matrix of the model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `out?` | `Matrix4` | Preallocated `THREE.Matrix4` (optional). |

##### Returns

`Matrix4`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[getModelTransformation](#getmodeltransformation)

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:92](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L92)

___

#### hasClass

▸ **hasClass**(`pointClass`): `boolean`

Returns true if the model has values with the given classification class.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` | ASPRS classification class code. Either one of the well known classes from [WellKnownAsprsPointClassCodes](#enums_cognite_revealwellknownasprspointclasscodesmd) or a number for user defined classes. |

##### Returns

`boolean`

True if model has values in the class given.

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:124](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L124)

___

#### isClassVisible

▸ **isClassVisible**(`pointClass`): `boolean`

Determines if points from a given class are visible.

**`throws`** Error if the model doesn't have the class given.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` | ASPRS classification class code. Either one of the well known classes from [WellKnownAsprsPointClassCodes](#enums_cognite_revealwellknownasprspointclasscodesmd) or a number for user defined classes. |

##### Returns

`boolean`

True if points from the given class will be visible.

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:114](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L114)

___

#### setClassVisible

▸ **setClassVisible**(`pointClass`, `visible`): `void`

Sets a visible filter on points of a given class.

**`throws`** Error if the model doesn't have the class given.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pointClass` | `number` | ASPRS classification class code. Either one of the well known classes from [WellKnownAsprsPointClassCodes](#enums_cognite_revealwellknownasprspointclasscodesmd) or a number for user defined classes. |
| `visible` | `boolean` | Boolean flag that determines if the point class type should be visible or not. |

##### Returns

`void`

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:103](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L103)

___

#### setModelTransformation

▸ **setModelTransformation**(`transformationMatrix`): `void`

Sets transformation matrix of the model. This overrides the current transformation.

##### Parameters

| Name | Type |
| :------ | :------ |
| `transformationMatrix` | `Matrix4` |

##### Returns

`void`

##### Implementation of

[CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd).[setModelTransformation](#setmodeltransformation)

##### Defined in

[viewer/packages/pointclouds/src/CognitePointCloudModel.ts:84](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/CognitePointCloudModel.ts#L84)


<a name="classes_cognite_revealcombocontrolsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / ComboControls

## Class: ComboControls

[@cognite/reveal](#modules_cognite_revealmd).ComboControls

### Hierarchy

- `EventDispatcher`

  ↳ **ComboControls**

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

[viewer/packages/camera-manager/src/ComboControls.ts:106](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L106)

### Properties

#### EPSILON

• **EPSILON**: `number` = 0.001

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:70](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L70)

___

#### dampingFactor

• **dampingFactor**: `number` = 0.25

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:48](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L48)

___

#### dispose

• **dispose**: () => `void`

##### Type declaration

▸ (): `void`

###### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:71](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L71)

___

#### dollyFactor

• **dollyFactor**: `number` = 0.99

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:52](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L52)

___

#### dynamicTarget

• **dynamicTarget**: `boolean` = true

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:49](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L49)

___

#### enableDamping

• **enableDamping**: `boolean` = true

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:47](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L47)

___

#### enableKeyboardNavigation

• **enableKeyboardNavigation**: `boolean` = true

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:61](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L61)

___

#### enabled

• **enabled**: `boolean` = true

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:46](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L46)

___

#### firstPersonRotationFactor

• **firstPersonRotationFactor**: `number` = 0.4

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:58](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L58)

___

#### keyboardDollySpeed

• **keyboardDollySpeed**: `number` = 2

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:65](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L65)

___

#### keyboardPanSpeed

• **keyboardPanSpeed**: `number` = 10

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:66](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L66)

___

#### keyboardRotationSpeedAzimuth

• **keyboardRotationSpeedAzimuth**: `number`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:62](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L62)

___

#### keyboardRotationSpeedPolar

• **keyboardRotationSpeedPolar**: `number`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:63](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L63)

___

#### keyboardSpeedFactor

• **keyboardSpeedFactor**: `number` = 3

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:67](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L67)

___

#### lookAtViewTarget

• **lookAtViewTarget**: `boolean` = false

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:76](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L76)

___

#### maxAzimuthAngle

• **maxAzimuthAngle**: `number`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:56](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L56)

___

#### maxDeltaDownscaleCoefficient

• **maxDeltaDownscaleCoefficient**: `number` = 1

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:82](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L82)

___

#### maxDeltaRatio

• **maxDeltaRatio**: `number` = 8

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:80](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L80)

___

#### maxPolarAngle

• **maxPolarAngle**: `number`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:54](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L54)

___

#### maxZoom

• **maxZoom**: `number`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:73](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L73)

___

#### minAzimuthAngle

• **minAzimuthAngle**: `number` = -Infinity

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:55](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L55)

___

#### minDeltaDownscaleCoefficient

• **minDeltaDownscaleCoefficient**: `number` = 0.1

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:81](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L81)

___

#### minDeltaRatio

• **minDeltaRatio**: `number` = 1

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:79](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L79)

___

#### minDistance

• **minDistance**: `number` = 0.8

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:50](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L50)

___

#### minPolarAngle

• **minPolarAngle**: `number` = 0

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:53](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L53)

___

#### minZoom

• **minZoom**: `number` = 0

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:72](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L72)

___

#### minZoomDistance

• **minZoomDistance**: `number` = 0.4

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:51](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L51)

___

#### mouseFirstPersonRotationSpeed

• **mouseFirstPersonRotationSpeed**: `number`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:64](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L64)

___

#### orthographicCameraDollyFactor

• **orthographicCameraDollyFactor**: `number` = 0.3

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:74](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L74)

___

#### panDollyMinDistanceFactor

• **panDollyMinDistanceFactor**: `number` = 10.0

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:57](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L57)

___

#### pinchEpsilon

• **pinchEpsilon**: `number` = 2

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:68](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L68)

___

#### pinchPanSpeed

• **pinchPanSpeed**: `number` = 1

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:69](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L69)

___

#### pointerRotationSpeedAzimuth

• **pointerRotationSpeedAzimuth**: `number`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:59](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L59)

___

#### pointerRotationSpeedPolar

• **pointerRotationSpeedPolar**: `number`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:60](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L60)

___

#### useScrollTarget

• **useScrollTarget**: `boolean` = false

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:77](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L77)

___

#### zoomToCursor

• **zoomToCursor**: `boolean` = true

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:78](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L78)

### Accessors

#### cameraRawRotation

• `get` **cameraRawRotation**(): `Quaternion`

Camera rotation to be used by the camera instead of target-based rotation.
This rotation is used only when set to non-default quaternion value (not identity rotation quaternion).
Externally, value is updated by `CameraManager` when `setState` method with non-zero rotation is called. Automatically
resets to default value when `setState` method is called with no rotation value.

##### Returns

`Quaternion`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:255](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L255)

### Methods

#### getScrollTarget

▸ **getScrollTarget**(): `Vector3`

##### Returns

`Vector3`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:267](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L267)

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

[viewer/packages/camera-manager/src/ComboControls.ts:230](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L230)

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

[viewer/packages/camera-manager/src/ComboControls.ts:263](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L263)

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

[viewer/packages/camera-manager/src/ComboControls.ts:238](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L238)

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

[viewer/packages/camera-manager/src/ComboControls.ts:259](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L259)

___

#### triggerCameraChangeEvent

▸ **triggerCameraChangeEvent**(): `void`

##### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:271](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L271)

___

#### update

▸ **update**(`deltaTime`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `deltaTime` | `number` |

##### Returns

`boolean`

##### Defined in

[viewer/packages/camera-manager/src/ComboControls.ts:144](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/ComboControls.ts#L144)


<a name="classes_cognite_revealdefaultcameramanagermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / DefaultCameraManager

## Class: DefaultCameraManager

[@cognite/reveal](#modules_cognite_revealmd).DefaultCameraManager

Default implementation of [CameraManager](#interfaces_cognite_revealcameramanagermd). Uses target-based orbit controls combined with
keyboard and mouse navigation possibility. Supports automatic update of camera near and far
planes and animated change of camera position and target.

### Implements

- [CameraManager](#interfaces_cognite_revealcameramanagermd)

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

• **automaticControlsSensitivity**: `boolean` = true

When false, the sensitivity of the camera controls will not be updated automatically.
This can be useful to better control the sensitivity of the 3D navigation.

When not set, control the sensitivity of the camera using `viewer.cameraManager.cameraControls.minDistance`
and `viewer.cameraManager.cameraControls.maxDistance`.

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:79](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L79)

___

#### automaticNearFarPlane

• **automaticNearFarPlane**: `boolean` = true

When false, camera near and far planes will not be updated automatically (defaults to true).
This can be useful when you have custom content in the 3D view and need to better
control the view frustum.

When automatic camera near/far planes are disabled, you are responsible for setting
this on your own.

**`example`**
```
viewer.camera.near = 0.1;
viewer.camera.far = 1000.0;
viewer.camera.updateProjectionMatrix();
```

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:71](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L71)

### Accessors

#### cameraControls

• `get` **cameraControls**(): [ComboControls](#classes_cognite_revealcombocontrolsmd)

Gets instance of camera controls that are used by camera manager. See [ComboControls](#classes_cognite_revealcombocontrolsmd) for more
information on all adjustable properties.

##### Returns

[ComboControls](#classes_cognite_revealcombocontrolsmd)

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:141](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L141)

___

#### cameraControlsEnabled

• `get` **cameraControlsEnabled**(): `boolean`

Gets whether camera controls through mouse, touch and keyboard are enabled.

##### Returns

`boolean`

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:157](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L157)

• `set` **cameraControlsEnabled**(`enabled`): `void`

Sets whether camera controls through mouse, touch and keyboard are enabled.
This can be useful to e.g. temporarily disable navigation when manipulating other
objects in the scene or when implementing a "cinematic" viewer.

##### Parameters

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

##### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:150](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L150)

___

#### keyboardNavigationEnabled

• `get` **keyboardNavigationEnabled**(): `boolean`

Whether keyboard control of the camera is enabled/disabled.

##### Returns

`boolean`

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:171](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L171)

• `set` **keyboardNavigationEnabled**(`enabled`): `void`

Sets whether keyboard control of the camera is enabled/disabled.

##### Parameters

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

##### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:164](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L164)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Implementation of

[CameraManager](#interfaces_cognite_revealcameramanagermd).[dispose](#dispose)

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:241](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L241)

___

#### fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`box`, `duration?`, `radiusFactor?`): `void`

Moves camera to a place where the content of a bounding box is visible to the camera.

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `box` | `Box3` | `undefined` |
| `duration?` | `number` | `undefined` |
| `radiusFactor` | `number` | 2 |

##### Returns

`void`

##### Implementation of

[CameraManager](#interfaces_cognite_revealcameramanagermd).[fitCameraToBoundingBox](#fitcameratoboundingbox)

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:127](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L127)

___

#### getCamera

▸ **getCamera**(): `PerspectiveCamera`

Returns the camera used for rendering in [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd).
Note that the camera will not be modified directly by Reveal.
Implementations must trigger the `cameraChange`-event whenever the
camera changes.

##### Returns

`PerspectiveCamera`

##### Implementation of

[CameraManager](#interfaces_cognite_revealcameramanagermd).[getCamera](#getcamera)

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:175](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L175)

___

#### getCameraControlsOptions

▸ **getCameraControlsOptions**(): [CameraControlsOptions](#cameracontrolsoptions)

Gets current camera controls options.

##### Returns

[CameraControlsOptions](#cameracontrolsoptions)

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:216](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L216)

___

#### getCameraState

▸ **getCameraState**(): `Required`<[CameraState](#camerastate)\>

Get camera's state

##### Returns

`Required`<[CameraState](#camerastate)\>

##### Implementation of

[CameraManager](#interfaces_cognite_revealcameramanagermd).[getCameraState](#getcamerastate)

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:205](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L205)

___

#### off

▸ **off**(`event`, `callback`): `void`

Unsubscribes from changes of the camera event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | [CameraChangeDelegate](#camerachangedelegate) |

##### Returns

`void`

##### Implementation of

[CameraManager](#interfaces_cognite_revealcameramanagermd).[off](#off)

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:117](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L117)

___

#### on

▸ **on**(`event`, `callback`): `void`

Subscribes to changes of the camera event. This is used by Reveal to react on changes of the camera.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"cameraChange"`` |
| `callback` | [CameraChangeDelegate](#camerachangedelegate) |

##### Returns

`void`

##### Implementation of

[CameraManager](#interfaces_cognite_revealcameramanagermd).[on](#on)

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:107](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L107)

___

#### setCameraControlsOptions

▸ **setCameraControlsOptions**(`controlsOptions`): `void`

Sets camera controls options to customize camera controls modes. See [CameraControlsOptions](#cameracontrolsoptions).

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `controlsOptions` | [CameraControlsOptions](#cameracontrolsoptions) | JSON object with camera controls options. |

##### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:224](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L224)

___

#### setCameraState

▸ **setCameraState**(`state`): `void`

Sets camera state. All parameters are optional. Rotation and target can't be set at the same time,
if so, error will be thrown. Set rotation is preserved until next call of setCameraState with
empty rotation field.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [CameraState](#camerastate) | Camera state. |

##### Returns

`void`

##### Implementation of

[CameraManager](#interfaces_cognite_revealcameramanagermd).[setCameraState](#setcamerastate)

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:185](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L185)

___

#### update

▸ **update**(`deltaTime`, `boundingBox`): `void`

Updates internal state of camera manager. Expected to update visual state of the camera
as well as it's near and far planes if needed. Called in `requestAnimationFrame`-loop.
Reveal performance affects frequency with which this method is called.

##### Parameters

| Name | Type |
| :------ | :------ |
| `deltaTime` | `number` |
| `boundingBox` | `Box3` |

##### Returns

`void`

##### Implementation of

[CameraManager](#interfaces_cognite_revealcameramanagermd).[update](#update)

##### Defined in

[viewer/packages/camera-manager/src/DefaultCameraManager.ts:231](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/DefaultCameraManager.ts#L231)


<a name="classes_cognite_revealindexsetmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / IndexSet

## Class: IndexSet

[@cognite/reveal](#modules_cognite_revealmd).IndexSet

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
| `values?` | `Iterable`<number\> |

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:11](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L11)

• **new IndexSet**(`values?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `values?` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:13](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L13)

### Properties

#### rootNode

• `Optional` **rootNode**: `IndexNode`

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:11](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L11)

### Accessors

#### count

• `get` **count**(): `number`

##### Returns

`number`

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:68](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L68)

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

[viewer/packages/utilities/src/indexset/IndexSet.ts:33](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L33)

___

#### addRange

▸ **addRange**(`range`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`void`

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:39](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L39)

___

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:211](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L211)

___

#### clone

▸ **clone**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:215](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L215)

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

[viewer/packages/utilities/src/indexset/IndexSet.ts:60](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L60)

___

#### differenceWith

▸ **differenceWith**(`otherSet`): [IndexSet](#classes_cognite_revealindexsetmd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [IndexSet](#classes_cognite_revealindexsetmd) |

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:135](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L135)

___

#### forEachRange

▸ **forEachRange**(`visitor`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `visitor` | (`range`: [NumericRange](#classes_cognite_revealnumericrangemd)) => `void` |

##### Returns

`void`

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:27](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L27)

___

#### hasIntersectionWith

▸ **hasIntersectionWith**(`otherSet`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [IndexSet](#classes_cognite_revealindexsetmd) \| `Set`<number\> \| `Map`<number, number\> |

##### Returns

`boolean`

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:145](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L145)

___

#### intersectWith

▸ **intersectWith**(`otherSet`): [IndexSet](#classes_cognite_revealindexsetmd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [IndexSet](#classes_cognite_revealindexsetmd) |

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:171](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L171)

___

#### invertedRanges

▸ **invertedRanges**(): [NumericRange](#classes_cognite_revealnumericrangemd)[]

##### Returns

[NumericRange](#classes_cognite_revealnumericrangemd)[]

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:105](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L105)

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

[viewer/packages/utilities/src/indexset/IndexSet.ts:47](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L47)

___

#### removeRange

▸ **removeRange**(`range`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`void`

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:52](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L52)

___

#### toIndexArray

▸ **toIndexArray**(): `number`[]

##### Returns

`number`[]

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:84](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L84)

___

#### toPlainSet

▸ **toPlainSet**(): `Set`<number\>

##### Returns

`Set`<number\>

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:98](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L98)

___

#### toRangeArray

▸ **toRangeArray**(): [NumericRange](#classes_cognite_revealnumericrangemd)[]

##### Returns

[NumericRange](#classes_cognite_revealnumericrangemd)[]

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:76](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L76)

___

#### unionWith

▸ **unionWith**(`otherSet`): [IndexSet](#classes_cognite_revealindexsetmd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `otherSet` | [IndexSet](#classes_cognite_revealindexsetmd) |

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Defined in

[viewer/packages/utilities/src/indexset/IndexSet.ts:123](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/indexset/IndexSet.ts#L123)


<a name="classes_cognite_revealintersectionnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / IntersectionNodeCollection

## Class: IntersectionNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).IntersectionNodeCollection

Node collection that is the intersection between a set of underlying node collections.

### Hierarchy

- `CombineNodeCollectionBase`

  ↳ **IntersectionNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
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
| `nodeCollections?` | [NodeCollection](#classes_cognite_revealnodecollectionmd)[] |

##### Overrides

CombineNodeCollectionBase.constructor

##### Defined in

[viewer/packages/cad-styling/src/IntersectionNodeCollection.ts:20](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/IntersectionNodeCollection.ts#L20)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"IntersectionNodeCollection"``

##### Defined in

[viewer/packages/cad-styling/src/IntersectionNodeCollection.ts:20](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/IntersectionNodeCollection.ts#L20)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

**`override`**

##### Returns

`boolean`

##### Defined in

[viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts:67](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L67)

### Methods

#### add

▸ **add**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollection](#classes_cognite_revealnodecollectionmd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.add

##### Defined in

[viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L26)

___

#### clear

▸ **clear**(): `void`

Clears all underlying node collections.

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.clear

##### Defined in

[viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts:46](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L46)

___

#### getAreas

▸ **getAreas**(): [AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Returns

[AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Overrides

CombineNodeCollectionBase.getAreas

##### Defined in

[viewer/packages/cad-styling/src/IntersectionNodeCollection.ts:52](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/IntersectionNodeCollection.ts#L52)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

**`override`**

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Inherited from

CombineNodeCollectionBase.getIndexSet

##### Defined in

[viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts:59](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L59)

___

#### makeDirty

▸ **makeDirty**(): `void`

##### Returns

`void`

##### Overrides

CombineNodeCollectionBase.makeDirty

##### Defined in

[viewer/packages/cad-styling/src/IntersectionNodeCollection.ts:46](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/IntersectionNodeCollection.ts#L46)

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

[viewer/packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[viewer/packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### remove

▸ **remove**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollection](#classes_cognite_revealnodecollectionmd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.remove

##### Defined in

[viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L32)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

CombineNodeCollectionBase.serialize

##### Defined in

[viewer/packages/cad-styling/src/IntersectionNodeCollection.ts:26](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/IntersectionNodeCollection.ts#L26)


<a name="classes_cognite_revealinvertednodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / InvertedNodeCollection

## Class: InvertedNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).InvertedNodeCollection

Node collection that inverts the result from another node collection.

### Hierarchy

- [NodeCollection](#classes_cognite_revealnodecollectionmd)

  ↳ **InvertedNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

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

### Constructors

#### constructor

• **new InvertedNodeCollection**(`model`, `innerSet`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [CdfModelNodeCollectionDataProvider](#interfaces_cognite_revealcdfmodelnodecollectiondataprovidermd) |
| `innerSet` | [NodeCollection](#classes_cognite_revealnodecollectionmd) |

##### Overrides

NodeCollection.constructor

##### Defined in

[viewer/packages/cad-styling/src/InvertedNodeCollection.ts:19](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L19)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"InvertedNodeCollection"``

##### Defined in

[viewer/packages/cad-styling/src/InvertedNodeCollection.ts:15](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L15)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Defined in

[viewer/packages/cad-styling/src/InvertedNodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L32)

### Methods

#### clear

▸ **clear**(): `never`

Not supported.

**`throws`** Always throws an error.

##### Returns

`never`

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[clear](#clear)

##### Defined in

[viewer/packages/cad-styling/src/InvertedNodeCollection.ts:58](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L58)

___

#### getAreas

▸ **getAreas**(): [AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Returns

[AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[getAreas](#getareas)

##### Defined in

[viewer/packages/cad-styling/src/InvertedNodeCollection.ts:47](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L47)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[getIndexSet](#getindexset)

##### Defined in

[viewer/packages/cad-styling/src/InvertedNodeCollection.ts:36](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L36)

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

[NodeCollection](#classes_cognite_revealnodecollectionmd).[off](#off)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[NodeCollection](#classes_cognite_revealnodecollectionmd).[on](#on)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[serialize](#serialize)

##### Defined in

[viewer/packages/cad-styling/src/InvertedNodeCollection.ts:51](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/InvertedNodeCollection.ts#L51)


<a name="classes_cognite_revealnodeappearanceprovidermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / NodeAppearanceProvider

## Class: NodeAppearanceProvider

[@cognite/reveal](#modules_cognite_revealmd).NodeAppearanceProvider

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

[viewer/packages/cad-styling/src/NodeAppearanceProvider.ts:155](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L155)

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

[viewer/packages/cad-styling/src/NodeAppearanceProvider.ts:118](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L118)

___

#### assignStyledNodeCollection

▸ **assignStyledNodeCollection**(`nodeCollection`, `appearance`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollection](#classes_cognite_revealnodecollectionmd) |
| `appearance` | [NodeAppearance](#nodeappearance) |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearanceProvider.ts:82](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L82)

___

#### clear

▸ **clear**(): `void`

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearanceProvider.ts:146](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L146)

___

#### getPrioritizedAreas

▸ **getPrioritizedAreas**(): `PrioritizedArea`[]

##### Returns

`PrioritizedArea`[]

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearanceProvider.ts:125](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L125)

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

[viewer/packages/cad-styling/src/NodeAppearanceProvider.ts:60](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L60)

▸ **off**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"loadingStateChanged"`` |
| `listener` | (`isLoading`: `boolean`) => `void` |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearanceProvider.ts:61](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L61)

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

[viewer/packages/cad-styling/src/NodeAppearanceProvider.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L37)

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"loadingStateChanged"`` |
| `listener` | (`isLoading`: `boolean`) => `void` |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearanceProvider.ts:38](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L38)

▸ **on**(`event`, `listener`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"prioritizedAreasChanged"`` |
| `listener` | () => `void` |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearanceProvider.ts:39](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L39)

___

#### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollection](#classes_cognite_revealnodecollectionmd) |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearanceProvider.ts:106](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L106)


<a name="classes_cognite_revealnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / NodeCollection

## Class: NodeCollection

[@cognite/reveal](#modules_cognite_revealmd).NodeCollection

Abstract class for implementing a set of nodes to be styled.

### Hierarchy

- **NodeCollection**

  ↳ [TreeIndexNodeCollection](#classes_cognite_revealtreeindexnodecollectionmd)

  ↳ [PropertyFilterNodeCollection](#classes_cognite_revealpropertyfilternodecollectionmd)

  ↳ [SinglePropertyFilterNodeCollection](#classes_cognite_revealsinglepropertyfilternodecollectionmd)

  ↳ [AssetNodeCollection](#classes_cognite_revealassetnodecollectionmd)

  ↳ [InvertedNodeCollection](#classes_cognite_revealinvertednodecollectionmd)

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

[viewer/packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `Abstract` `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L37)

### Methods

#### clear

▸ `Abstract` **clear**(): `void`

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:40](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L40)

___

#### getAreas

▸ `Abstract` **getAreas**(): [AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Returns

[AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:39](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L39)

___

#### getIndexSet

▸ `Abstract` **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:38](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L38)

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

[viewer/packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[viewer/packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ `Abstract` **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:41](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L41)


<a name="classes_cognite_revealnotsupportedinmigrationwrappererrormd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / NotSupportedInMigrationWrapperError

## Class: NotSupportedInMigrationWrapperError

[@cognite/reveal](#modules_cognite_revealmd).NotSupportedInMigrationWrapperError

### Hierarchy

- `Error`

  ↳ **NotSupportedInMigrationWrapperError**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [message](#message)
- [name](#name)
- [stack](#stack)

### Constructors

#### constructor

• **new NotSupportedInMigrationWrapperError**(`message?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

##### Overrides

Error.constructor

##### Defined in

[viewer/core/src/public/migration/NotSupportedInMigrationWrapperError.ts:10](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/NotSupportedInMigrationWrapperError.ts#L10)

### Properties

#### message

• **message**: `string`

##### Inherited from

Error.message

##### Defined in

documentation/node_modules/typescript/lib/lib.es5.d.ts:974

___

#### name

• **name**: `string`

##### Inherited from

Error.name

##### Defined in

documentation/node_modules/typescript/lib/lib.es5.d.ts:973

___

#### stack

• `Optional` **stack**: `string`

##### Inherited from

Error.stack

##### Defined in

documentation/node_modules/typescript/lib/lib.es5.d.ts:975


<a name="classes_cognite_revealnumericrangemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / NumericRange

## Class: NumericRange

[@cognite/reveal](#modules_cognite_revealmd).NumericRange

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

[viewer/packages/utilities/src/NumericRange.ts:8](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L8)

### Properties

#### count

• `Readonly` **count**: `number`

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:7](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L7)

___

#### from

• `Readonly` **from**: `number`

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:6](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L6)

___

#### toInclusive

• `Readonly` **toInclusive**: `number`

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:8](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L8)

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

[viewer/packages/utilities/src/NumericRange.ts:38](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L38)

___

#### equal

▸ **equal**(`other`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `other` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:34](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L34)

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

[viewer/packages/utilities/src/NumericRange.ts:72](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L72)

___

#### intersectionWith

▸ **intersectionWith**(`range`): [NumericRange](#classes_cognite_revealnumericrangemd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

[NumericRange](#classes_cognite_revealnumericrangemd)

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:50](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L50)

___

#### intersects

▸ **intersects**(`range`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:42](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L42)

___

#### intersectsOrCoinciding

▸ **intersectsOrCoinciding**(`range`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:46](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L46)

___

#### isInside

▸ **isInside**(`range`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

`boolean`

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:61](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L61)

___

#### toArray

▸ **toArray**(): `number`[]

##### Returns

`number`[]

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:30](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L30)

___

#### toString

▸ **toString**(): `string`

##### Returns

`string`

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:78](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L78)

___

#### union

▸ **union**(`range`): [NumericRange](#classes_cognite_revealnumericrangemd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Returns

[NumericRange](#classes_cognite_revealnumericrangemd)

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:65](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L65)

___

#### values

▸ **values**(): `Generator`<number, any, unknown\>

##### Returns

`Generator`<number, any, unknown\>

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:24](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L24)

___

#### createFromInterval

▸ `Static` **createFromInterval**(`from`, `toInclusive`): [NumericRange](#classes_cognite_revealnumericrangemd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `from` | `number` |
| `toInclusive` | `number` |

##### Returns

[NumericRange](#classes_cognite_revealnumericrangemd)

##### Defined in

[viewer/packages/utilities/src/NumericRange.ts:20](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L20)

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

[viewer/packages/utilities/src/NumericRange.ts:82](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/NumericRange.ts#L82)


<a name="classes_cognite_revealpropertyfilternodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / PropertyFilterNodeCollection

## Class: PropertyFilterNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).PropertyFilterNodeCollection

Represents a set of nodes that has matching node properties to a provided filter. Note that
a node is considered to match if it or a [NodeCollection](#classes_cognite_revealnodecollectionmd) ancestors match the filter.

### Hierarchy

- [NodeCollection](#classes_cognite_revealnodecollectionmd)

  ↳ **PropertyFilterNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
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
| `model` | [CdfModelNodeCollectionDataProvider](#interfaces_cognite_revealcdfmodelnodecollectiondataprovidermd) |
| `options` | `PropertyFilterNodeCollectionOptions` |

##### Overrides

NodeCollection.constructor

##### Defined in

[viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts:51](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L51)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"PropertyFilterNodeCollection"``

##### Defined in

[viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts:38](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L38)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Defined in

[viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts:64](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L64)

### Methods

#### clear

▸ **clear**(): `void`

Clears the node collection and interrupts any ongoing operations.

##### Returns

`void`

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[clear](#clear)

##### Defined in

[viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts:126](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L126)

___

#### executeFilter

▸ **executeFilter**(`filter`): `Promise`<void\>

Populates the node collection with nodes matching the provided filter. This will replace
the current nodes held by the filter.

**`example`**
```
set.executeFilter({ 'PDMS': { 'Module': 'AQ550' }});
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | `Object` | A filter for matching node properties. |

##### Returns

`Promise`<void\>

##### Defined in

[viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts:77](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L77)

___

#### getAreas

▸ **getAreas**(): [AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Returns

[AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[getAreas](#getareas)

##### Defined in

[viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts:138](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L138)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[getIndexSet](#getindexset)

##### Defined in

[viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts:134](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L134)

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

[NodeCollection](#classes_cognite_revealnodecollectionmd).[off](#off)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[NodeCollection](#classes_cognite_revealnodecollectionmd).[on](#on)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[serialize](#serialize)

##### Defined in

[viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts:142](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/PropertyFilterNodeCollection.ts#L142)


<a name="classes_cognite_revealsinglepropertyfilternodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / SinglePropertyFilterNodeCollection

## Class: SinglePropertyFilterNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).SinglePropertyFilterNodeCollection

Node collection that filters nodes based on a node property from a list of values, similarly to how
`SELECT ... IN (...)` works. This is useful when looking up nodes based on a list of identifiers,
nodes within a set of areas or systems. The node set is optimized for matching with properties with
a large number of values (i.e. thousands).

### Hierarchy

- [NodeCollection](#classes_cognite_revealnodecollectionmd)

  ↳ **SinglePropertyFilterNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
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

Construct a new node set.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | `default` | {@link CogniteClient} authenticated to the project the model is loaded from. |
| `model` | [CdfModelNodeCollectionDataProvider](#interfaces_cognite_revealcdfmodelnodecollectiondataprovidermd) | CAD model. |
| `options` | `PropertyFilterNodeCollectionOptions` |  |

##### Overrides

NodeCollection.constructor

##### Defined in

[viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:43](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L43)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"SinglePropertyNodeCollection"``

##### Defined in

[viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:29](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L29)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Defined in

[viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:61](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L61)

### Methods

#### clear

▸ **clear**(): `void`

Clears the node set and interrupts any ongoing operations.

##### Returns

`void`

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[clear](#clear)

##### Defined in

[viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:125](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L125)

___

#### executeFilter

▸ **executeFilter**(`propertyCategory`, `propertyKey`, `propertyValues`): `Promise`<void\>

Execute filter asynchronously, replacing any existing filter active. When {@link propertyValues}
contains more than 1000 elements, the operation will be split into multiple batches that
are executed in parallel. Note that when providing a {@link PropertyFilterNodeCollectionOptions.requestPartitions}
during construction of the node set, the total number of batches will be requestPartitions*numberOfBatches.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `propertyCategory` | `string` | Node property category, e.g. `'PDMS'`. |
| `propertyKey` | `string` | Node property key, e.g. `':FU'`. |
| `propertyValues` | `string`[] | Lookup values, e.g. `["AR100APG539","AP500INF534","AP400INF553", ...]` |

##### Returns

`Promise`<void\>

##### Defined in

[viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:75](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L75)

___

#### getAreas

▸ **getAreas**(): [AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Returns

[AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[getAreas](#getareas)

##### Defined in

[viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:137](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L137)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[getIndexSet](#getindexset)

##### Defined in

[viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:133](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L133)

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

[NodeCollection](#classes_cognite_revealnodecollectionmd).[off](#off)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[NodeCollection](#classes_cognite_revealnodecollectionmd).[on](#on)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[serialize](#serialize)

##### Defined in

[viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts:147](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/SinglePropertyFilterNodeCollection.ts#L147)


<a name="classes_cognite_revealtreeindexnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / TreeIndexNodeCollection

## Class: TreeIndexNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).TreeIndexNodeCollection

Node collection that holds a set of nodes defined by a set of tree indices.

### Hierarchy

- [NodeCollection](#classes_cognite_revealnodecollectionmd)

  ↳ **TreeIndexNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
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
| `treeIndexSet?` | [IndexSet](#classes_cognite_revealindexsetmd) |

##### Overrides

NodeCollection.constructor

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:21](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L21)

• **new TreeIndexNodeCollection**(`treeIndices?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndices?` | `Iterable`<number\> |

##### Overrides

NodeCollection.constructor

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L23)

• **new TreeIndexNodeCollection**(`treeIndexRange?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndexRange?` | [NumericRange](#classes_cognite_revealnumericrangemd) |

##### Overrides

NodeCollection.constructor

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:24](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L24)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"TreeIndexNodeCollection"``

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:18](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L18)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

##### Returns

`boolean`

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:99](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L99)

### Methods

#### addAreaPoints

▸ **addAreaPoints**(`points`): `void`

Add points to this node collection's area set.
This effectively adds boxes of size 1x1x1 meter with the points as their centers.

##### Parameters

| Name | Type |
| :------ | :------ |
| `points` | `Vector3`[] |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:85](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L85)

___

#### addAreas

▸ **addAreas**(`areas`): `void`

Add areas to this node collection's area set.
Nearby areas may be clustered and merged together to keep
the number of areas in the set small.

##### Parameters

| Name | Type |
| :------ | :------ |
| `areas` | `Box3`[] |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:73](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L73)

___

#### clear

▸ **clear**(): `void`

Sets this set to hold an empty set.

##### Returns

`void`

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[clear](#clear)

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:45](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L45)

___

#### clearAreas

▸ **clearAreas**(): `void`

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:95](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L95)

___

#### getAreas

▸ **getAreas**(): [AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Returns

[AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[getAreas](#getareas)

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:54](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L54)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[getIndexSet](#getindexset)

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:50](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L50)

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

[NodeCollection](#classes_cognite_revealnodecollectionmd).[off](#off)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[NodeCollection](#classes_cognite_revealnodecollectionmd).[on](#on)

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

[NodeCollection](#classes_cognite_revealnodecollectionmd).[serialize](#serialize)

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:103](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L103)

___

#### updateSet

▸ **updateSet**(`treeIndices`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `treeIndices` | [IndexSet](#classes_cognite_revealindexsetmd) |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/TreeIndexNodeCollection.ts#L37)


<a name="classes_cognite_revealunionnodecollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / UnionNodeCollection

## Class: UnionNodeCollection

[@cognite/reveal](#modules_cognite_revealmd).UnionNodeCollection

Node collection that takes the set union of multiple node collections.

### Hierarchy

- `CombineNodeCollectionBase`

  ↳ **UnionNodeCollection**

### Table of contents

#### Constructors

- [constructor](#constructor)

#### Properties

- [classToken](#classtoken)

#### Accessors

- [classToken](#classtoken)
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
| `nodeCollections?` | [NodeCollection](#classes_cognite_revealnodecollectionmd)[] |

##### Overrides

CombineNodeCollectionBase.constructor

##### Defined in

[viewer/packages/cad-styling/src/UnionNodeCollection.ts:19](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L19)

### Properties

#### classToken

▪ `Static` `Readonly` **classToken**: ``"UnionNodeCollection"``

##### Defined in

[viewer/packages/cad-styling/src/UnionNodeCollection.ts:19](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L19)

### Accessors

#### classToken

• `get` **classToken**(): `string`

##### Returns

`string`

##### Defined in

[viewer/packages/cad-styling/src/NodeCollection.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L23)

___

#### isLoading

• `get` **isLoading**(): `boolean`

**`override`**

##### Returns

`boolean`

##### Defined in

[viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts:67](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L67)

### Methods

#### add

▸ **add**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollection](#classes_cognite_revealnodecollectionmd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.add

##### Defined in

[viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts:26](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L26)

___

#### clear

▸ **clear**(): `void`

Clears all underlying node collections.

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.clear

##### Defined in

[viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts:46](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L46)

___

#### getAreas

▸ **getAreas**(): [AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Returns

[AreaCollection](#interfaces_cognite_revealareacollectionmd)

##### Overrides

CombineNodeCollectionBase.getAreas

##### Defined in

[viewer/packages/cad-styling/src/UnionNodeCollection.ts:45](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L45)

___

#### getIndexSet

▸ **getIndexSet**(): [IndexSet](#classes_cognite_revealindexsetmd)

**`override`**

##### Returns

[IndexSet](#classes_cognite_revealindexsetmd)

##### Inherited from

CombineNodeCollectionBase.getIndexSet

##### Defined in

[viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts:59](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L59)

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

[viewer/packages/cad-styling/src/NodeCollection.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L32)

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

[viewer/packages/cad-styling/src/NodeCollection.ts:27](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollection.ts#L27)

___

#### remove

▸ **remove**(`nodeCollection`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [NodeCollection](#classes_cognite_revealnodecollectionmd) |

##### Returns

`void`

##### Inherited from

CombineNodeCollectionBase.remove

##### Defined in

[viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CombineNodeCollectionBase.ts#L32)

___

#### serialize

▸ **serialize**(): [SerializedNodeCollection](#serializednodecollection)

##### Returns

[SerializedNodeCollection](#serializednodecollection)

##### Overrides

CombineNodeCollectionBase.serialize

##### Defined in

[viewer/packages/cad-styling/src/UnionNodeCollection.ts:25](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/UnionNodeCollection.ts#L25)


<a name="classes_cognite_reveal_extensions_datasourcecdfmodelidentifiermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd) / CdfModelIdentifier

## Class: CdfModelIdentifier

[@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd).CdfModelIdentifier

Identifies a 3D model stored in CDF by the combination of a modelId, a revisionId
and a format.

### Implements

- [ModelIdentifier](#interfaces_cognite_reveal_extensions_datasourcemodelidentifiermd)

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

[viewer/packages/modeldata-api/src/CdfModelIdentifier.ts:14](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L14)

### Properties

#### modelId

• `Readonly` **modelId**: `number`

##### Defined in

[viewer/packages/modeldata-api/src/CdfModelIdentifier.ts:13](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L13)

___

#### revealInternalId

• `Readonly` **revealInternalId**: `symbol`

Unique ID of the model.

##### Implementation of

[ModelIdentifier](#interfaces_cognite_reveal_extensions_datasourcemodelidentifiermd).[revealInternalId](#revealinternalid)

##### Defined in

[viewer/packages/modeldata-api/src/CdfModelIdentifier.ts:11](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L11)

___

#### revisionId

• `Readonly` **revisionId**: `number`

##### Defined in

[viewer/packages/modeldata-api/src/CdfModelIdentifier.ts:14](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L14)

### Methods

#### toString

▸ **toString**(): `string`

##### Returns

`string`

##### Defined in

[viewer/packages/modeldata-api/src/CdfModelIdentifier.ts:22](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/CdfModelIdentifier.ts#L22)


<a name="classes_cognite_reveal_toolsaxisviewtoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / AxisViewTool

## Class: AxisViewTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).AxisViewTool

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **AxisViewTool**

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
| `viewer` | [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd) |
| `config?` | [AxisBoxConfig](#axisboxconfig) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/packages/tools/src/AxisView/AxisViewTool.ts:40](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/AxisView/AxisViewTool.ts#L40)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/packages/tools/src/AxisView/AxisViewTool.ts:64](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/AxisView/AxisViewTool.ts#L64)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)


<a name="classes_cognite_reveal_toolscognite3dviewertoolbasemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / Cognite3DViewerToolBase

## Class: Cognite3DViewerToolBase

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).Cognite3DViewerToolBase

Base class for tools attaching to a {@see Cognite3DViewer}.

### Hierarchy

- **Cognite3DViewerToolBase**

  ↳ [HtmlOverlayTool](#classes_cognite_reveal_toolshtmloverlaytoolmd)

  ↳ [ExplodedViewTool](#classes_cognite_reveal_toolsexplodedviewtoolmd)

  ↳ [DebugCameraTool](#classes_cognite_reveal_toolsdebugcameratoolmd)

  ↳ [AxisViewTool](#classes_cognite_reveal_toolsaxisviewtoolmd)

  ↳ [GeomapTool](#classes_cognite_reveal_toolsgeomaptoolmd)

  ↳ [TimelineTool](#classes_cognite_reveal_toolstimelinetoolmd)

  ↳ [DebugLoadedSectorsTool](#classes_cognite_reveal_toolsdebugloadedsectorstoolmd)

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

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Cognite3DViewerToolBase.ts:52](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L52)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)


<a name="classes_cognite_reveal_toolsdebugcameratoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / DebugCameraTool

## Class: DebugCameraTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).DebugCameraTool

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **DebugCameraTool**

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
| `viewer` | [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/packages/tools/src/DebugCameraTool.ts:18](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/DebugCameraTool.ts#L18)

### Methods

#### dispose

▸ **dispose**(): `void`

Removes all elements and detaches from the viewer.

**`override`**

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/packages/tools/src/DebugCameraTool.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/DebugCameraTool.ts#L32)

___

#### hideCameraHelper

▸ **hideCameraHelper**(): `void`

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/DebugCameraTool.ts:43](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/DebugCameraTool.ts#L43)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

#### showCameraHelper

▸ **showCameraHelper**(): `void`

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/DebugCameraTool.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/DebugCameraTool.ts#L37)


<a name="classes_cognite_reveal_toolsdebugloadedsectorstoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / DebugLoadedSectorsTool

## Class: DebugLoadedSectorsTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).DebugLoadedSectorsTool

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **DebugLoadedSectorsTool**

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
| `viewer` | [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd) |
| `options` | [DebugLoadedSectorsToolOptions](#debugloadedsectorstooloptions) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/packages/tools/src/DebugLoadedSectorsTool.ts:25](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L25)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/packages/tools/src/DebugLoadedSectorsTool.ts:47](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L47)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

#### setOptions

▸ **setOptions**(`options`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [DebugLoadedSectorsToolOptions](#debugloadedsectorstooloptions) |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/DebugLoadedSectorsTool.ts:35](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L35)

___

#### showSectorBoundingBoxes

▸ **showSectorBoundingBoxes**(`model`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/DebugLoadedSectorsTool.ts:51](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L51)


<a name="classes_cognite_reveal_toolsexplodedviewtoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / ExplodedViewTool

## Class: ExplodedViewTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).ExplodedViewTool

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **ExplodedViewTool**

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
| `cadModel` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/packages/tools/src/ExplodedViewTool.ts:16](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/ExplodedViewTool.ts#L16)

### Accessors

#### readyPromise

• `get` **readyPromise**(): `Promise`<void\>

##### Returns

`Promise`<void\>

##### Defined in

[viewer/packages/tools/src/ExplodedViewTool.ts:14](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/ExplodedViewTool.ts#L14)

### Methods

#### dispose

▸ **dispose**(): `void`

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/packages/tools/src/Cognite3DViewerToolBase.ts:52](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L52)

___

#### expand

▸ **expand**(`expandRadius`): `Promise`<void\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `expandRadius` | `number` |

##### Returns

`Promise`<void\>

##### Defined in

[viewer/packages/tools/src/ExplodedViewTool.ts:29](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/ExplodedViewTool.ts#L29)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

#### reset

▸ **reset**(): `void`

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/ExplodedViewTool.ts:46](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/ExplodedViewTool.ts#L46)


<a name="classes_cognite_reveal_toolsgeomaptoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / GeomapTool

## Class: GeomapTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).GeomapTool

The `GeomapTool` is a geolocation for the models and allow the user to place them on the maps.

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **GeomapTool**

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
| `viewer` | [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd) |
| `config` | [MapConfig](#mapconfig) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/packages/tools/src/Geomap/GeomapTool.ts:17](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/GeomapTool.ts#L17)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/packages/tools/src/Geomap/GeomapTool.ts:36](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/GeomapTool.ts#L36)

___

#### latLongToWorldCoordinates

▸ **latLongToWorldCoordinates**(`latLong`): `Object`

Converts Latitude & Longitude into Vector2 World coordinates on the Map

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `latLong` | `LatLongPosition` | Latitude & Longitude |

##### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

##### Defined in

[viewer/packages/tools/src/Geomap/GeomapTool.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/GeomapTool.ts#L32)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)


<a name="classes_cognite_reveal_toolshtmloverlaytoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / HtmlOverlayTool

## Class: HtmlOverlayTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).HtmlOverlayTool

Manages HTMLoverlays for {@see Cognite3DViewer}. Attaches HTML elements to a
3D position and updates its position/visibility as user moves the camera. This is
useful to create HTML overlays to highlight information about key positions in the 3D model.

Attached elements *must* have CSS style 'position: absolute'. It's also recommended
in most cases to have styles 'pointer-events: none' and 'touch-action: none' to avoid
interfering with 3D navigation. Consider also applying 'transform: translate(-50%, -50%)'
to anchor the center of the element rather than the top-left corner. In some cases the
`zIndex`-attribute is necessary for the element to appear on top of the viewer.

**`example`**
```js
const el = document.createElement('div');
el.style.position = 'absolute'; // Required!
// Anchor to center of element
el.style.transform = 'translate(-50%, -50%)';
// Avoid being target for events
el.style.pointerEvents = 'none;
el.style.touchAction = 'none';
// Render in front of other elements
el.style.zIndex = 10;

el.style.color = 'red';
el.innerHtml = '<h1>Overlay</h1>';

const overlayTool = new HtmlOverlayTool(viewer);
overlayTool.add(el, new THREE.Vector3(10, 10, 10));
// ...
overlayTool.remove(el);
// or, to remove all attached elements
overlayTool.clear();

// detach the tool from the viewer
overlayTool.dispose();
```

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **HtmlOverlayTool**

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

### Constructors

#### constructor

• **new HtmlOverlayTool**(`viewer`, `options?`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd) |
| `options?` | `HtmlOverlayToolOptions` |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:162](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L162)

### Accessors

#### elements

• `get` **elements**(): { `element`: `HTMLElement` ; `position3D`: `Vector3`  }[]

Returns all added HTML elements along with their 3D positions.

##### Returns

{ `element`: `HTMLElement` ; `position3D`: `Vector3`  }[]

##### Defined in

[viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:182](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L182)

### Methods

#### add

▸ **add**(`htmlElement`, `position3D`, `options?`): `void`

Registers a HTML overlay that will be updated on rendering.

##### Parameters

| Name | Type |
| :------ | :------ |
| `htmlElement` | `HTMLElement` |
| `position3D` | `Vector3` |
| `options` | [HtmlOverlayOptions](#htmloverlayoptions) |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:206](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L206)

___

#### clear

▸ **clear**(): `void`

Removes all attached HTML overlay elements.

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:254](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L254)

___

#### dispose

▸ **dispose**(): `void`

Removes all elements and detaches from the viewer.

**`override`**

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:192](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L192)

___

#### forceUpdate

▸ **forceUpdate**(): `void`

Updates positions of all overlays. This is automatically managed and there
shouldn't be any reason to trigger this unless the attached elements are
modified externally.

Calling this function often might cause degraded performance.

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:269](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L269)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

#### remove

▸ **remove**(`htmlElement`): `void`

Removes a overlay and removes it from the DOM.

##### Parameters

| Name | Type |
| :------ | :------ |
| `htmlElement` | `HTMLElement` |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:242](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L242)


<a name="classes_cognite_reveal_toolskeyframemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / Keyframe

## Class: Keyframe

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).Keyframe

Timeline Key Frames contains parameters to access Nodes, Styles for the Timeline

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
| `model` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) |
| `date` | `Date` |

##### Defined in

[viewer/packages/tools/src/Timeline/Keyframe.ts:15](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/Keyframe.ts#L15)

### Methods

#### activate

▸ **activate**(): `void`

Assigns the styles for the node set for the model for this Keyframe

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/Keyframe.ts:33](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/Keyframe.ts#L33)

___

#### assignStyledNodeCollection

▸ **assignStyledNodeCollection**(`nodeCollection`, `nodeAppearance`): `void`

Add node & style to the collection. If the collection has been added, the style is updated to the
appearance provided.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [NodeCollection](#classes_cognite_revealnodecollectionmd) | Node set to apply the Styles |
| `nodeAppearance` | [NodeAppearance](#nodeappearance) | Style to assign to the node collection |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/Keyframe.ts:54](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/Keyframe.ts#L54)

___

#### deactivate

▸ **deactivate**(): `void`

Removes the style for the model

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/Keyframe.ts:42](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/Keyframe.ts#L42)

___

#### getKeyframeDate

▸ **getKeyframeDate**(): `Date`

Get date of the Keyframe

##### Returns

`Date`

date

##### Defined in

[viewer/packages/tools/src/Timeline/Keyframe.ts:26](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/Keyframe.ts#L26)

___

#### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

Remove Node & Style for this keyframe's nodeCollection and nodeAppearance

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [NodeCollection](#classes_cognite_revealnodecollectionmd) | Nodes to be unassign from node collection |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/Keyframe.ts:69](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/Keyframe.ts#L69)


<a name="classes_cognite_reveal_toolstimelinetoolmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / TimelineTool

## Class: TimelineTool

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).TimelineTool

Tool to applying styles to nodes based on date to play them over in Timeline

### Hierarchy

- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)

  ↳ **TimelineTool**

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
| `cadModel` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) |

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[constructor](#constructor)

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:20](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L20)

### Methods

#### createKeyframe

▸ **createKeyframe**(`date`): [Keyframe](#classes_cognite_reveal_toolskeyframemd)

Create Key frame for the Timeline

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `Date` | date value by Date.now() since January 1, 1970 |

##### Returns

[Keyframe](#classes_cognite_reveal_toolskeyframemd)

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:63](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L63)

___

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Overrides

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[dispose](#dispose)

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:184](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L184)

___

#### getAllKeyframes

▸ **getAllKeyframes**(): [Keyframe](#classes_cognite_reveal_toolskeyframemd)[]

Provides all Keyframes in the Timeline

##### Returns

[Keyframe](#classes_cognite_reveal_toolskeyframemd)[]

All Keyframes in Timeline

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:180](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L180)

___

#### getKeyframeByDate

▸ **getKeyframeByDate**(`date`): [Keyframe](#classes_cognite_reveal_toolskeyframemd)

Returns the keyframe at the date given, or undefined if not found.

##### Parameters

| Name | Type |
| :------ | :------ |
| `date` | `Date` |

##### Returns

[Keyframe](#classes_cognite_reveal_toolskeyframemd)

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:76](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L76)

___

#### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

##### Returns

`void`

##### Inherited from

[Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd).[off](#off)

##### Defined in

[viewer/packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

#### pause

▸ **pause**(): `void`

Pause any ongoing playback

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:161](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L161)

___

#### play

▸ **play**(`startDate`, `endDate`, `totalDurationInMilliSeconds`): `void`

Starts playback of Timeline

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `startDate` | `Date` | Keyframe date to start the Playback of Keyframes |
| `endDate` | `Date` | Keyframe date to stop the Playback of Keyframes |
| `totalDurationInMilliSeconds` | `number` | Number of milliseconds for all Keyframe within startDate & endDate to be rendered |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:110](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L110)

___

#### removeKeyframe

▸ **removeKeyframe**(`keyframe`): `void`

Removes the Keyframe from the timeline. Does nothing if the keyframe isn't part of the timeline.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `keyframe` | [Keyframe](#classes_cognite_reveal_toolskeyframemd) | Keyframe to be removed from the timeline |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:84](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L84)

___

#### removeKeyframeByDate

▸ **removeKeyframeByDate**(`date`): `void`

Removes the Keyframe from the Timeline

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `Date` | Date of the Keyframe to be removed from the Timeline |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:96](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L96)

___

#### resume

▸ **resume**(): `void`

Resume any paused playback

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:170](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L170)

___

#### stop

▸ **stop**(): `void`

Stops any ongoing playback

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:151](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L151)

___

#### subscribe

▸ **subscribe**(`event`, `listener`): `void`

Subscribe to the Date changed event

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"dateChanged"`` | `dateChanged` event |
| `listener` | [TimelineDateUpdateDelegate](#timelinedateupdatedelegate) | Listen to Timeline date Update during Playback |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:34](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L34)

___

#### unsubscribe

▸ **unsubscribe**(`event`, `listener`): `void`

Unsubscribe to the Date changed event

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"dateChanged"`` | `dateChanged` event |
| `listener` | [TimelineDateUpdateDelegate](#timelinedateupdatedelegate) | Remove Listen to Timeline date Update |

##### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/TimelineTool.ts:49](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/TimelineTool.ts#L49)

# Enums


<a name="enums_cognite_revealnodeoutlinecolormd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / NodeOutlineColor

## Enumeration: NodeOutlineColor

[@cognite/reveal](#modules_cognite_revealmd).NodeOutlineColor

### Table of contents

#### Enumeration members

- [Black](#black)
- [Blue](#blue)
- [Cyan](#cyan)
- [Green](#green)
- [NoOutline](#nooutline)
- [Orange](#orange)
- [Red](#red)
- [White](#white)

### Enumeration members

#### Black

• **Black** = 2

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearance.ts:8](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearance.ts#L8)

___

#### Blue

• **Blue** = 4

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearance.ts:10](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearance.ts#L10)

___

#### Cyan

• **Cyan** = 3

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearance.ts:9](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearance.ts#L9)

___

#### Green

• **Green** = 5

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearance.ts:11](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearance.ts#L11)

___

#### NoOutline

• **NoOutline** = 0

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearance.ts:6](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearance.ts#L6)

___

#### Orange

• **Orange** = 7

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearance.ts:13](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearance.ts#L13)

___

#### Red

• **Red** = 6

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearance.ts:12](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearance.ts#L12)

___

#### White

• **White** = 1

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearance.ts:7](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearance.ts#L7)


<a name="enums_cognite_revealpotreepointcolortypemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / PotreePointColorType

## Enumeration: PotreePointColorType

[@cognite/reveal](#modules_cognite_revealmd).PotreePointColorType

### Table of contents

#### Enumeration members

- [Classification](#classification)
- [Depth](#depth)
- [Height](#height)
- [Intensity](#intensity)
- [LevelOfDetail](#levelofdetail)
- [PointIndex](#pointindex)
- [Rgb](#rgb)

### Enumeration members

#### Classification

• **Classification**

Indicates whether a point is part of some class of objects.
Classes are mapped to colors.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:35](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L35)

___

#### Depth

• **Depth**

Shows the distance from current camera with color gradient

##### Defined in

[viewer/packages/pointclouds/src/types.ts:17](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L17)

___

#### Height

• **Height**

Height, or elevation, mapped to a color with a gradient.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:20](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L20)

___

#### Intensity

• **Intensity**

Indicates the strength of the backscattered signal in a laser scan.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:38](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L38)

___

#### LevelOfDetail

• **LevelOfDetail**

Calculated during rendering.
It is equal to the level of the most detailed visible node in a region

##### Defined in

[viewer/packages/pointclouds/src/types.ts:29](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L29)

___

#### PointIndex

• **PointIndex**

Specifies the order in which points were captured from a single beam.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L23)

___

#### Rgb

• **Rgb**

Describes the observed real-world color of a point.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:14](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L14)


<a name="enums_cognite_revealpotreepointshapemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / PotreePointShape

## Enumeration: PotreePointShape

[@cognite/reveal](#modules_cognite_revealmd).PotreePointShape

### Table of contents

#### Enumeration members

- [Circle](#circle)
- [Square](#square)

### Enumeration members

#### Circle

• **Circle**

##### Defined in

[viewer/packages/pointclouds/src/types.ts:8](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L8)

___

#### Square

• **Square**

##### Defined in

[viewer/packages/pointclouds/src/types.ts:9](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L9)


<a name="enums_cognite_revealpotreepointsizetypemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / PotreePointSizeType

## Enumeration: PotreePointSizeType

[@cognite/reveal](#modules_cognite_revealmd).PotreePointSizeType

### Table of contents

#### Enumeration members

- [Adaptive](#adaptive)
- [Fixed](#fixed)

### Enumeration members

#### Adaptive

• **Adaptive**

##### Defined in

[viewer/packages/pointclouds/src/types.ts:42](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L42)

___

#### Fixed

• **Fixed**

##### Defined in

[viewer/packages/pointclouds/src/types.ts:43](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L43)


<a name="enums_cognite_revealwellknownasprspointclasscodesmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / WellKnownAsprsPointClassCodes

## Enumeration: WellKnownAsprsPointClassCodes

[@cognite/reveal](#modules_cognite_revealmd).WellKnownAsprsPointClassCodes

ASPRS well known point class types.

**`see`** [http://www.asprs.org/wp-content/uploads/2019/03/LAS_1_4_r14.pdf](http://www.asprs.org/wp-content/uploads/2019/03/LAS_1_4_r14.pdf) (page 30)

### Table of contents

#### Enumeration members

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

### Enumeration members

#### BridgeDeck

• **BridgeDeck** = 17

Note that [WellKnownAsprsPointClassCodes.ReservedOrBridgeDeck](#reservedorbridgedeck) has been used
historically.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:100](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L100)

___

#### Building

• **Building** = 6

##### Defined in

[viewer/packages/pointclouds/src/types.ts:65](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L65)

___

#### Created

• **Created** = 0

Created, never classified.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:59](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L59)

___

#### Default

• **Default** = -1

Special value for all other classes. Some point in Potree might be in this class

##### Defined in

[viewer/packages/pointclouds/src/types.ts:55](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L55)

___

#### Ground

• **Ground** = 2

##### Defined in

[viewer/packages/pointclouds/src/types.ts:61](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L61)

___

#### HighNoise

• **HighNoise** = 18

High point, or "high noise".
Note that [WellKnownAsprsPointClassCodes.ReservedOrHighPoint](#reservedorhighpoint) has been used
historically.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:106](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L106)

___

#### HighVegetation

• **HighVegetation** = 5

##### Defined in

[viewer/packages/pointclouds/src/types.ts:64](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L64)

___

#### IgnoredGround

• **IgnoredGround** = 20

E.g. breakline proximity.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:114](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L114)

___

#### LowPoint

• **LowPoint** = 7

Low point, typically "low noise".

##### Defined in

[viewer/packages/pointclouds/src/types.ts:69](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L69)

___

#### LowVegetation

• **LowVegetation** = 3

##### Defined in

[viewer/packages/pointclouds/src/types.ts:62](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L62)

___

#### MedVegetation

• **MedVegetation** = 4

##### Defined in

[viewer/packages/pointclouds/src/types.ts:63](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L63)

___

#### OverheadStructure

• **OverheadStructure** = 19

E.g. conveyors, mining equipment, traffic lights.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:110](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L110)

___

#### Rail

• **Rail** = 10

##### Defined in

[viewer/packages/pointclouds/src/types.ts:76](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L76)

___

#### ReservedOrBridgeDeck

• **ReservedOrBridgeDeck** = 12

In previous revisions of LAS this was "Bridge deck", but in more recent
revisions this value is reserved.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:82](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L82)

___

#### ReservedOrHighPoint

• **ReservedOrHighPoint** = 8

In previous revisions of LAS this was High point ("high noise"), in more recent
revisions this value is reserved.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:74](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L74)

___

#### RoadSurface

• **RoadSurface** = 11

##### Defined in

[viewer/packages/pointclouds/src/types.ts:77](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L77)

___

#### Snow

• **Snow** = 21

##### Defined in

[viewer/packages/pointclouds/src/types.ts:115](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L115)

___

#### TemporalExclusion

• **TemporalExclusion** = 22

Features excluded due to changes over time between data sources – e.g., water
levels, landslides, permafrost

##### Defined in

[viewer/packages/pointclouds/src/types.ts:120](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L120)

___

#### TransmissionTower

• **TransmissionTower** = 15

##### Defined in

[viewer/packages/pointclouds/src/types.ts:91](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L91)

___

#### Unclassified

• **Unclassified** = 1

##### Defined in

[viewer/packages/pointclouds/src/types.ts:60](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L60)

___

#### UserDefinableOffset

• **UserDefinableOffset** = 64

First user definable class identifier (64).
Values up to and including 63 are reserved

##### Defined in

[viewer/packages/pointclouds/src/types.ts:126](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L126)

___

#### Water

• **Water** = 9

##### Defined in

[viewer/packages/pointclouds/src/types.ts:75](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L75)

___

#### WireConductor

• **WireConductor** = 14

Wire conductor (phase).

##### Defined in

[viewer/packages/pointclouds/src/types.ts:90](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L90)

___

#### WireGuard

• **WireGuard** = 13

Wire guard shield.

##### Defined in

[viewer/packages/pointclouds/src/types.ts:86](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L86)

___

#### WireStructureConnector

• **WireStructureConnector** = 16

Wire-structure connector (e.g. insulator).

##### Defined in

[viewer/packages/pointclouds/src/types.ts:95](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/types.ts#L95)


<a name="enums_cognite_reveal_extensions_datasourcefile3dformatmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd) / File3dFormat

## Enumeration: File3dFormat

[@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd).File3dFormat

### Table of contents

#### Enumeration members

- [AnyFormat](#anyformat)
- [EptPointCloud](#eptpointcloud)
- [GltfCadModel](#gltfcadmodel)
- [RevealCadModel](#revealcadmodel)

### Enumeration members

#### AnyFormat

• **AnyFormat** = "all-outputs"

##### Defined in

[viewer/packages/modeldata-api/src/types.ts:46](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/types.ts#L46)

___

#### EptPointCloud

• **EptPointCloud** = "ept-pointcloud"

##### Defined in

[viewer/packages/modeldata-api/src/types.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/types.ts#L37)

___

#### GltfCadModel

• **GltfCadModel** = "gltf-directory"

Reveal v9 and above (GLTF based output)

##### Defined in

[viewer/packages/modeldata-api/src/types.ts:45](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/types.ts#L45)

___

#### RevealCadModel

• **RevealCadModel** = "reveal-directory"

V8 models only due to bug for version checks in Reveal <3.0

##### Defined in

[viewer/packages/modeldata-api/src/types.ts:41](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/types.ts#L41)


<a name="enums_cognite_reveal_toolsbingmapimageformatmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / BingMapImageFormat

## Enumeration: BingMapImageFormat

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).BingMapImageFormat

Bing Map Tile Image formats

### Table of contents

#### Enumeration members

- [GIF](#gif)
- [JPEG](#jpeg)
- [PNG](#png)

### Enumeration members

#### GIF

• **GIF** = "gif"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:87](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L87)

___

#### JPEG

• **JPEG** = "jpeg"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:88](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L88)

___

#### PNG

• **PNG** = "png"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:89](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L89)


<a name="enums_cognite_reveal_toolsbingmaptypemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / BingMapType

## Enumeration: BingMapType

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).BingMapType

Bing Map View (aerial, road, bird's eye view of the map)

### Table of contents

#### Enumeration members

- [Aerial](#aerial)
- [Aerial\_Labels](#aerial_labels)
- [Oblique](#oblique)
- [Oblique\_Labels](#oblique_labels)
- [Road](#road)

### Enumeration members

#### Aerial

• **Aerial** = "a"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:76](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L76)

___

#### Aerial\_Labels

• **Aerial\_Labels** = "h"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:78](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L78)

___

#### Oblique

• **Oblique** = "o"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:79](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L79)

___

#### Oblique\_Labels

• **Oblique\_Labels** = "b"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:80](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L80)

___

#### Road

• **Road** = "r"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:77](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L77)


<a name="enums_cognite_reveal_toolscornermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / Corner

## Enumeration: Corner

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).Corner

A corner of the viewer.

### Table of contents

#### Enumeration members

- [BottomLeft](#bottomleft)
- [BottomRight](#bottomright)
- [TopLeft](#topleft)
- [TopRight](#topright)

### Enumeration members

#### BottomLeft

• **BottomLeft** = 2

##### Defined in

[viewer/packages/tools/src/AxisView/types.ts:100](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/AxisView/types.ts#L100)

___

#### BottomRight

• **BottomRight** = 3

##### Defined in

[viewer/packages/tools/src/AxisView/types.ts:101](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/AxisView/types.ts#L101)

___

#### TopLeft

• **TopLeft** = 1

##### Defined in

[viewer/packages/tools/src/AxisView/types.ts:99](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/AxisView/types.ts#L99)

___

#### TopRight

• **TopRight** = 0

##### Defined in

[viewer/packages/tools/src/AxisView/types.ts:98](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/AxisView/types.ts#L98)


<a name="enums_cognite_reveal_toolsheremapimageformatmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / HereMapImageFormat

## Enumeration: HereMapImageFormat

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).HereMapImageFormat

Here Map Tiles Image Format

### Table of contents

#### Enumeration members

- [JPG](#jpg)
- [PNG](#png)
- [PNG8](#png8)

### Enumeration members

#### JPG

• **JPG** = "jpg"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:118](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L118)

___

#### PNG

• **PNG** = "png"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:116](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L116)

___

#### PNG8

• **PNG8** = "png8"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:117](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L117)


<a name="enums_cognite_reveal_toolsheremapschememd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / HereMapScheme

## Enumeration: HereMapScheme

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).HereMapScheme

Here Map View Scheme like day, night, satellite, terrain

### Table of contents

#### Enumeration members

- [Day](#day)
- [Night](#night)
- [Satellite](#satellite)
- [Terrain](#terrain)

### Enumeration members

#### Day

• **Day** = "normal.day"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:106](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L106)

___

#### Night

• **Night** = "normal.night"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:107](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L107)

___

#### Satellite

• **Satellite** = "satellite.day"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:109](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L109)

___

#### Terrain

• **Terrain** = "terrain.day"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:108](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L108)


<a name="enums_cognite_reveal_toolsheremaptypemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / HereMapType

## Enumeration: HereMapType

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).HereMapType

Here Map types

### Table of contents

#### Enumeration members

- [Aerial](#aerial)
- [Base](#base)
- [Pano](#pano)
- [Traffic](#traffic)

### Enumeration members

#### Aerial

• **Aerial** = "aerial"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:96](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L96)

___

#### Base

• **Base** = "base"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:97](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L97)

___

#### Pano

• **Pano** = "pano"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:98](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L98)

___

#### Traffic

• **Traffic** = "traffic"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:99](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L99)


<a name="enums_cognite_reveal_toolsmapboximageformatmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / MapboxImageFormat

## Enumeration: MapboxImageFormat

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).MapboxImageFormat

Mapbox Map image tile format

### Table of contents

#### Enumeration members

- [JPG70](#jpg70)
- [JPG80](#jpg80)
- [JPG90](#jpg90)
- [PNG](#png)
- [PNG128](#png128)
- [PNG256](#png256)
- [PNG32](#png32)
- [PNG64](#png64)
- [PNGRAW](#pngraw)

### Enumeration members

#### JPG70

• **JPG70** = "jpg70"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:66](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L66)

___

#### JPG80

• **JPG80** = "jpg80"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:67](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L67)

___

#### JPG90

• **JPG90** = "jpg90"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:68](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L68)

___

#### PNG

• **PNG** = "png"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:61](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L61)

___

#### PNG128

• **PNG128** = "png128"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:64](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L64)

___

#### PNG256

• **PNG256** = "png256"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:65](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L65)

___

#### PNG32

• **PNG32** = "png32"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:62](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L62)

___

#### PNG64

• **PNG64** = "png64"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:63](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L63)

___

#### PNGRAW

• **PNGRAW** = "pngraw"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:69](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L69)


<a name="enums_cognite_reveal_toolsmapboxmodemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / MapboxMode

## Enumeration: MapboxMode

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).MapboxMode

Map data for Mapbox

### Table of contents

#### Enumeration members

- [Map\_Id](#map_id)
- [Style](#style)

### Enumeration members

#### Map\_Id

• **Map\_Id** = 101

Access the map data using a map id or Tileset id. For details see https://docs.mapbox.com/help/glossary/tileset-id/

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:26](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L26)

___

#### Style

• **Style** = 100

Access the map data using a map style. For details see https://docs.mapbox.com/api/maps/styles/

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:22](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L22)


<a name="enums_cognite_reveal_toolsmapboxstylemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / MapboxStyle

## Enumeration: MapboxStyle

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).MapboxStyle

Mapbox Map Style, these are pre-defined styles using map/tileset id, created in Mapbox Studio style editor.
This is used when MapboxMode.Style is used for mode.

### Table of contents

#### Enumeration members

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

### Enumeration members

#### Dark

• **Dark** = "mapbox/dark-v9"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L37)

___

#### Light

• **Light** = "mapbox/light-v9"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:36](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L36)

___

#### Navigation\_Day

• **Navigation\_Day** = "mapbox/navigation-preview-day-v4"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:40](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L40)

___

#### Navigation\_Guide\_Day

• **Navigation\_Guide\_Day** = "mapbox/navigation-guidance-day-v4"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:42](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L42)

___

#### Navigation\_Guide\_Night

• **Navigation\_Guide\_Night** = "mapbox/navigation-guidance-night-v4"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:43](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L43)

___

#### Navigation\_Night

• **Navigation\_Night** = "mapbox/navigation-preview-night-v4"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:41](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L41)

___

#### Outdoor

• **Outdoor** = "mapbox/outdoors-v10"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:35](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L35)

___

#### Satellite

• **Satellite** = "mapbox/satellite-v9"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:38](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L38)

___

#### Satellite\_Streets

• **Satellite\_Streets** = "mapbox/satellite-streets-v10"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:39](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L39)

___

#### Streets

• **Streets** = "mapbox/streets-v10"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:34](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L34)


<a name="enums_cognite_reveal_toolsmapprovidersmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd) / MapProviders

## Enumeration: MapProviders

[@cognite/reveal/tools](#modules_cognite_reveal_toolsmd).MapProviders

Supported map Providers Bing, Here & Mapbox

### Table of contents

#### Enumeration members

- [BingMap](#bingmap)
- [HereMap](#heremap)
- [MapboxMap](#mapboxmap)
- [OpenStreetMap](#openstreetmap)

### Enumeration members

#### BingMap

• **BingMap** = "BingMap"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:9](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L9)

___

#### HereMap

• **HereMap** = "HereMap"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:10](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L10)

___

#### MapboxMap

• **MapboxMap** = "MapboxMap"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:11](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L11)

___

#### OpenStreetMap

• **OpenStreetMap** = "OpenStreetMap"

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:12](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L12)

# Interfaces


<a name="interfaces_cognite_revealaddmodeloptionsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / AddModelOptions

## Interface: AddModelOptions

[@cognite/reveal](#modules_cognite_revealmd).AddModelOptions

### Table of contents

#### Properties

- [geometryFilter](#geometryfilter)
- [localPath](#localpath)
- [modelId](#modelid)
- [revisionId](#revisionid)

### Properties

#### geometryFilter

• `Optional` **geometryFilter**: [GeometryFilter](#interfaces_cognite_revealgeometryfiltermd)

##### Defined in

[viewer/core/src/public/migration/types.ts:165](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L165)

___

#### localPath

• `Optional` **localPath**: `string`

##### Defined in

[viewer/core/src/public/migration/types.ts:164](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L164)

___

#### modelId

• **modelId**: `number`

##### Defined in

[viewer/core/src/public/migration/types.ts:161](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L161)

___

#### revisionId

• **revisionId**: `number`

##### Defined in

[viewer/core/src/public/migration/types.ts:162](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L162)


<a name="interfaces_cognite_revealareacollectionmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / AreaCollection

## Interface: AreaCollection

[@cognite/reveal](#modules_cognite_revealmd).AreaCollection

Represents a collection of areas/axis-aligned
bounding boxes for use e.g. for load prioritization. Implementations
are not expected to store all areas inserted with `addAreas`,
but rather some "representative box set" covering the inserted areas.
Performance will be better the fewer boxes the representative set contains,
while the effectiveness of node prioritization will suffer if the
representative set covers too much area that is not part
of the inserted boxes

### Implemented by

- [ClusteredAreaCollection](#classes_cognite_revealclusteredareacollectionmd)

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

[viewer/packages/cad-styling/src/prioritized/AreaCollection.ts:16](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L16)

### Methods

#### addAreas

▸ **addAreas**(`boxes`): `void`

Add areas to be covered by the representative set of this
AreaCollection.

##### Parameters

| Name | Type |
| :------ | :------ |
| `boxes` | `Iterable`<Box3\> |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/prioritized/AreaCollection.ts:34](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L34)

___

#### areas

▸ **areas**(): `Generator`<Box3, any, unknown\>

Return some set of boxes that cover the boxes inserted with `addAreas`.
It is required that each inserted box is completely covered by some
subset of boxes in the set returned from `areas`

##### Returns

`Generator`<Box3, any, unknown\>

##### Defined in

[viewer/packages/cad-styling/src/prioritized/AreaCollection.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L23)

___

#### intersectWith

▸ **intersectWith**(`boxes`): `void`

Alter the representative set to cover only the intersection between the
representative set of this AreaCollection and the incoming boxes.
Note that the intersection of two representative sets A' and B' that
represent the original box sets A and B will cover the intersection between
A and B, and will thus be a valid representative set for the intersection of A and B.

##### Parameters

| Name | Type |
| :------ | :------ |
| `boxes` | `Iterable`<Box3\> |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/prioritized/AreaCollection.ts:43](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L43)

___

#### intersectsBox

▸ **intersectsBox**(`box`): `boolean`

Return whether the input box intersects the AreaCollection.

##### Parameters

| Name | Type |
| :------ | :------ |
| `box` | `Box3` |

##### Returns

`boolean`

##### Defined in

[viewer/packages/cad-styling/src/prioritized/AreaCollection.ts:28](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/prioritized/AreaCollection.ts#L28)


<a name="interfaces_cognite_revealcameramanagermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / CameraManager

## Interface: CameraManager

[@cognite/reveal](#modules_cognite_revealmd).CameraManager

Interface for manager responsible for all manipulations to the camera,
including animations and modification of state. Implementations are responsible for
providing a `THREE.PerspectiveCamera` instance to [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd). Implementations
must trigger the `cameraChange`-event when camera is changed.
The default implementation is [DefaultCameraManager](#classes_cognite_revealdefaultcameramanagermd).

### Implemented by

- [DefaultCameraManager](#classes_cognite_revealdefaultcameramanagermd)

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

**`obvious`**

##### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/CameraManager.ts:77](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/CameraManager.ts#L77)

___

#### fitCameraToBoundingBox

▸ **fitCameraToBoundingBox**(`boundingBox`, `duration?`, `radiusFactor?`): `void`

Moves camera to a place where the content of a bounding box is visible to the camera.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `boundingBox` | `Box3` | - |
| `duration?` | `number` | The duration of the animation moving the camera. |
| `radiusFactor?` | `number` | The ratio of the distance from camera to center of box and radius of the box. |

##### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/CameraManager.ts:65](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/CameraManager.ts#L65)

___

#### getCamera

▸ **getCamera**(): `PerspectiveCamera`

Returns the camera used for rendering in [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd).
Note that the camera will not be modified directly by Reveal.
Implementations must trigger the `cameraChange`-event whenever the
camera changes.

##### Returns

`PerspectiveCamera`

##### Defined in

[viewer/packages/camera-manager/src/CameraManager.ts:21](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/CameraManager.ts#L21)

___

#### getCameraState

▸ **getCameraState**(): `Required`<[CameraState](#camerastate)\>

Get camera's state

##### Returns

`Required`<[CameraState](#camerastate)\>

Camera state: position, target and rotation.

##### Defined in

[viewer/packages/camera-manager/src/CameraManager.ts:44](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/CameraManager.ts#L44)

___

#### off

▸ **off**(`event`, `callback`): `void`

Unsubscribes from changes of the camera event.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` | Name of the event. |
| `callback` | [CameraChangeDelegate](#camerachangedelegate) | Callback function to be unsubscribed. |

##### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/CameraManager.ts:57](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/CameraManager.ts#L57)

___

#### on

▸ **on**(`event`, `callback`): `void`

Subscribes to changes of the camera event. This is used by Reveal to react on changes of the camera.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"cameraChange"`` | Name of the event. |
| `callback` | [CameraChangeDelegate](#camerachangedelegate) | Callback to be called when the event is fired. |

##### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/CameraManager.ts:51](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/CameraManager.ts#L51)

___

#### setCameraState

▸ **setCameraState**(`state`): `void`

Set camera's state. Rotation and target can't be set at the same time as they could conflict,
should throw an error if both are passed with non-zero value inside state.

**`example`**
```js
// store position, target
const { position, target } = cameraManager.getCameraState();
// restore position, target
cameraManager.setCameraState({ position, target });
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [CameraState](#camerastate) | Camera state, all fields are optional. |

##### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/CameraManager.ts:38](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/CameraManager.ts#L38)

___

#### update

▸ **update**(`deltaTime`, `boundingBox`): `void`

Updates internal state of camera manager. Expected to update visual state of the camera
as well as it's near and far planes if needed. Called in `requestAnimationFrame`-loop.
Reveal performance affects frequency with which this method is called.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deltaTime` | `number` | Delta time since last update in seconds. |
| `boundingBox` | `Box3` | Global bounding box of the model(s) and any custom objects added to the scene. |

##### Returns

`void`

##### Defined in

[viewer/packages/camera-manager/src/CameraManager.ts:73](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/CameraManager.ts#L73)


<a name="interfaces_cognite_revealcdfmodelnodecollectiondataprovidermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / CdfModelNodeCollectionDataProvider

## Interface: CdfModelNodeCollectionDataProvider

[@cognite/reveal](#modules_cognite_revealmd).CdfModelNodeCollectionDataProvider

Provides metadata needed to get asset mappings for a CDF 3D model

### Implemented by

- [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd)

### Table of contents

#### Properties

- [mapBoxFromCdfToModelCoordinates](#mapboxfromcdftomodelcoordinates)
- [mapBoxFromModelToCdfCoordinates](#mapboxfrommodeltocdfcoordinates)
- [modelId](#modelid)
- [nodeCount](#nodecount)
- [revisionId](#revisionid)

### Properties

#### mapBoxFromCdfToModelCoordinates

• **mapBoxFromCdfToModelCoordinates**: (`box`: `Box3`, `out?`: `Box3`) => `Box3`

Maps a box from CDF space to Reveal space

##### Type declaration

▸ (`box`, `out?`): `Box3`

###### Parameters

| Name | Type |
| :------ | :------ |
| `box` | `Box3` |
| `out?` | `Box3` |

###### Returns

`Box3`

##### Defined in

[viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:19](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L19)

___

#### mapBoxFromModelToCdfCoordinates

• **mapBoxFromModelToCdfCoordinates**: (`box`: `Box3`, `out?`: `Box3`) => `Box3`

Maps a box from Reveal space to CDF space

##### Type declaration

▸ (`box`, `out?`): `Box3`

###### Parameters

| Name | Type |
| :------ | :------ |
| `box` | `Box3` |
| `out?` | `Box3` |

###### Returns

`Box3`

##### Defined in

[viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:14](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L14)

___

#### modelId

• **modelId**: `number`

Model and revision IDs for the model

##### Defined in

[viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:29](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L29)

___

#### nodeCount

• **nodeCount**: `number`

Total count of nodes in the model

##### Defined in

[viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:24](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L24)

___

#### revisionId

• **revisionId**: `number`

##### Defined in

[viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:30](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L30)


<a name="interfaces_cognite_revealcognite3dvieweroptionsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / Cognite3DViewerOptions

## Interface: Cognite3DViewerOptions

[@cognite/reveal](#modules_cognite_revealmd).Cognite3DViewerOptions

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

Hints Reveal to use a given anti-aliasing technique.

Fast approximate anti-aliasing (FXAA) is a fast technique that will remove some, but not all aliasing effects. See
https://en.wikipedia.org/wiki/Fast_approximate_anti-aliasing.

Multi-sampling anti-aliasinbg (MSAA) is a technique for taking multiple samples per pixel to avoid aliasing effects.
This mode requires WebGL 2. See https://www.khronos.org/opengl/wiki/Multisampling.

The combined modes will apply both MSAA and FXAA anti-aliasing and yields the best visual result.

When using the MSAA modes combined with FXAA Reveal will fall back to FXAA on WebGL 1. There is no fallback for the
"plain" MSAA modes on WebGL 1.

Currently the default mode is FXAA, but this is subject to change.

##### Defined in

[viewer/core/src/public/migration/types.ts:93](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L93)

___

#### cameraManager

• `Optional` **cameraManager**: [CameraManager](#interfaces_cognite_revealcameramanagermd)

Camera manager instance that is used for controlling the camera.
It is responsible for all manipulations that are done with the camera,
including animations and modification of state. Also, gives ability
to provide custom `THREE.PerspectiveCamera` instance to [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd).
Default implementation is [DefaultCameraManager](#classes_cognite_revealdefaultcameramanagermd).

##### Defined in

[viewer/core/src/public/migration/types.ts:73](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L73)

___

#### continuousModelStreaming

• `Optional` **continuousModelStreaming**: `boolean`

Allows for controlling if geometry streaming should be halted when
the camera is moving. Note that this option should left to false on
low-end devices as more loading can cause frame drops.

Default value is set to false.

##### Defined in

[viewer/core/src/public/migration/types.ts:138](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L138)

___

#### customDataSource

• `Optional` **customDataSource**: [DataSource](#interfaces_cognite_reveal_extensions_datasourcedatasourcemd)

Allows providing a custom data source that Reveal will
use to load model data. Note that some features might not
work when implementing a custom data source. Please refer
to the Reveal documentation for details.

Note that the data source must support [CdfModelIdentifier](#classes_cognite_reveal_extensions_datasourcecdfmodelidentifiermd).

This cannot be used together with {@link _localModels}.

##### Defined in

[viewer/core/src/public/migration/types.ts:129](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L129)

___

#### domElement

• `Optional` **domElement**: `HTMLElement`

An existing DOM element that we will render canvas into.

##### Defined in

[viewer/core/src/public/migration/types.ts:42](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L42)

___

#### enableEdges

• `Optional` **enableEdges**: `boolean`

Enables / disables visualizing the edges of geometry. Defaults to true.

##### Defined in

[viewer/core/src/public/migration/types.ts:114](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L114)

___

#### loadingIndicatorStyle

• `Optional` **loadingIndicatorStyle**: `Object`

Style the loading indicator.

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `opacity` | `number` | Opacity of the spinner in fractions. Valid values are between 0.2 and 1.0. Defaults to 1.0. |
| `placement` | ``"topLeft"`` \| ``"topRight"`` \| ``"bottomLeft"`` \| ``"bottomRight"`` | What corner the spinner should be placed in. Defaults top topLeft. |

##### Defined in

[viewer/core/src/public/migration/types.ts:55](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L55)

___

#### logMetrics

• `Optional` **logMetrics**: `boolean`

Send anonymous usage statistics.

##### Defined in

[viewer/core/src/public/migration/types.ts:45](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L45)

___

#### onLoading

• `Optional` **onLoading**: [OnLoadingCallback](#onloadingcallback)

Callback to download stream progress.

##### Defined in

[viewer/core/src/public/migration/types.ts:117](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L117)

___

#### renderTargetOptions

• `Optional` **renderTargetOptions**: `Object`

Render to offscreen buffer instead of canvas.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `autoSetSize?` | `boolean` |
| `target` | `WebGLRenderTarget` |

##### Defined in

[viewer/core/src/public/migration/types.ts:50](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L50)

___

#### renderer

• `Optional` **renderer**: `WebGLRenderer`

Renderer used to visualize model (optional).

##### Defined in

[viewer/core/src/public/migration/types.ts:75](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L75)

___

#### sdk

• **sdk**: `default`

Initialized connection to CDF used to load data.

##### Defined in

[viewer/core/src/public/migration/types.ts:39](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L39)

___

#### ssaoQualityHint

• `Optional` **ssaoQualityHint**: ``"disabled"`` \| ``"medium"`` \| ``"high"`` \| ``"veryhigh"``

Hints the renderer of the quality it should aim for for screen space ambient occlusion,
an effect creating shadows and that gives the rendered image more depth.

##### Defined in

[viewer/core/src/public/migration/types.ts:109](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L109)


<a name="interfaces_cognite_revealcognitemodelbasemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / CogniteModelBase

## Interface: CogniteModelBase

[@cognite/reveal](#modules_cognite_revealmd).CogniteModelBase

### Implemented by

- [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd)
- [CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)

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

• `Readonly` **type**: [SupportedModelTypes](#supportedmodeltypes)

##### Defined in

[viewer/packages/model-base/src/CogniteModelBase.ts:13](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/model-base/src/CogniteModelBase.ts#L13)

### Methods

#### dispose

▸ **dispose**(): `void`

##### Returns

`void`

##### Defined in

[viewer/packages/model-base/src/CogniteModelBase.ts:14](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/model-base/src/CogniteModelBase.ts#L14)

___

#### getCameraConfiguration

▸ **getCameraConfiguration**(): [CameraConfiguration](#cameraconfiguration)

##### Returns

[CameraConfiguration](#cameraconfiguration)

##### Defined in

[viewer/packages/model-base/src/CogniteModelBase.ts:16](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/model-base/src/CogniteModelBase.ts#L16)

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

[viewer/packages/model-base/src/CogniteModelBase.ts:15](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/model-base/src/CogniteModelBase.ts#L15)

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

[viewer/packages/model-base/src/CogniteModelBase.ts:18](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/model-base/src/CogniteModelBase.ts#L18)

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

[viewer/packages/model-base/src/CogniteModelBase.ts:17](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/model-base/src/CogniteModelBase.ts#L17)


<a name="interfaces_cognite_revealgeometryfiltermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / GeometryFilter

## Interface: GeometryFilter

[@cognite/reveal](#modules_cognite_revealmd).GeometryFilter

### Table of contents

#### Properties

- [boundingBox](#boundingbox)
- [isBoundingBoxInModelCoordinates](#isboundingboxinmodelcoordinates)

### Properties

#### boundingBox

• `Optional` **boundingBox**: `Box3`

The bounds to load geometry within. By default this box is in CDF coordinate space which
will be transformed into coordinates relative to the model using the the model transformation
which can be specified using [the CDF API](https://docs.cognite.com/api/v1/#operation/update3DRevisions),
or set in [Cognite Fusion](https://fusion.cognite.com/).

**`see`** [isBoundingBoxInModelCoordinates](#isboundingboxinmodelcoordinates).

##### Defined in

[viewer/packages/cad-model/src/GeometryFilter.ts:13](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/GeometryFilter.ts#L13)

___

#### isBoundingBoxInModelCoordinates

• `Optional` **isBoundingBoxInModelCoordinates**: `boolean`

When set, the geometry filter [boundingBox](#boundingbox) will be considered to be in "Reveal/ThreeJS space".
Rather than CDF space which is the default. When using Reveal space, the model transformation
which can be specified using [the CDF API](https://docs.cognite.com/api/v1/#operation/update3DRevisions),
or set in [Cognite Fusion](https://fusion.cognite.com/).

##### Defined in

[viewer/packages/cad-model/src/GeometryFilter.ts:21](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/GeometryFilter.ts#L21)


<a name="interfaces_cognite_revealintersectionfrompixeloptionsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal](#modules_cognite_revealmd) / IntersectionFromPixelOptions

## Interface: IntersectionFromPixelOptions

[@cognite/reveal](#modules_cognite_revealmd).IntersectionFromPixelOptions

Options to control how [Cognite3DViewer.getIntersectionFromPixel](#getintersectionfrompixel) behaves.

### Table of contents

#### Properties

- [pointIntersectionThreshold](#pointintersectionthreshold)

### Properties

#### pointIntersectionThreshold

• `Optional` **pointIntersectionThreshold**: `number`

Threshold (in meters) for how close a point must be an intersection
ray for it to be considered an intersection for point clouds. Defaults
to 0.05.

##### Defined in

[viewer/core/src/public/migration/types.ts:246](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L246)


<a name="interfaces_cognite_reveal_extensions_datasourcebloboutputmetadatamd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd) / BlobOutputMetadata

## Interface: BlobOutputMetadata

[@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd).BlobOutputMetadata

### Table of contents

#### Properties

- [blobId](#blobid)
- [format](#format)
- [version](#version)

### Properties

#### blobId

• **blobId**: `number`

##### Defined in

[viewer/packages/modeldata-api/src/types.ts:50](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/types.ts#L50)

___

#### format

• **format**: `string`

##### Defined in

[viewer/packages/modeldata-api/src/types.ts:51](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/types.ts#L51)

___

#### version

• **version**: `number`

##### Defined in

[viewer/packages/modeldata-api/src/types.ts:52](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/types.ts#L52)


<a name="interfaces_cognite_reveal_extensions_datasourcedatasourcemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd) / DataSource

## Interface: DataSource

[@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd).DataSource

Describes how Reveal data is stored, and provides means to create custom storage providers
that Reveal will fetch data from.

### Table of contents

#### Methods

- [getModelDataProvider](#getmodeldataprovider)
- [getModelMetadataProvider](#getmodelmetadataprovider)
- [getNodesApiClient](#getnodesapiclient)

### Methods

#### getModelDataProvider

▸ **getModelDataProvider**(): [ModelDataProvider](#interfaces_cognite_reveal_extensions_datasourcemodeldataprovidermd)

Gets a client that is able to download geometry and other files
for models.

##### Returns

[ModelDataProvider](#interfaces_cognite_reveal_extensions_datasourcemodeldataprovidermd)

##### Defined in

[viewer/packages/data-source/src/DataSource.ts:28](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/data-source/src/DataSource.ts#L28)

___

#### getModelMetadataProvider

▸ **getModelMetadataProvider**(): [ModelMetadataProvider](#interfaces_cognite_reveal_extensions_datasourcemodelmetadataprovidermd)

Gets a metadata provider for models.

##### Returns

[ModelMetadataProvider](#interfaces_cognite_reveal_extensions_datasourcemodelmetadataprovidermd)

##### Defined in

[viewer/packages/data-source/src/DataSource.ts:22](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/data-source/src/DataSource.ts#L22)

___

#### getNodesApiClient

▸ **getNodesApiClient**(): [NodesApiClient](#interfaces_cognite_reveal_extensions_datasourcenodesapiclientmd)

Gets a node API client that is able to fetch data about
models.

##### Returns

[NodesApiClient](#interfaces_cognite_reveal_extensions_datasourcenodesapiclientmd)

##### Defined in

[viewer/packages/data-source/src/DataSource.ts:17](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/data-source/src/DataSource.ts#L17)


<a name="interfaces_cognite_reveal_extensions_datasourcemodeldataprovidermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd) / ModelDataProvider

## Interface: ModelDataProvider

[@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd).ModelDataProvider

Provides data for 3D models.

### Hierarchy

- `HttpHeadersProvider`

- `JsonFileProvider`

- `BinaryFileProvider`

  ↳ **ModelDataProvider**

### Table of contents

#### Properties

- [headers](#headers)

#### Methods

- [getBinaryFile](#getbinaryfile)
- [getJsonFile](#getjsonfile)

### Properties

#### headers

• `Readonly` **headers**: `HttpHeaders`

##### Inherited from

HttpHeadersProvider.headers

##### Defined in

[viewer/packages/modeldata-api/src/types.ts:33](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/types.ts#L33)

### Methods

#### getBinaryFile

▸ **getBinaryFile**(`baseUrl`, `fileName`): `Promise`<ArrayBuffer\>

Downloads a binary blob.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseUrl` | `string` | Base URL of the model. |
| `fileName` | `string` | Filename of binary file. |

##### Returns

`Promise`<ArrayBuffer\>

##### Overrides

BinaryFileProvider.getBinaryFile

##### Defined in

[viewer/packages/modeldata-api/src/types.ts:29](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/types.ts#L29)

___

#### getJsonFile

▸ **getJsonFile**(`baseUrl`, `fileName`): `Promise`<any\>

Download and parse a JSON file and return the resulting struct.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseUrl` | `string` | Base URL of the model. |
| `fileName` | `string` | Filename of JSON file. |

##### Returns

`Promise`<any\>

##### Overrides

JsonFileProvider.getJsonFile

##### Defined in

[viewer/packages/modeldata-api/src/types.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/types.ts#L23)


<a name="interfaces_cognite_reveal_extensions_datasourcemodelidentifiermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd) / ModelIdentifier

## Interface: ModelIdentifier

[@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd).ModelIdentifier

Identifies a 3D model. Typically, implementations will use [CdfModelIdentifier](#classes_cognite_reveal_extensions_datasourcecdfmodelidentifiermd).

### Implemented by

- [CdfModelIdentifier](#classes_cognite_reveal_extensions_datasourcecdfmodelidentifiermd)

### Table of contents

#### Properties

- [revealInternalId](#revealinternalid)

### Properties

#### revealInternalId

• `Readonly` **revealInternalId**: `symbol`

Unique ID of the model.

##### Defined in

[viewer/packages/modeldata-api/src/ModelIdentifier.ts:12](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/ModelIdentifier.ts#L12)


<a name="interfaces_cognite_reveal_extensions_datasourcemodelmetadataprovidermd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd) / ModelMetadataProvider

## Interface: ModelMetadataProvider

[@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd).ModelMetadataProvider

Provides metadata for 3D models.

### Table of contents

#### Methods

- [getModelCamera](#getmodelcamera)
- [getModelMatrix](#getmodelmatrix)
- [getModelOutputs](#getmodeloutputs)
- [getModelUri](#getmodeluri)

### Methods

#### getModelCamera

▸ **getModelCamera**(`identifier`): `Promise`<`Object`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `identifier` | [ModelIdentifier](#interfaces_cognite_reveal_extensions_datasourcemodelidentifiermd) |

##### Returns

`Promise`<`Object`\>

##### Defined in

[viewer/packages/modeldata-api/src/ModelMetadataProvider.ts:14](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/ModelMetadataProvider.ts#L14)

___

#### getModelMatrix

▸ **getModelMatrix**(`identifier`, `format`): `Promise`<Matrix4\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `identifier` | [ModelIdentifier](#interfaces_cognite_reveal_extensions_datasourcemodelidentifiermd) |
| `format` | `string` |

##### Returns

`Promise`<Matrix4\>

##### Defined in

[viewer/packages/modeldata-api/src/ModelMetadataProvider.ts:15](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/ModelMetadataProvider.ts#L15)

___

#### getModelOutputs

▸ **getModelOutputs**(`modelIdentifier`): `Promise`<[BlobOutputMetadata](#interfaces_cognite_reveal_extensions_datasourcebloboutputmetadatamd)[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `modelIdentifier` | [ModelIdentifier](#interfaces_cognite_reveal_extensions_datasourcemodelidentifiermd) |

##### Returns

`Promise`<[BlobOutputMetadata](#interfaces_cognite_reveal_extensions_datasourcebloboutputmetadatamd)[]\>

##### Defined in

[viewer/packages/modeldata-api/src/ModelMetadataProvider.ts:12](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/ModelMetadataProvider.ts#L12)

___

#### getModelUri

▸ **getModelUri**(`identifier`, `formatMetadata`): `Promise`<string\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `identifier` | [ModelIdentifier](#interfaces_cognite_reveal_extensions_datasourcemodelidentifiermd) |
| `formatMetadata` | [BlobOutputMetadata](#interfaces_cognite_reveal_extensions_datasourcebloboutputmetadatamd) |

##### Returns

`Promise`<string\>

##### Defined in

[viewer/packages/modeldata-api/src/ModelMetadataProvider.ts:13](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/modeldata-api/src/ModelMetadataProvider.ts#L13)


<a name="interfaces_cognite_reveal_extensions_datasourcenodesapiclientmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / [@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd) / NodesApiClient

## Interface: NodesApiClient

[@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd).NodesApiClient

Client for retrieving metadata information about CAD nodes.

### Table of contents

#### Methods

- [determineNodeAncestorsByNodeId](#determinenodeancestorsbynodeid)
- [determineTreeIndexAndSubtreeSizesByNodeIds](#determinetreeindexandsubtreesizesbynodeids)
- [getBoundingBoxesByNodeIds](#getboundingboxesbynodeids)
- [mapNodeIdsToTreeIndices](#mapnodeidstotreeindices)
- [mapTreeIndicesToNodeIds](#maptreeindicestonodeids)

### Methods

#### determineNodeAncestorsByNodeId

▸ **determineNodeAncestorsByNodeId**(`modelId`, `revisionId`, `nodeId`, `generation`): `Promise`<`Object`\>

Determine ancestor subtree span of a given node. If the node doesn't have an
ancestor at the generation given, the span of the root node is returned.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `modelId` | `number` | ID of 3D model |
| `revisionId` | `number` | ID of 3D model revision |
| `nodeId` | `number` | Node ID of node |
| `generation` | `number` | Generation to retrieve (0 means node itself, 1 is parent, 2 grand-parent etc). |

##### Returns

`Promise`<`Object`\>

##### Defined in

[viewer/packages/nodes-api/src/NodesApiClient.ts:51](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/nodes-api/src/NodesApiClient.ts#L51)

___

#### determineTreeIndexAndSubtreeSizesByNodeIds

▸ **determineTreeIndexAndSubtreeSizesByNodeIds**(`modelId`, `revisionId`, `nodeIds`): `Promise`<{ `subtreeSize`: `number` ; `treeIndex`: `number`  }[]\>

Determines tree index and subtreeSize (i.e. span of the subtree a node is parent
of) given a set of node IDs.

##### Parameters

| Name | Type |
| :------ | :------ |
| `modelId` | `number` |
| `revisionId` | `number` |
| `nodeIds` | `number`[] |

##### Returns

`Promise`<{ `subtreeSize`: `number` ; `treeIndex`: `number`  }[]\>

##### Defined in

[viewer/packages/nodes-api/src/NodesApiClient.ts:37](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/nodes-api/src/NodesApiClient.ts#L37)

___

#### getBoundingBoxesByNodeIds

▸ **getBoundingBoxesByNodeIds**(`modelId`, `revisionId`, `nodeIds`): `Promise`<Box3[]\>

Determines the bounds of the individual nodes provided. Note that the returned
boxes will be in "CDF coordinates" and not transformed using
the model transformation for the given model.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `modelId` | `number` | ID of 3D model |
| `revisionId` | `number` | ID of 3D model revision |
| `nodeIds` | `number`[] | Node IDs of nodes |

##### Returns

`Promise`<Box3[]\>

##### Defined in

[viewer/packages/nodes-api/src/NodesApiClient.ts:67](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/nodes-api/src/NodesApiClient.ts#L67)

___

#### mapNodeIdsToTreeIndices

▸ **mapNodeIdsToTreeIndices**(`modelId`, `revisionId`, `nodeIds`): `Promise`<number[]\>

Maps a set of "node IDs" that identify nodes, to the respective
"tree indexes".

##### Parameters

| Name | Type |
| :------ | :------ |
| `modelId` | `number` |
| `revisionId` | `number` |
| `nodeIds` | `number`[] |

##### Returns

`Promise`<number[]\>

##### Defined in

[viewer/packages/nodes-api/src/NodesApiClient.ts:27](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/nodes-api/src/NodesApiClient.ts#L27)

___

#### mapTreeIndicesToNodeIds

▸ **mapTreeIndicesToNodeIds**(`modelId`, `revisionId`, `treeIndices`): `Promise`<number[]\>

Maps a set of "tree indexes" that identify nodes, to the respective
"node IDs".

##### Parameters

| Name | Type |
| :------ | :------ |
| `modelId` | `number` |
| `revisionId` | `number` |
| `treeIndices` | `number`[] |

##### Returns

`Promise`<number[]\>

##### Defined in

[viewer/packages/nodes-api/src/NodesApiClient.ts:17](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/nodes-api/src/NodesApiClient.ts#L17)


<a name="modulesmd"></a>

[@cognite/reveal](#readmemd) / Modules

# @cognite/reveal

## Table of contents

### Modules

- [@cognite/reveal](#modules_cognite_revealmd)
- [@cognite/reveal/extensions/datasource](#modules_cognite_reveal_extensions_datasourcemd)
- [@cognite/reveal/tools](#modules_cognite_reveal_toolsmd)

# Modules


<a name="modules_cognite_revealmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / @cognite/reveal

## Module: @cognite/reveal

### Table of contents

#### Enumerations

- [NodeOutlineColor](#enums_cognite_revealnodeoutlinecolormd)
- [PotreePointColorType](#enums_cognite_revealpotreepointcolortypemd)
- [PotreePointShape](#enums_cognite_revealpotreepointshapemd)
- [PotreePointSizeType](#enums_cognite_revealpotreepointsizetypemd)
- [WellKnownAsprsPointClassCodes](#enums_cognite_revealwellknownasprspointclasscodesmd)

#### Classes

- [AssetNodeCollection](#classes_cognite_revealassetnodecollectionmd)
- [BoundingBoxClipper](#classes_cognite_revealboundingboxclippermd)
- [CameraManagerHelper](#classes_cognite_revealcameramanagerhelpermd)
- [ClusteredAreaCollection](#classes_cognite_revealclusteredareacollectionmd)
- [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd)
- [Cognite3DViewer](#classes_cognite_revealcognite3dviewermd)
- [CognitePointCloudModel](#classes_cognite_revealcognitepointcloudmodelmd)
- [ComboControls](#classes_cognite_revealcombocontrolsmd)
- [DefaultCameraManager](#classes_cognite_revealdefaultcameramanagermd)
- [IndexSet](#classes_cognite_revealindexsetmd)
- [IntersectionNodeCollection](#classes_cognite_revealintersectionnodecollectionmd)
- [InvertedNodeCollection](#classes_cognite_revealinvertednodecollectionmd)
- [NodeAppearanceProvider](#classes_cognite_revealnodeappearanceprovidermd)
- [NodeCollection](#classes_cognite_revealnodecollectionmd)
- [NotSupportedInMigrationWrapperError](#classes_cognite_revealnotsupportedinmigrationwrappererrormd)
- [NumericRange](#classes_cognite_revealnumericrangemd)
- [PropertyFilterNodeCollection](#classes_cognite_revealpropertyfilternodecollectionmd)
- [SinglePropertyFilterNodeCollection](#classes_cognite_revealsinglepropertyfilternodecollectionmd)
- [TreeIndexNodeCollection](#classes_cognite_revealtreeindexnodecollectionmd)
- [UnionNodeCollection](#classes_cognite_revealunionnodecollectionmd)

#### Interfaces

- [AddModelOptions](#interfaces_cognite_revealaddmodeloptionsmd)
- [AreaCollection](#interfaces_cognite_revealareacollectionmd)
- [CameraManager](#interfaces_cognite_revealcameramanagermd)
- [CdfModelNodeCollectionDataProvider](#interfaces_cognite_revealcdfmodelnodecollectiondataprovidermd)
- [Cognite3DViewerOptions](#interfaces_cognite_revealcognite3dvieweroptionsmd)
- [CogniteModelBase](#interfaces_cognite_revealcognitemodelbasemd)
- [GeometryFilter](#interfaces_cognite_revealgeometryfiltermd)
- [IntersectionFromPixelOptions](#interfaces_cognite_revealintersectionfrompixeloptionsmd)

#### Type aliases

- [CadIntersection](#cadintersection)
- [CadModelBudget](#cadmodelbudget)
- [CameraChangeDelegate](#camerachangedelegate)
- [CameraConfiguration](#cameraconfiguration)
- [CameraControlsOptions](#cameracontrolsoptions)
- [CameraState](#camerastate)
- [Color](#color)
- [DisposedDelegate](#disposeddelegate)
- [Intersection](#intersection)
- [LoadingStateChangeListener](#loadingstatechangelistener)
- [ModelState](#modelstate)
- [NodeAppearance](#nodeappearance)
- [NodeCollectionDescriptor](#nodecollectiondescriptor)
- [NodeCollectionSerializationContext](#nodecollectionserializationcontext)
- [OnLoadingCallback](#onloadingcallback)
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
- [REVEAL\_VERSION](#reveal_version)
- [revealEnv](#revealenv)

#### Functions

- [registerCustomNodeCollectionType](#registercustomnodecollectiontype)

### Type aliases

#### CadIntersection

Ƭ **CadIntersection**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `distanceToCamera` | `number` | Distance from the camera to the intersection. |
| `model` | [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd) | The model that was intersected. |
| `point` | `THREE.Vector3` | Coordinate of the intersection. |
| `treeIndex` | `number` | Tree index of the intersected 3D node. |
| `type` | ``"cad"`` | The intersection type. |

##### Defined in

[viewer/core/src/public/migration/types.ts:168](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L168)

___

#### CadModelBudget

Ƭ **CadModelBudget**: `Object`

Represents a measurement of how much geometry can be loaded.

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `highDetailProximityThreshold` | `number` | Sectors within this distance from the camera will always be loaded in high details.  **`deprecated`** This is only used for 3D models processed prior to the Reveal 3.0 release (Q1 2022). |
| `maximumRenderCost` | `number` | Maximum render cost. This number can be thought of as triangle count, although the number doesn't match this directly. |

##### Defined in

[viewer/packages/cad-geometry-loaders/src/CadModelBudget.ts:10](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-geometry-loaders/src/CadModelBudget.ts#L10)

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

[viewer/packages/camera-manager/src/types.ts:107](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/types.ts#L107)

___

#### CameraConfiguration

Ƭ **CameraConfiguration**: `Object`

Represents a camera configuration, consisting of a camera position and target.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `position` | `THREE.Vector3` |
| `target` | `THREE.Vector3` |

##### Defined in

[viewer/packages/utilities/src/CameraConfiguration.ts:8](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/CameraConfiguration.ts#L8)

___

#### CameraControlsOptions

Ƭ **CameraControlsOptions**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `changeCameraTargetOnClick?` | `boolean` | Enables or disables change of camera target on mouse click. New target is then set to the point of the model under current cursor position.  Default is false. |
| `mouseWheelAction?` | ``"zoomToTarget"`` \| ``"zoomPastCursor"`` \| ``"zoomToCursor"`` | Sets mouse wheel initiated action.  Modes:  'zoomToTarget' - zooms just to the current target (center of the screen) of the camera.  'zoomPastCursor' - zooms in the direction of the ray coming from camera through cursor screen position, allows going through objects.  'zoomToCursor' - mouse wheel scroll zooms towards the point on the model where cursor is hovering over, doesn't allow going through objects.  Default is 'zoomPastCursor'. |

##### Defined in

[viewer/packages/camera-manager/src/types.ts:5](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/types.ts#L5)

___

#### CameraState

Ƭ **CameraState**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `position?` | `THREE.Vector3` | Camera position in world space. |
| `rotation?` | `THREE.Quaternion` | Camera local rotation in quaternion form. |
| `target?` | `THREE.Vector3` | Camera target in world space. |

##### Defined in

[viewer/packages/camera-manager/src/types.ts:64](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/camera-manager/src/types.ts#L64)

___

#### Color

Ƭ **Color**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `b` | `number` |
| `g` | `number` |
| `r` | `number` |

##### Defined in

[viewer/core/src/public/migration/types.ts:17](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L17)

___

#### DisposedDelegate

Ƭ **DisposedDelegate**: () => `void`

Delegate for disposal events.

##### Type declaration

▸ (): `void`

###### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/types.ts:219](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L219)

___

#### Intersection

Ƭ **Intersection**: [CadIntersection](#cadintersection) \| `PointCloudIntersection`

##### Defined in

[viewer/core/src/public/migration/types.ts:195](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L195)

___

#### LoadingStateChangeListener

Ƭ **LoadingStateChangeListener**: (`loadingState`: `LoadingState`) => `any`

Handler for events about data being loaded.

##### Type declaration

▸ (`loadingState`): `any`

###### Parameters

| Name | Type |
| :------ | :------ |
| `loadingState` | `LoadingState` |

###### Returns

`any`

##### Defined in

[viewer/core/src/public/types.ts:26](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/types.ts#L26)

___

#### ModelState

Ƭ **ModelState**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `defaultNodeAppearance` | [NodeAppearance](#nodeappearance) |
| `modelId` | `number` |
| `revisionId` | `number` |
| `styledSets` | { `appearance`: [NodeAppearance](#nodeappearance) ; `options?`: `any` ; `state`: `any` ; `token`: `string`  }[] |

##### Defined in

[viewer/core/src/utilities/ViewStateHelper.ts:31](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/utilities/ViewStateHelper.ts#L31)

___

#### NodeAppearance

Ƭ **NodeAppearance**: `Object`

Type for defining node appearance profiles to style a 3D CAD model.

**`see`** [DefaultNodeAppearance](#defaultnodeappearance)

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `color?` | [`number`, `number`, `number`] | Overrides the default color of the node in RGB. Each component is in range [0, 255]. `[0, 0, 0]` means no override. |
| `outlineColor?` | [NodeOutlineColor](#enums_cognite_revealnodeoutlinecolormd) | When set, an outline is drawn around the node to make it stand out. |
| `prioritizedForLoadingHint?` | `number` | When provided, this value can be used to prioritize certain areas of the 3D model to be loaded. This can be useful to prioritize key objects in the 3D model to always be loaded.  When non-zero, sectors containing geometry in the vicinity of the prioritized sectors are given an *extra* priority. Recommended values are in range 1 (somewhat higher priority to be loaded) to 10 (very likely to be loaded). Usually values around 4-5 is recommended.  Prioritized nodes are loaded at the expense of non-prioritized areas. There are no guarantees that the nodes are actually loaded, and the more prioritized areas/nodes provided, the less likely it is that the hint is obeyed.  Extra priority doesn't accumulate when sectors are prioritized because they intersect/contain several nodes.  **This is an advanced feature and not recommended for most users**   **`version`** Only works with 3D models converted later than Q4 2021. |
| `renderGhosted?` | `boolean` | When set to true, the node is rendered ghosted, i.e. transparent with a fixed color. This has no effect if [renderInFront](#renderinfront) is `true`. |
| `renderInFront?` | `boolean` | When set to true, the node is rendered in front of all other nodes even if it's occluded. Note that this take precedence over [renderGhosted](#renderghosted). |
| `visible?` | `boolean` | Overrides the visibility of the node. |

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearance.ts:20](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearance.ts#L20)

___

#### NodeCollectionDescriptor

Ƭ **NodeCollectionDescriptor**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `options?` | `any` |
| `state` | `any` |
| `token` | [TypeName](#typename) |

##### Defined in

[viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts:22](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L22)

___

#### NodeCollectionSerializationContext

Ƭ **NodeCollectionSerializationContext**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `client` | `CogniteClient` |
| `model` | [CdfModelNodeCollectionDataProvider](#interfaces_cognite_revealcdfmodelnodecollectiondataprovidermd) |

##### Defined in

[viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts:21](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L21)

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

[viewer/core/src/public/migration/types.ts:32](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L32)

___

#### PointCloudBudget

Ƭ **PointCloudBudget**: `Object`

Represents a budget of how many point from point clouds can be
loaded at the same time.

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `numberOfPoints` | `number` | Total number of points that can be loaded for all point clouds models accumulated. |

##### Defined in

[viewer/packages/pointclouds/src/PointCloudBudget.ts:10](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/pointclouds/src/PointCloudBudget.ts#L10)

___

#### PointerEventDelegate

Ƭ **PointerEventDelegate**: (`event`: { `offsetX`: `number` ; `offsetY`: `number`  }) => `void`

##### Type declaration

▸ (`event`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.offsetX` | `number` |
| `event.offsetY` | `number` |

###### Returns

`void`

##### Defined in

[viewer/core/src/public/migration/types.ts:207](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L207)

___

#### RevealOptions

Ƭ **RevealOptions**: `Object`

**`property`** logMetrics Might be used to disable usage statistics.

**`property`** nodeAppearanceProvider Style node by tree-index.

**`property`** internal Internals are for internal usage only (like unit-testing).

##### Type declaration

| Name | Type |
| :------ | :------ |
| `continuousModelStreaming?` | `boolean` |
| `internal?` | `Object` |
| `internal.cad?` | `InternalRevealCadOptions` |
| `logMetrics?` | `boolean` |
| `renderOptions?` | `RenderOptions` |

##### Defined in

[viewer/core/src/public/types.ts:14](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/types.ts#L14)

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

[viewer/core/src/public/migration/types.ts:226](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/public/migration/types.ts#L226)

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

[viewer/packages/cad-styling/src/SerializedNodeCollection.ts:4](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/SerializedNodeCollection.ts#L4)

___

#### SupportedModelTypes

Ƭ **SupportedModelTypes**: ``"pointcloud"`` \| ``"cad"``

##### Defined in

[viewer/packages/model-base/src/SupportedModelTypes.ts:4](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/model-base/src/SupportedModelTypes.ts#L4)

___

#### TypeName

Ƭ **TypeName**: `string`

##### Defined in

[viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts:20](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L20)

___

#### ViewerState

Ƭ **ViewerState**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `camera?` | `Object` |
| `camera.position` | `Object` |
| `camera.position.x` | `number` |
| `camera.position.y` | `number` |
| `camera.position.z` | `number` |
| `camera.target` | `Object` |
| `camera.target.x` | `number` |
| `camera.target.y` | `number` |
| `camera.target.z` | `number` |
| `clippingPlanes?` | `ClippingPlanesState`[] |
| `models?` | [ModelState](#modelstate)[] |

##### Defined in

[viewer/core/src/utilities/ViewStateHelper.ts:15](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/utilities/ViewStateHelper.ts#L15)

___

#### WellKnownUnit

Ƭ **WellKnownUnit**: ``"Meters"`` \| ``"Centimeters"`` \| ``"Millimeters"`` \| ``"Micrometers"`` \| ``"Kilometers"`` \| ``"Feet"`` \| ``"Inches"`` \| ``"Yards"`` \| ``"Miles"`` \| ``"Mils"`` \| ``"Microinches"``

Units supported by [Cognite3DModel](#classes_cognite_revealcognite3dmodelmd).

##### Defined in

[viewer/packages/cad-model/src/WellKnownUnit.ts:8](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-model/src/WellKnownUnit.ts#L8)

### Variables

#### DefaultNodeAppearance

• `Const` **DefaultNodeAppearance**: `Object`

A set of default node appearances used in Reveal.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `Default` | [NodeAppearance](#nodeappearance) |
| `Ghosted` | [NodeAppearance](#nodeappearance) |
| `Hidden` | [NodeAppearance](#nodeappearance) |
| `Highlighted` | `Object` |
| `Highlighted.color?` | [`number`, `number`, `number`] |
| `Highlighted.outlineColor?` | [NodeOutlineColor](#enums_cognite_revealnodeoutlinecolormd) |
| `Highlighted.prioritizedForLoadingHint?` | `number` |
| `Highlighted.renderGhosted?` | `boolean` |
| `Highlighted.renderInFront?` | `boolean` |
| `Highlighted.visible?` | `boolean` |
| `InFront` | [NodeAppearance](#nodeappearance) |
| `Outlined` | [NodeAppearance](#nodeappearance) |

##### Defined in

[viewer/packages/cad-styling/src/NodeAppearance.ts:109](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeAppearance.ts#L109)

___

#### REVEAL\_VERSION

• `Const` **REVEAL\_VERSION**: `string`

##### Defined in

[viewer/core/src/index.ts:23](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/core/src/index.ts#L23)

___

#### revealEnv

• `Const` **revealEnv**: `Object`

Used to specify custom url for worker/wasm files
in cases when you need the latest local files or CDN is blocked by CSP.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `publicPath` | `string` |

##### Defined in

[viewer/packages/utilities/src/revealEnv.ts:9](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/utilities/src/revealEnv.ts#L9)

### Functions

#### registerCustomNodeCollectionType

▸ **registerCustomNodeCollectionType**<T\>(`nodeCollectionType`, `deserializer`): `void`

##### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T`: [NodeCollection](#classes_cognite_revealnodecollectionmd)<T\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollectionType` | [TypeName](#typename) |
| `deserializer` | (`descriptor`: [NodeCollectionDescriptor](#nodecollectiondescriptor), `context`: [NodeCollectionSerializationContext](#nodecollectionserializationcontext)) => `Promise`<T\> |

##### Returns

`void`

##### Defined in

[viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts:147](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/cad-styling/src/NodeCollectionDeserializer.ts#L147)


<a name="modules_cognite_reveal_extensions_datasourcemd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / @cognite/reveal/extensions/datasource

## Module: @cognite/reveal/extensions/datasource

### Table of contents

#### Enumerations

- [File3dFormat](#enums_cognite_reveal_extensions_datasourcefile3dformatmd)

#### Classes

- [CdfModelIdentifier](#classes_cognite_reveal_extensions_datasourcecdfmodelidentifiermd)

#### Interfaces

- [BlobOutputMetadata](#interfaces_cognite_reveal_extensions_datasourcebloboutputmetadatamd)
- [DataSource](#interfaces_cognite_reveal_extensions_datasourcedatasourcemd)
- [ModelDataProvider](#interfaces_cognite_reveal_extensions_datasourcemodeldataprovidermd)
- [ModelIdentifier](#interfaces_cognite_reveal_extensions_datasourcemodelidentifiermd)
- [ModelMetadataProvider](#interfaces_cognite_reveal_extensions_datasourcemodelmetadataprovidermd)
- [NodesApiClient](#interfaces_cognite_reveal_extensions_datasourcenodesapiclientmd)


<a name="modules_cognite_reveal_toolsmd"></a>

[@cognite/reveal](#readmemd) / [Modules](#modulesmd) / @cognite/reveal/tools

## Module: @cognite/reveal/tools

### Table of contents

#### Enumerations

- [BingMapImageFormat](#enums_cognite_reveal_toolsbingmapimageformatmd)
- [BingMapType](#enums_cognite_reveal_toolsbingmaptypemd)
- [Corner](#enums_cognite_reveal_toolscornermd)
- [HereMapImageFormat](#enums_cognite_reveal_toolsheremapimageformatmd)
- [HereMapScheme](#enums_cognite_reveal_toolsheremapschememd)
- [HereMapType](#enums_cognite_reveal_toolsheremaptypemd)
- [MapProviders](#enums_cognite_reveal_toolsmapprovidersmd)
- [MapboxImageFormat](#enums_cognite_reveal_toolsmapboximageformatmd)
- [MapboxMode](#enums_cognite_reveal_toolsmapboxmodemd)
- [MapboxStyle](#enums_cognite_reveal_toolsmapboxstylemd)

#### Classes

- [AxisViewTool](#classes_cognite_reveal_toolsaxisviewtoolmd)
- [Cognite3DViewerToolBase](#classes_cognite_reveal_toolscognite3dviewertoolbasemd)
- [DebugCameraTool](#classes_cognite_reveal_toolsdebugcameratoolmd)
- [DebugLoadedSectorsTool](#classes_cognite_reveal_toolsdebugloadedsectorstoolmd)
- [ExplodedViewTool](#classes_cognite_reveal_toolsexplodedviewtoolmd)
- [GeomapTool](#classes_cognite_reveal_toolsgeomaptoolmd)
- [HtmlOverlayTool](#classes_cognite_reveal_toolshtmloverlaytoolmd)
- [Keyframe](#classes_cognite_reveal_toolskeyframemd)
- [TimelineTool](#classes_cognite_reveal_toolstimelinetoolmd)

#### Type aliases

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

### Type aliases

#### AbsolutePosition

Ƭ **AbsolutePosition**: `Object`

Absolute position in pixels.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `xAbsolute` | `number` |
| `yAbsolute` | `number` |

##### Defined in

[viewer/packages/tools/src/AxisView/types.ts:47](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/AxisView/types.ts#L47)

___

#### AxisBoxCompassConfig

Ƭ **AxisBoxCompassConfig**: `Object`

Configuration of the compass.

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `fontColor?` | `THREE.Color` | - |
| `fontSize?` | `number` | - |
| `labelDelta?` | `number` | Offset in radians of the orientation indicator. |
| `ringLabel?` | `string` | Label of the orientation indicator. Defaults to 'N' for north. |
| `tickColor?` | `THREE.Color` | - |

##### Defined in

[viewer/packages/tools/src/AxisView/types.ts:79](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/AxisView/types.ts#L79)

___

#### AxisBoxConfig

Ƭ **AxisBoxConfig**: `Object`

Configuration of [AxisViewTool](#classes_cognite_reveal_toolsaxisviewtoolmd).

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `animationSpeed?` | `number` | How long the camera animation lasts when clicking a face of the orientation box. |
| `compass?` | [AxisBoxCompassConfig](#axisboxcompassconfig) | Configuration of the compass "base" of the tool. |
| `faces?` | `Object` | Configuration for each of the faces of the orientation box. Note that Reveal uses a right-handed Y up coordinate system, which might differ from the original model space. To account for this, you might want to reassign labels of the faces. |
| `faces.xNegativeFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `faces.xPositiveFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `faces.yNegativeFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `faces.yPositiveFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `faces.zNegativeFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `faces.zPositiveFace?` | [AxisBoxFaceConfig](#axisboxfaceconfig) | - |
| `position?` | [AbsolutePosition](#absoluteposition) \| [RelativePosition](#relativeposition) | Position, either absolute or relative. |
| `size?` | `number` | Size in pixels of the axis tool. |

##### Defined in

[viewer/packages/tools/src/AxisView/types.ts:10](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/AxisView/types.ts#L10)

___

#### AxisBoxFaceConfig

Ƭ **AxisBoxFaceConfig**: `Object`

Configuration of each face of the orientation box.

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `faceColor?` | `THREE.Color` | - |
| `fontColor?` | `THREE.Color` | - |
| `fontSize?` | `number` | - |
| `label?` | `string` | Label of the respective face, e.g. 'X' or 'Right'. |
| `outlineColor?` | `THREE.Color` | - |
| `outlineSize?` | `number` | - |

##### Defined in

[viewer/packages/tools/src/AxisView/types.ts:64](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/AxisView/types.ts#L64)

___

#### BingMapConfig

Ƭ **BingMapConfig**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `APIKey` | `string` | Bing Map API Key |
| `provider` | [BingMap](#bingmap) | - |
| `type?` | [BingMapType](#enums_cognite_reveal_toolsbingmaptypemd) | The type of the map used. |

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:121](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L121)

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

[viewer/packages/tools/src/DebugLoadedSectorsTool.ts:12](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/DebugLoadedSectorsTool.ts#L12)

___

#### HereMapConfig

Ƭ **HereMapConfig**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `APIKey` | `string` | Here map API Key |
| `appCode?` | `string` | Service application code token. |
| `imageFormat?` | [HereMapImageFormat](#enums_cognite_reveal_toolsheremapimageformatmd) | Map image tile format |
| `provider` | [HereMap](#heremap) | - |
| `scheme?` | `string` | Specifies the view scheme |
| `size?` | `number` | Returned tile map image size. The following sizes are supported: - 256 - 512 - 128 (deprecated, although usage is still accepted) |
| `style?` | [HereMapType](#enums_cognite_reveal_toolsheremaptypemd) | The type of maps to be used. |

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:133](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L133)

___

#### HtmlOverlayCreateClusterDelegate

Ƭ **HtmlOverlayCreateClusterDelegate**: (`overlayElements`: { `htmlElement`: `HTMLElement` ; `userData`: `any`  }[]) => `HTMLElement`

Callback that is triggered when a set of overlays are clustered together in
[HtmlOverlayTool](#classes_cognite_reveal_toolshtmloverlaytoolmd).

##### Type declaration

▸ (`overlayElements`): `HTMLElement`

###### Parameters

| Name | Type |
| :------ | :------ |
| `overlayElements` | { `htmlElement`: `HTMLElement` ; `userData`: `any`  }[] |

###### Returns

`HTMLElement`

##### Defined in

[viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:31](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L31)

___

#### HtmlOverlayOptions

Ƭ **HtmlOverlayOptions**: `Object`

Options for an overlay added using [HtmlOverlayTool.add](#add).

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `positionUpdatedCallback?` | [HtmlOverlayPositionUpdatedDelegate](#htmloverlaypositionupdateddelegate) | Callback that is triggered whenever the position of the overlay is updated. Optional. |
| `userData?` | `any` | Optional user specified data that is provided to the [HtmlOverlayCreateClusterDelegate](#htmloverlaycreateclusterdelegate) and [HtmlOverlayPositionUpdatedDelegate](#htmloverlaypositionupdateddelegate). |

##### Defined in

[viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:41](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L41)

___

#### HtmlOverlayPositionUpdatedDelegate

Ƭ **HtmlOverlayPositionUpdatedDelegate**: (`element`: `HTMLElement`, `position2D`: `THREE.Vector2`, `position3D`: `THREE.Vector3`, `distanceToCamera`: `number`, `userData`: `any`) => `void`

Callback that is triggered whenever the 2D position of an overlay is updated
in [HtmlOverlayTool](#classes_cognite_reveal_toolshtmloverlaytoolmd).

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

[viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:19](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L19)

___

#### MapConfig

Ƭ **MapConfig**: { `latlong`: `LatLongPosition`  } & [BingMapConfig](#bingmapconfig) \| [HereMapConfig](#heremapconfig) \| [MapboxConfig](#mapboxconfig) \| `OpenStreetMapConfig`

Maps Configuration of [GeomapTool](#classes_cognite_reveal_toolsgeomaptoolmd).

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:198](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L198)

___

#### MapboxConfig

Ƭ **MapboxConfig**: `Object`

##### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `APIKey` | `string` | Mapbox API Key |
| `id` | `string` | Map style or map ID if the mode is set to MAP_ID |
| `mode?` | [MapboxMode](#enums_cognite_reveal_toolsmapboxmodemd) | Map tile access mode - MapboxMode.STYLE - MapboxMode.MAP_ID |
| `provider` | [MapboxMap](#mapboxmap) | - |
| `tileFormat?` | [MapboxImageFormat](#enums_cognite_reveal_toolsmapboximageformatmd) | Map image tile format |
| `useHDPI?` | `boolean` | Flag to indicate if should use high resolution tiles |

##### Defined in

[viewer/packages/tools/src/Geomap/MapConfig.ts:169](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Geomap/MapConfig.ts#L169)

___

#### RelativePosition

Ƭ **RelativePosition**: `Object`

Relative position from a corner of the viewer
and a given padding.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `corner` | [Corner](#enums_cognite_reveal_toolscornermd) |
| `padding` | `THREE.Vector2` |

##### Defined in

[viewer/packages/tools/src/AxisView/types.ts:56](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/AxisView/types.ts#L56)

___

#### TimelineDateUpdateDelegate

Ƭ **TimelineDateUpdateDelegate**: (`event`: { `activeKeyframe`: [Keyframe](#classes_cognite_reveal_toolskeyframemd) \| `undefined` ; `date`: `Date` ; `endDate`: `Date` ; `startDate`: `Date`  }) => `void`

Delegate for Timeline Date update

##### Type declaration

▸ (`event`): `void`

###### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |
| `event.activeKeyframe` | [Keyframe](#classes_cognite_reveal_toolskeyframemd) \| `undefined` |
| `event.date` | `Date` |
| `event.endDate` | `Date` |
| `event.startDate` | `Date` |

###### Returns

`void`

##### Defined in

[viewer/packages/tools/src/Timeline/types.ts:8](https://github.com/cognitedata/reveal/blob/a722e6ef/viewer/packages/tools/src/Timeline/types.ts#L8)
