# Sector parser
The sector parser package is intended to be used for parsing raw byte arrays containing geometric information of a given sectors which includes: primitives, untextured merged triangle meshes, textured merged triangle meshes and instanced triangle meshes.

## Usage
This package has a single entrypoint containing a method for parsing the raw array buffer:

```ts
parseSector(data: ArrayBuffer): [RevealGeometryCollectionType, THREE.BufferGeometry][];
```

The result from this operation is a list of `THREE.BufferGeometry` that is grouped by an `enum` that describes the geometry collection type.

```ts
enum RevealGeometryCollectionType {
  BoxCollection,
  CircleCollection,
  ConeCollection,
  EccentricConeCollection,
  EllipsoidSegmentCollection,
  GeneralCylinderCollection,
  GeneralRingCollection,
  QuadCollection,
  TorusSegmentCollection,
  TrapeziumCollection,
  NutCollection,
  TriangleMesh,
  TexturedTriangleMesh,
  InstanceMesh
}
```
The buffer geometry result has all the neccesary attributes added and it also adds the geometry such as quads for those types that are ray-traced.

## Sector parser test app
The `/app/` folder contains a test app which can be used to test the sector parser in a browser context. The app can be started by running `yarn start` in the package root.
The app will automatically load any and all sector files located in the `/test-models/` directory. Note that the test app has no concept of where the geometry is so you might have to change the camera position / target.

## Texture Support

If a sector contains textured geometry, the optimizer will, in addition to the normal `<id>.glb` file, output an `<id>_textured.glb` file. Reveal will check the scene metadata to see if a sector has an `<id>_textured.glb` file, and uses that instead of the normal file.

The normal file will not contain any textured geometry, and is only produced for backwards compatibility with older Reveal versions.

`<id>_textured.glb` will contain the traditional `TriangleMesh` node, but also a `TexturedTriangleMesh` node. All textured geometry is found in the `TexturedTriangleMesh` node, while `TriangleMesh` contains untextured meshes like before.
