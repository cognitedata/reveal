import {helloPackageA} from "@reveal/package-a";
import * as THREE from 'three';
export const hello = () => {
  helloPackageA();
  console.log('hello from camera-manager')
  console.log(new THREE.Vector3());
};

hello();