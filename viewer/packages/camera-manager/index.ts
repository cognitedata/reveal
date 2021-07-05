import {helloPackageA} from "@reveal/package-a";

export const hello = () => {
  helloPackageA();
  console.log('hello from camera-manager')
};

hello();