import type { AnyLayer, CustomLayerInterface } from 'maplibre-gl';

// which layer to show this before
// used for layer display ordering
type Orderable = { weight?: number };

export type MapLayer = (AnyLayer | CustomLayerInterface) & {
  source: string;
} & Orderable;

// @deprecated - we will use SelectableLayer instead
export type Layer = {
  name: string;
  color: string;
  defaultOn: boolean;

  alwaysOn?: boolean;
  searchable?: string;
  searchInputText?: string;
  asset?: {
    filter?: [string, string | string[]];
    displayField: string;
  };
} & Orderable;

export type Layers = Record<string, Layer>;

// rename to LayerConfig
export type SelectableLayer = {
  id: string;
  name: string;
  selected: boolean;
  layers: MapLayer[];

  // @depreacted - use project config
  remote?: string;
  // @depreacted - use project config
  local?: string;

  // this needs to be moved to the implementing type, not in the base:
  asset?: {
    filter?: [string, string | string[]];
    displayField?: string;
  };

  featureTypeId?: string; // a link to geospatial
  color?: string;
  defaultOn?: boolean;
  alwaysOn?: boolean;
  searchable?: string;
  searchInputText?: string;
  disabled?: boolean;
} & Orderable;
