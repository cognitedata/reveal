/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import * as GEOTHREE from 'geo-three';

import { Cognite3DViewer } from '../../migration';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';

export class GeomapTool extends Cognite3DViewerToolBase {

  private readonly _viewer: Cognite3DViewer;

  private _map: GEOTHREE.MapView;
  private _currentMapProvider: GEOTHREE.MapProvider;
  private _currentHeightMapProvider: GEOTHREE.MapProvider;
  ////Geomap variables/parameters
  private readonly DEV_MAPBOX_API_KEY : string = "pk.eyJ1IjoidGVudG9uZSIsImEiOiJjazBwNHU4eDQwZzE4M2VzOGhibWY5NXo5In0.8xpF1DEcT6Y4000vNhjj1g";
  private readonly OPEN_MAP_TILES_SERVER_MAP : string = "";
  private readonly DEV_HEREMAPS_APP_ID : string = "HqSchC7XT2PA9qCfxzFq";
  private readonly DEV_HEREMAPS_APP_CODE : string = "5rob9QcZ70J-m18Er8-rIA";
  private readonly DEV_BING_API_KEY : string = "AuViYD_FXGfc3dxc0pNa8ZEJxyZyPq1lwOLPCOydV3f0tlEVH-HKMgxZ9ilcRj-T";
  private readonly DEV_MAPTILER_API_KEY : string = "B9bz5tIKxl4beipiIbR0";

  private readonly _providers : { id : string, provider: GEOTHREE.MapProvider }[] = [
    {"id" : "Vector OpenSteet Maps", "provider" : new GEOTHREE.OpenStreetMapsProvider()},
    {"id" : "Vector OpenTile Maps", "provider" : new GEOTHREE.OpenMapTilesProvider(this.OPEN_MAP_TILES_SERVER_MAP)},
    {"id" : "Vector Map Box", "provider" : new GEOTHREE.MapBoxProvider(this.DEV_MAPBOX_API_KEY, "mapbox/streets-v10", GEOTHREE.MapBoxProvider.STYLE)},
    {"id" : "Vector Here Maps", "provider" : new GEOTHREE.HereMapsProvider(this.DEV_HEREMAPS_APP_ID, this.DEV_HEREMAPS_APP_CODE, "base", "normal.day", "jpg", 512)},
    {"id" : "Vector Here Maps Night", "provider" : new GEOTHREE.HereMapsProvider(this.DEV_HEREMAPS_APP_ID, this.DEV_HEREMAPS_APP_CODE, "base", "normal.night", "jpg", 512)},
    {"id" : "Vector Here Maps Terrain", "provider" : new GEOTHREE.HereMapsProvider(this.DEV_HEREMAPS_APP_ID, this.DEV_HEREMAPS_APP_CODE, "aerial", "terrain.day", "jpg", 512)},
    {"id" : "Vector Bing Maps", "provider" : new GEOTHREE.BingMapsProvider(this.DEV_BING_API_KEY, GEOTHREE.BingMapsProvider.ROAD)},
    {"id" : "Vector Map Tiler Basic", "provider" : new GEOTHREE.MapTilerProvider(this.DEV_MAPTILER_API_KEY, "maps", "basic", "png")},
    {"id" : "Vector Map Tiler Outdoor", "provider" : new GEOTHREE.MapTilerProvider(this.DEV_MAPTILER_API_KEY, "maps", "outdoor", "png")},
    {"id" : "Satellite Map Box", "provider" : new GEOTHREE.MapBoxProvider(this.DEV_MAPBOX_API_KEY, "mapbox.satellite", GEOTHREE.MapBoxProvider.MAP_ID, "jpg70", false)},
    {"id" : "Satellite Map Box Labels", "provider" : new GEOTHREE.MapBoxProvider(this.DEV_MAPBOX_API_KEY, "mapbox/satellite-streets-v10", GEOTHREE.MapBoxProvider.STYLE, "jpg70")},
    {"id" : "Satellite Here Maps", "provider" : new GEOTHREE.HereMapsProvider(this.DEV_HEREMAPS_APP_ID, this.DEV_HEREMAPS_APP_CODE, "aerial", "satellite.day", "jpg", 512)},
    {"id" : "Satellite Bing Maps", "provider" : new GEOTHREE.BingMapsProvider(this.DEV_BING_API_KEY, GEOTHREE.BingMapsProvider.AERIAL)},
    {"id" : "Satellite Maps Tiler Labels", "provider" : new GEOTHREE.MapTilerProvider(this.DEV_MAPTILER_API_KEY, "maps", "hybrid", "jpg")},
    {"id" : "Satellite Maps Tiler", "provider" : new GEOTHREE.MapTilerProvider(this.DEV_MAPTILER_API_KEY, "tiles", "satellite", "jpg")},
    {"id" : "Height Map Box", "provider" : new GEOTHREE.MapBoxProvider(this.DEV_MAPBOX_API_KEY, "mapbox.terrain-rgb", GEOTHREE.MapBoxProvider.MAP_ID, "pngraw")},
    {"id" : "Height Map Tiler", "provider" : new GEOTHREE.MapTilerProvider(this.DEV_MAPTILER_API_KEY, "tiles", "terrain-rgb", "png")},
    {"id" : "Debug Height Map Box", "provider" : new GEOTHREE.HeightDebugProvider(new GEOTHREE.MapBoxProvider(this.DEV_MAPBOX_API_KEY, "mapbox.terrain-rgb", GEOTHREE.MapBoxProvider.MAP_ID, "pngraw"))},
    {"id" : "Debug", "provider" : new GEOTHREE.DebugProvider()}
  ];

