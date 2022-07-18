# Point Cloud Package

## Purpose

Handles virtually all things point clouds for Reveal - everything related to adding, loading and rendering.

## Structure

The `src/potree-three-loader` folder contains modified source code from the `pnext/three-loader` Github repository, which is a point cloud loading and rendering library adapted from Potree. The source code has since been modified to better suit our needs.

The `styling` folder contains code related to styling point cloud objects, including classes for object definitions themselves, i.e. `shapes`.

## Glossary

### Loading

- **EPT**: **E**ntwined **P**oint **T**ile, the file format we use to store and load point cloud data from the cloud.
- **Geometry Node**: A node that supports the `load` operation, but which does not necessarily have the data loaded yet. If loaded, the data is only on the CPU side.
- **Tree Node**: A somewhat vague term, but in the context of loading, mostly used to refer to an octree node with its geometry loaded to the GPU and being part of the render loop.

### Styling

- **Shape**: A primitive 3D shape, e.g. an oriented box or a cylinder.
- **Stylable Object**: A point cloud object that can be styled. Represented by one or more **shapes** in 3D space. Assigning a style to a stylable object results in all points contained in any of the object's shapes attaining that style.
- **Annotation**: The CDF resource type used for storing descriptions of stylable point cloud objects. One annotation corresponds to one object, and may consist of many primitive **shapes**.
- **Annotation ID**: ID uniquely referring to one annotation in CDF.
- **Object ID**: Reveal-internal ID referring to a stylable point cloud object. Created as a running number starting from 1. Used for looking up appearance in a texture.

## Inner Workings

### Loading

A point cloud model is structured in an [octree](https://en.wikipedia.org/wiki/Octree). Each node in the octree contains points from the spatial area covered by that node. There is a one-to-one correspondence between nodes in the octree and `.bin` files containing the points, which Reveal may load.

The topmost node in the octree contains points sparsely sampled from the entire scene. Deeper child nodes cover smaller areas, but contain more densely sampled points. For a node in the octree to be loaded, all its ancestors must also be loaded. Octree nodes thus come in two flavors: **Geometry nodes** ("unloaded nodes") and **tree nodes** ("loaded nodes").

### Styling

When a point cloud model is added, Reveal automatically tries to load all **annotations** associated with that model from CDF. Each annotation is stored as a **stylable object**, associated with an **object ID**. Styling information for all annotated objects are stored in a texture. Each texel contains style information for one object, with the RGB channels containing the style color, and the alpha channel containing other effects, e.g. visibility.
