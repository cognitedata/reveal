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
