# Proposal for solution: highlighted node rendering

## Problem

To render highlighted nodes, the full scene must be rendered twice where almost all of the fragments/pixels from the highlight-pass is discarded

## Solution overview

A major improvement would only be to render sectors that contains geometry for the selected tree index. Note that this doesn't necessarily mean that _ONLY_ highlighted objects are rendered, but that most of the irrelevant geometry is culled and not processed by the GPU.

I propose that all our geometry objects get a 'treeIndices'-attachment that contains the list of nodes (identified by tree index) that the 3d object contains geometry for. For the rendering pass where we render highlighted objects, we only render sectors that contains highlighted geometry.

## Render algorithm

This describes the algorithm for the rendering pass for highlighted geometry. In `Cognite3dViewer` Input to the algorithm is a list of "potentially highlighted 3d objects".

1. Highlight rendering mode is initialized by setting the correct render mode in the `MaterialsManager`s etc.
2. In `Cognite3dViewer` visits each `Cognite3dModel` to render "potentially highlighted objects".
3. `Cognite3dModel.visitHighlightedSectors` (new) is invoked with a callback for rendering the single sector.
4. The callback from the step above traverses the "sector scene" (i.e. the scene graph for the single sector). For each `THREE.Mesh` object in the scene, extract `geometry` and  `material`. Invoke [`WebGlRenderer.renderBufferDirect`](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.renderBufferDirect) for each of the 3d nodes.


### `Cognite3dModel.visitHightlightedSector`

The `visitHighlightedSector` is implemented by traversing all sectors in `CadNode` using the a function `CadNode.traverse3dScene`, checking for `THREE.Group`s that contains highlighted tree indices as defined by `Cognite3dModel.selectedNodes`. A callback is invoked for each matching `THREE.Group`.

## Required changes

1. [`consumeSectorDetailed()`](https://github.com/cognitedata/reveal/blob/470b93ff2e79fdaaedfbf407d2e6b508c1aeda4e/viewer/src/datamodels/cad/sector/sectorUtilities.ts#L84) must attach a `treeIndex`-list. It's probably  agood idea to store the list as a `Set<number>` to enable fast lookups. Attach the list to [`THREE.Group.userData`](https://threejs.org/docs/#api/en/core/Object3D.userData). The tree index can be extracted from [`SectorGeometry`](https://github.com/cognitedata/reveal/blob/544f8831dd549bcc3b187734bc5fcc4d3ae96809/viewer/src/datamodels/cad/sector/types.ts#L126).
2. [`consumeSectorSimple()`](https://github.com/cognitedata/reveal/blob/470b93ff2e79fdaaedfbf407d2e6b508c1aeda4e/viewer/src/datamodels/cad/sector/sectorUtilities.ts#L34) must undergo the same changes as described above.
3. [`addPostRenderEffects()`](https://github.com/cognitedata/reveal/blob/53b6eba5866d459f24ae4c239e14465b26fd469d/viewer/src/datamodels/cad/rendering/postRenderEffects.ts#L9) must received a list of relevant objects to render for highlights (or maybe the function should be split or a class introduced).
4. Add `CadNode.traverse3dScene` which traverses `CadNode._rootSectorNode` using [`THREE.Object3D.traverse`](https://threejs.org/docs/#api/en/core/Object3D.traverse).

## Possible improvements

- The proposal attaches treeIndex information to each sector. This could be improved on by attaching the information to each individual geometry object within a sector.
-  Scene traversal can probably be reduced by not traversing to leaf nodes and rather stop at the `THREE.Group`-level where the `treeIndex`-information is stored.
-  The proposed solution uses data stored in `Cognite3dModel` to determine if an object is highlighted, by using `Cognite3dModel.selectedNodes` to determine tree indices that are highlighted. This does not scale well since it only works in the migration layer. A better solution that would work better outside the migration wrapper is to use the `NodeAppearanceProvider` stored in `MaterialsManager` to determine highlighted tree indices.