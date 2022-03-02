struct GeometryTypeEnum {
  int Quad;
  int Primitive;
  int TriangleMesh;
  int InstancedMesh;
};

const GeometryTypeEnum GeometryType = GeometryTypeEnum(1,2,3,4);
