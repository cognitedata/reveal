/*!
 * Copyright 2021 Cognite AS
 */

declare module 'glslify' {
  export default function glsl(shader: string): string;
}

declare module '*.css' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

// Maintainer of this package messed up his types
// TODO: Remove this when types are restored
declare module 'geo-three' {
  export * as GEOTHREE from 'geo-three/build/Main';
}
