import { ThreeModule } from './src/Three/ThreeModule';
import { PolylinesNode } from './src/Core/Geometry/PolylinesNode';
import { Polylines } from './src/Core/Geometry/Polylines';
import * as THREE from 'three';
// @ts-ignore
import * as Potree from '@cognite/potree-core';
import CameraControls from 'camera-controls';

CameraControls.install({ THREE });

main();

export function main()
{

  //// Create the module and initialize it
  //const module = new ThreeModule();
  //module.install();

  //const root = module.createRoot();

  //// Add some data
  //if (!root.dataFolder)
    //throw Error("No data folder in the project");

  //for (let i = 0; i < 1; i++)
  //{
    //const node = new PolylinesNode();
    //node.data = Polylines.createByRandom(20, 10);
    //root.dataFolder.addChild(node);
    //node.setVisible(true);
  //}
  //module.initializeWhenPopulated(root);

  //const domElement = module.getDomElement(root);
  //if (domElement)
    //document.body.appendChild(domElement);


  // Potree example
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10000);

  var renderer = new THREE.WebGLRenderer();
  document.body.appendChild(renderer.domElement);

  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
  var cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  var controls = new CameraControls(camera, renderer.domElement);
  camera.position.z = 10;

  var points = new Potree.Group();
  points.setPointBudget(10000000)
  scene.add(points);

  // @ts-ignore
  Potree.loadPointCloud('https://betaserver.icgc.cat/potree12/resources/pointclouds/barcelonasagradafamilia/cloud.js', 'Barcelona', function(data) {
    var pointcloud = data.pointcloud;
    points.add(pointcloud);
  });

  setInterval(() => {
    points.position.set(-431895.739999483, -238.1446784943079, 4583065.15011712)
  }, 500);

  const clock = new THREE.Clock();
  function loop()
  {
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  loop();

  document.body.onresize = function()
  {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

