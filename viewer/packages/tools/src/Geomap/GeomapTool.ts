/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { LatLongPosition, MapConfig } from './MapConfig';
import { Geomap } from './Geomap';
/**
 * The `GeomapTool` is a geolocation for the models and allow the user to place them on the maps.
 */
export class GeomapTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _maps: Geomap;

  constructor(viewer: Cognite3DViewer, config: MapConfig) {
    super();

    this._viewer = viewer;
    this._maps = new Geomap(this._viewer, config);
  }

  /**
   * Converts Latitude & Longitude into Vector2 World coordinates on the Map
   * @param latLong Latitude & Longitude
   */
  public latLongToWorldCoordinates( latLong: LatLongPosition) {
    this._maps.latLongToWorldCoordinates(latLong);
  }

  public dispose(): void {
    super.dispose();
    this._maps.dispose();
  }
}
