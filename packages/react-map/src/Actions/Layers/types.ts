import { SelectableLayer } from '../../layers';

export type Layers = (SelectableLayer | false)[];
export type LayerOnChange = (layer: SelectableLayer) => void;
