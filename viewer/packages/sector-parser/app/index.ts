/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Vector3 } from 'three';

import matCapTextureImage from '../../../core/src/datamodels/cad/rendering/matCapTextureData';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { sectorShaders } from '../../../core/src/datamodels/cad/rendering/shaders';
import GltfSectorLoader, { PrimitiveCollection } from '../src/GltfInstancingPlugin';

const matCapTexture = new THREE.Texture(matCapTextureImage);
matCapTexture.needsUpdate = true;
init();

function init() {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const grid = new THREE.GridHelper(30, 40);
  grid.position.set(14, -1, -14);
  scene.add(grid);

  const cadFromCdfToThreeMatrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
  const group = new THREE.Group();
  group.applyMatrix4(cadFromCdfToThreeMatrix);
  scene.add(group);

  const materialMap: Map<PrimitiveCollection, THREE.ShaderMaterial> = new Map([
    [PrimitiveCollection.BoxCollection, createBoxMaterial()],
    [PrimitiveCollection.CircleCollection, createCircleMaterial()],
    [PrimitiveCollection.ConeCollection, createConeMaterial()],
    [PrimitiveCollection.EccentricConeCollection, createEccentricConeMaterial()],
    [PrimitiveCollection.EllipsoidSegmentCollection, createEllipsoidSegmentMaterial()],
    [PrimitiveCollection.GeneralCylinderCollection, createGeneralCylinderMaterial()],
    [PrimitiveCollection.GeneralRingCollection, createGeneralRingMaterial()],
    [PrimitiveCollection.QuadCollection, createQuadMaterial()],
    [PrimitiveCollection.TorusSegmentCollection, createTorusSegmentMaterial()],
    [PrimitiveCollection.TrapeziumCollection, createTrapeziumMaterial()],
    [PrimitiveCollection.NutCollection, createNutMaterial()]
  ]);

  const loader = new GltfSectorLoader();

  fetch('test-models/0.glb').then(async file => {
    const arrayBuffer = await (await file.blob()).arrayBuffer();
    loader.parseSector(arrayBuffer).then(geometries => {
      geometries.forEach(result => {
        const material = materialMap.get(result[0])!;
        const mesh = new THREE.Mesh(result[1], material);
        mesh.frustumCulled = false;
        mesh.onBeforeRender = () => {
          const inverseModelMatrix: THREE.Matrix4 = material.uniforms.inverseModelMatrix.value;
          inverseModelMatrix.copy(mesh.matrixWorld).invert();
        };
        group.add(mesh);
      });
    });
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  const target = new THREE.Vector3(10, 0, 0);
  camera.position.add(new Vector3(10, 20, 20));
  controls.target.copy(target);
  controls.update();

  document.body.appendChild(renderer.domElement);

  renderer.setAnimationLoop(_ => {
    controls.update();
    renderer.render(scene, camera);
  });
}

function createGeneralCylinderMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (General cylinder)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.generalCylinderPrimitive.vertex,
    fragmentShader: sectorShaders.generalCylinderPrimitive.fragment,
    side: THREE.DoubleSide
  });
}

function createBoxMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Box)',
    clipping: false,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.boxPrimitive.vertex,
    fragmentShader: sectorShaders.boxPrimitive.fragment,
    side: THREE.DoubleSide,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    }
  });
}

function createCircleMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Circle)',
    clipping: false,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.circlePrimitive.vertex,
    fragmentShader: sectorShaders.circlePrimitive.fragment,
    side: THREE.DoubleSide,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    }
  });
}

function createConeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Cone)',
    clipping: false,
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.conePrimitive.vertex,
    fragmentShader: sectorShaders.conePrimitive.fragment,
    side: THREE.DoubleSide,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    }
  });
}

function createEccentricConeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Eccentric cone)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.eccentricConePrimitive.vertex,
    fragmentShader: sectorShaders.eccentricConePrimitive.fragment,
    side: THREE.DoubleSide
  });
}

function createGeneralRingMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (General rings)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.generalRingPrimitive.vertex,
    fragmentShader: sectorShaders.generalRingPrimitive.fragment,
    side: THREE.DoubleSide
  });
}

function createEllipsoidSegmentMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Ellipsoid segments)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.ellipsoidSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.ellipsoidSegmentPrimitive.fragment,
    side: THREE.DoubleSide
  });
}

function createNutMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Nuts)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    vertexShader: sectorShaders.nutPrimitive.vertex,
    fragmentShader: sectorShaders.nutPrimitive.fragment,
    side: THREE.DoubleSide
  });
}

function createQuadMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Quads)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    vertexShader: sectorShaders.quadPrimitive.vertex,
    fragmentShader: sectorShaders.quadPrimitive.fragment,
    side: THREE.DoubleSide
  });
}

function createTrapeziumMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Trapezium)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    extensions: { fragDepth: true },
    vertexShader: sectorShaders.trapeziumPrimitive.vertex,
    fragmentShader: sectorShaders.trapeziumPrimitive.fragment,
    side: THREE.DoubleSide
  });
}

function createTorusSegmentMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: 'Primitives (Torus segment)',
    clipping: false,
    uniforms: {
      renderMode: { value: 1 },
      inverseModelMatrix: {
        value: new THREE.Matrix4()
      },
      matCapTexture: { value: matCapTexture },
      treeIndexTextureSize: { value: new THREE.Vector2(1, 1) },
      colorDataTexture: { value: new THREE.DataTexture(new Uint8ClampedArray([0, 0, 0, 1]), 1, 1) }
    },
    extensions: {
      fragDepth: true,
      derivatives: true
    },
    vertexShader: sectorShaders.torusSegmentPrimitive.vertex,
    fragmentShader: sectorShaders.torusSegmentPrimitive.fragment,
    side: THREE.DoubleSide
  });
}
