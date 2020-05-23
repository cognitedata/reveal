/*!
 * Copyright 2020 Cognite AS
 */

export interface CadSceneProvider {
  getCadScene(blobUrl: string): Promise<any>;
}
