## Classes

<dl>
<dt><a href="#ByVisibilityGpuSectorCuller">ByVisibilityGpuSectorCuller</a></dt>
<dd><p>SectorCuller that uses the GPU to determine an approximation
of how &quot;visible&quot; each sector is to get a priority for each sector
and loads sectors based on priority within a budget.</p></dd>
<dt><a href="#GpuOrderSectorsByVisibilityCoverage">GpuOrderSectorsByVisibilityCoverage</a></dt>
<dd><p>Estimates sector visibility by rendering their bounds with a pattern confirming to how
much of the geometry covers of the bounding box.</p></dd>
<dt><a href="#PotreeGroupWrapper">PotreeGroupWrapper</a></dt>
<dd><p>Wrapper around Potree.Group with type information and
basic functionality.</p></dd>
<dt><a href="#PotreeNodeWrapper">PotreeNodeWrapper</a></dt>
<dd><p>Wrapper around <code>Potree.PointCloudOctree</code> with some convinence functions.</p></dd>
<dt><a href="#Cognite3DModel">Cognite3DModel</a></dt>
<dd></dd>
<dt><a href="#RevealManager">RevealManager</a></dt>
<dd></dd>
<dt><a href="#CdfModelDataClient">CdfModelDataClient</a></dt>
<dd><p>Provides 3D V2 specific extensions for the standard CogniteClient used by Reveal.</p></dd>
</dl>

## Members

<dl>
<dt><a href="#edgeDetectionShaders">edgeDetectionShaders</a></dt>
<dd><p>Shaders use to estimate how many pixels a sector covers on screen.</p></dd>
<dt><a href="#File3dFormat">File3dFormat</a></dt>
<dd><p>Colors from the Cognite theme.</p></dd>
<dt><a href="#CogniteColors">CogniteColors</a></dt>
<dd><p>Represents the transformation matrix for a model. Stores both the model matrix and the inverse matrix.</p></dd>
</dl>

## Constants

<dl>
<dt><a href="#defaultLoadingHints">defaultLoadingHints</a></dt>
<dd><p>Hints that modifies how CAD sectors are loaded.</p></dd>
<dt><a href="#shaderDefines">shaderDefines</a></dt>
<dd><p>Defines used to enable debugging features in shaders.</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#generatePlane3D">generatePlane3D()</a></dt>
<dd><p>Generate a three-dimensional plane geometry, with an optional applied tranformation function
(u, v) =&gt; [ x, y, z ]</p></dd>
<dt><a href="#determinePowerOfTwoDimensions">determinePowerOfTwoDimensions()</a></dt>
<dd><p>Computes minimal power-of-two width and height that holds at least the number of elements provided.
This is useful to compute texture sizes.</p></dd>
<dt><a href="#disposeAttributeArrayOnUpload">disposeAttributeArrayOnUpload()</a></dt>
<dd><p>Handler for THREE.BufferAttribute.onUpload() that frees the underlying JS side array
of values after they have been uploaded to the GPU.</p></dd>
</dl>

<a name="ByVisibilityGpuSectorCuller" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## ByVisibilityGpuSectorCuller
<p>SectorCuller that uses the GPU to determine an approximation
of how &quot;visible&quot; each sector is to get a priority for each sector
and loads sectors based on priority within a budget.</p>

**Kind**: global class  
<a name="GpuOrderSectorsByVisibilityCoverage" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## GpuOrderSectorsByVisibilityCoverage
<p>Estimates sector visibility by rendering their bounds with a pattern confirming to how
much of the geometry covers of the bounding box.</p>

**Kind**: global class  
<a name="PotreeGroupWrapper" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## PotreeGroupWrapper
<p>Wrapper around Potree.Group with type information and
basic functionality.</p>

**Kind**: global class  
<a name="PotreeNodeWrapper" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## PotreeNodeWrapper
<p>Wrapper around <code>Potree.PointCloudOctree</code> with some convinence functions.</p>

**Kind**: global class  
<a name="Cognite3DModel" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## Cognite3DModel
**Kind**: global class  
**Internal**:   