  private readonly _modes = [
    {"id" : "Planar", "mode" : GEOTHREE.MapView.PLANAR},
    {"id" : "Height", "mode" : GEOTHREE.MapView.HEIGHT},
    {"id" : "Martini", "mode" : GEOTHREE.MapView.MARTINI},
    {"id" : "Height Shader", "mode" : GEOTHREE.MapView.HEIGHT_SHADER},
    {"id" : "Spherical", "mode" : GEOTHREE.MapView.SPHERICAL}
  ];


  constructor(viewer: Cognite3DViewer) {
    super();

    this._viewer = viewer;
    this._currentMapProvider = new GEOTHREE.MapBoxProvider(this.DEV_MAPBOX_API_KEY, "mapbox/satellite-streets-v10", GEOTHREE.MapBoxProvider.STYLE, "jpg70");
    this._currentHeightMapProvider = new GEOTHREE.MapBoxProvider(this.DEV_MAPBOX_API_KEY, "mapbox.terrain-rgb", GEOTHREE.MapBoxProvider.MAP_ID, "pngraw");
    this._map = new GEOTHREE.MapView(GEOTHREE.MapView.PLANAR, this._currentMapProvider, this._currentHeightMapProvider);
    this._viewer.addObject3D(this._map);
    this._map.updateMatrixWorld(true);

    this._viewer.models

    const matrix = this._viewer.models[0].getModelTransformation();
    var coords = GEOTHREE.UnitsUtils.datumsToSpherical(59.90526172119701, 10.626304236857035);
    const newMatrix = matrix.setPosition(new THREE.Vector3(coords.x, 0, -coords.y));
    this._viewer.models[0].setModelTransformation(newMatrix);
    this._viewer.loadCameraFromModel(this._viewer.models[0]);
    this._viewer.cameraControls.setState(new THREE.Vector3(coords.x, 0, -coords.y), new THREE.Vector3(coords.x, 0, -coords.y));
  }

  public SetMapProvider(idx : number) {
    this._map.setProvider(this._providers[idx].provider);
    this._currentMapProvider = this._providers[idx].provider;
  }

  public SetMapHeightProvider(idx : number) {
    this._map.setHeightProvider(this._providers[idx].provider);
    this._currentHeightMapProvider = this._providers[idx].provider;
  }

  public SetMapMode(idx : number) {
    this._viewer.removeObject3D(this._map);
    this._map = new GEOTHREE.MapView(this._modes[idx].mode, this._currentMapProvider, this._currentHeightMapProvider);
    this._viewer.addObject3D(this._map);
  }

  public dispose(): void {
    super.dispose();
  }
}
