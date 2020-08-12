---
id: migration-guide
title: Migration guide (WIP)
hide_title: true
---

## Migration Guide from [@cognite/3d‑viewer](https://github.com/cognitedata/3d-viewer)

**This page is work in progress.**

API is mostly the same, but you don't have all model nodes at once,
because streaming is used. 

<!--- TODO: write migration guide --->
<!--- notes:
* Cognite3DViewer.getIntersectionFromPixel doesn't have the model param
* Cognite3DViewer.clearCache is not supported
* Cognite3DViewer.addModel now can return any supported model type, not only cad. For cad use addCadModel

# Cognite3DModel
* model getBoundingBox doesn't support nodeId parameter - use getBoundingBoxFromCdf 
* hideAllNodes doesn't support makeGray arg
* iterateNodes is not supported
* iterateSubtree is not supported
* getSubtreeNodeIds is not supported
--->
