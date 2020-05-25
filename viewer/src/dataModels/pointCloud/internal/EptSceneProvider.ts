/*!
 * Copyright 2020 Cognite AS
 */

export interface EptSceneProvider {
  getEptScene(blobUrl: string): Promise<any>;
}
