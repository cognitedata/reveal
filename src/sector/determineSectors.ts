/*!
 * Copyright 2019 Cognite AS
 */

export async function determineSectors(camera: THREE.Camera): Promise<Set<number>> {
  const sectors = [];
  for (let i = 0; i < 10; i++) {
    if (i < camera.position.x) {
      sectors.push(i);
    }
  }
  return new Set<number>(sectors);
}
