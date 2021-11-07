export type GltfJson = {
    accessors: Accessor[];
    asset: Asset;
    bufferViews: BufferView[];
    buffers: Buffer[];
    extensionsUsed: [string];
    nodes: Node[];
    scene: number;
    scenes: Scene[];
};

export type Scene = {
    nodes: number[];
};

export type Accessor = {
    bufferView: number;
    byteOffset: number;
    componentType: number;
    count: number;
    type: string;
};

export type Asset = {
    copyright: string;
    generator: string;
    version: string;
};

export type Buffer = {
    byteLength: number;
};

export type BufferView = {
    buffer: number;
    byteLength: number;
    byteOffset: number;
    byteStride: number;
};

export type Node = {
    name: string;
    extensions: {EXT_mesh_gpu_instancing : {attributes: {[key: string]: number } } | undefined};
};

export enum RevealGeometryCollectionType {
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
    InstanceMesh
  };

export type GlbHeaderData = {
    gltfHeaderByteSize: 12;
    chunkHeaderByteSize: 8;

    jsonChunkByteLength: number;
};

export type GeometryProcessingPayload = {
    geometryType: RevealGeometryCollectionType; 
    bufferGeometry: THREE.InstancedBufferGeometry | THREE.BufferGeometry;
    instancingExtension: { 
        attributes: { 
            [key: string]: number; 
        }; 
    }; 
    json: GltfJson;
    glbHeaderData: GlbHeaderData;
    data: ArrayBuffer;
};

export type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Uint8ClampedArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;