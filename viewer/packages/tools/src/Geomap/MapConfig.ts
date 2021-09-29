/*!
 * Copyright 2021 Cognite AS
 */

/**
 * Supported map Providers Bing, Here & Mapbox
 */
export enum MapProviders {
  BingMap = 'BingMap',
  HereMap = 'HereMap',
  MapboxMap = 'MapboxMap',
  OpenStreetMap = 'OpenStreetMap'
}

/**
 * Map data for Mapbox
 */
export enum MapboxMode {
  /**
   * Access the map data using a map style. For details see https://docs.mapbox.com/api/maps/styles/
   */
  Style = 100,
  /**
   * Access the map data using a map id or Tileset id. For details see https://docs.mapbox.com/help/glossary/tileset-id/
   */
  Map_Id = 101
}

/**
 * Mapbox Map Style, these are pre-defined styles using map/tileset id, created in Mapbox Studio style editor.
 * This is used when MapboxMode.Style is used for mode.
 */
export enum MapboxStyle {
  Streets = 'mapbox/streets-v10',
  Outdoor = 'mapbox/outdoors-v10',
  Light = 'mapbox/light-v9',
  Dark = 'mapbox/dark-v9',
  Satellite = 'mapbox/satellite-v9',
  Satellite_Streets = 'mapbox/satellite-streets-v10',
  Navigation_Day = 'mapbox/navigation-preview-day-v4',
  Navigation_Night = 'mapbox/navigation-preview-night-v4',
  Navigation_Guide_Day = 'mapbox/navigation-guidance-day-v4',
  Navigation_Guide_Night = 'mapbox/navigation-guidance-night-v4'
}

/**
 * A map/tileset ID is a unique identifier given to every tileset, used when MapboxMode.Map_Id is choosen for mode.
 */
export enum MapboxId {
  Streets = 'mapbox.mapbox-streets-v7',
  Satellite = 'mapbox.satellite',
  Terrain = 'mapbox.mapbox-terrain-v2',
  Traffic = 'mapbox.mapbox-traffic-v1',
  TerrainRGB = 'mapbox.terrain-rgb'
}

/**
 * Mapbox Map image tile format
 */
export enum MapboxImageFormat {
  PNG = 'png',
  PNG32 = 'png32',
  PNG64 = 'png64',
  PNG128 = 'png128',
  PNG256 = 'png256',
  JPG70 = 'jpg70',
  JPG80 = 'jpg80',
  JPG90 = 'jpg90',
  PNGRAW = 'pngraw'
}

/**
 * Bing Map View (aerial, road, bird's eye view of the map)
 */
export enum BingMapType {
  Aerial = 'a',
  Road = 'r',
  Aerial_Labels = 'h',
  Oblique = 'o',
  Oblique_Labels = 'b'
}

/**
 * Bing Map Tile Image formats
 */
export enum BingMapImageFormat {
  GIF = 'gif',
  JPEG = 'jpeg',
  PNG = 'png'
}

/**
 * Here Map types
 */
export enum HereMapType {
  Aerial = 'aerial',
  Base = 'base',
  Pano = 'pano',
  Traffic = 'traffic'
}

/**
 * Here Map View Scheme like day, night, satellite, terrain
 */
export enum HereMapScheme {
  Day = 'normal.day',
  Night = 'normal.night',
  Terrain = 'terrain.day',
  Satellite = 'satellite.day'
}

/**
 * Here Map Tiles Image Format
 */
export enum HereMapImageFormat {
  PNG = 'png',
  PNG8 = 'png8',
  JPG = 'jpg'
}

export type BingMapConfig = {
  provider: MapProviders.BingMap;
  /**
   * Bing Map API Key
   */
  APIKey: string;
  /**
   * The type of the map used.
   */
  type?: BingMapType;
};

export type HereMapConfig = {
  provider: MapProviders.HereMap;
  /**
   * Here map API Key
   */
  APIKey: string;
  /**
   * Service application code token.
   */
  appCode?: string;
  /**
   * The type of maps to be used.
   */
  style?: HereMapType;
  /**
   * Specifies the view scheme
   */
  scheme?: string;
  /**
   * Map image tile format
   */
  imageFormat?: HereMapImageFormat;
  /**
   * Returned tile map image size.
   * The following sizes are supported:
   *  - 256
   *  - 512
   *  - 128 (deprecated, although usage is still accepted)
   */
  size?: number;
};

export type OpenStreetMapConfig = {
  provider: MapProviders.OpenStreetMap;
};

export type MapboxConfig = {
  provider: MapProviders.MapboxMap;
  /**
   * Mapbox API Key
   */
  APIKey: string;
  /**
   * Map style or map ID if the mode is set to MAP_ID
   */
  id: string;
  /**
   * Map tile access mode
   *  - MapboxMode.STYLE
   *  - MapboxMode.MAP_ID
   */
  mode?: MapboxMode;
  /**
   * Map image tile format
   */
  tileFormat?: MapboxImageFormat;
  /**
   * Flag to indicate if should use high resolution tiles
   */
  useHDPI?: boolean;
};

/**
 * Maps Configuration of {@link GeomapTool}.
 */
export type MapConfig = {
  /**
   * Latitude, Longitude position
   */
  latlong: LatLongPosition;
} & (BingMapConfig | HereMapConfig | MapboxConfig | OpenStreetMapConfig);

/**
 * Latitude, Longitude position.
 */
export type LatLongPosition = {
  latitude: number;
  longitude: number;
};