* [Cognite3DModel](#Cognite3DModel)
    * [.mapFromCdfToModelCoordinates(p, out)](#Cognite3DModel+mapFromCdfToModelCoordinates)
    * [.mapPositionFromModelToCdfCoordinates(p, out)](#Cognite3DModel+mapPositionFromModelToCdfCoordinates)

<a name="Cognite3DModel+mapFromCdfToModelCoordinates" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

### cognite3DModel.mapFromCdfToModelCoordinates(p, out)
<p>Maps a position retrieved from the CDF API (e.g. 3D node information) to
coordinates in &quot;ThreeJS model space&quot;. This is necessary because CDF has a right-handed
Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.</p>

**Kind**: instance method of [<code>Cognite3DModel</code>](#Cognite3DModel)  

| Param | Description |
| --- | --- |
| p | <p>The CDF coordinate to transform</p> |
| out | <p>Optional preallocated buffer for storing the result</p> |

<a name="Cognite3DModel+mapPositionFromModelToCdfCoordinates" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

### cognite3DModel.mapPositionFromModelToCdfCoordinates(p, out)
<p>Maps from a 3D position in &quot;ThreeJS model space&quot; (e.g. a ray intersection coordinate)
to coordinates in &quot;CDF space&quot;. This is necessary because CDF has a right-handed
Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.</p>

**Kind**: instance method of [<code>Cognite3DModel</code>](#Cognite3DModel)  

| Param | Description |
| --- | --- |
| p | <p>The ThreeJS coordinate to transform</p> |
| out | <p>Optional preallocated buffer for storing the result</p> |

<a name="RevealManager" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## RevealManager
**Kind**: global class  
**Internal**:   
<a name="CdfModelDataClient" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## CdfModelDataClient
<p>Provides 3D V2 specific extensions for the standard CogniteClient used by Reveal.</p>

**Kind**: global class  
<a name="edgeDetectionShaders" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## edgeDetectionShaders
<p>Shaders use to estimate how many pixels a sector covers on screen.</p>

**Kind**: global variable  
<a name="File3dFormat" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## File3dFormat
<p>Colors from the Cognite theme.</p>

**Kind**: global variable  
<a name="CogniteColors" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## CogniteColors
<p>Represents the transformation matrix for a model. Stores both the model matrix and the inverse matrix.</p>

**Kind**: global variable  
<a name="defaultLoadingHints" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## defaultLoadingHints
<p>Hints that modifies how CAD sectors are loaded.</p>

**Kind**: global constant  
<a name="shaderDefines" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## shaderDefines
<p>Defines used to enable debugging features in shaders.</p>

**Kind**: global constant  
<a name="generatePlane3D" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## generatePlane3D()
<p>Generate a three-dimensional plane geometry, with an optional applied tranformation function
(u, v) =&gt; [ x, y, z ]</p>

**Kind**: global function  
<a name="determinePowerOfTwoDimensions" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## determinePowerOfTwoDimensions()
<p>Computes minimal power-of-two width and height that holds at least the number of elements provided.
This is useful to compute texture sizes.</p>

**Kind**: global function  
<a name="disposeAttributeArrayOnUpload" aria-hidden="true" tabIndex="-1" className="anchor enhancedAnchor_node_modules-@docusaurus-theme-classic-src-theme-Heading-"></a>

## disposeAttributeArrayOnUpload()
<p>Handler for THREE.BufferAttribute.onUpload() that frees the underlying JS side array
of values after they have been uploaded to the GPU.</p>

**Kind**: global function  
**Example**  
```js
const geometry = new THREE.BufferGeometry();
const indices = new THREE.Uint32BufferAttribute(mesh.indices.buffer, 1).onUpload(disposeAttributeArrayOnUpload);
const vertices = new THREE.Float32BufferAttribute(mesh.vertices.buffer, 3).onUpload(disposeAttributeArrayOnUpload);
const colors = new THREE.Float32BufferAttribute(mesh.colors.buffer, 3).onUpload(disposeAttributeArrayOnUpload);
const treeIndices = new THREE.Float32BufferAttribute(mesh.treeIndices.buffer, 1).onUpload(disposeAttributeArrayOnUpload);
```
