import { SelectableLayer } from './types';

export function getShowingLayers(
  selectableLayers: SelectableLayer[],
  selectedLayers: string[]
) {
  const showingLayers = selectableLayers.map((layer) => {
    return {
      ...layer,
      selected: selectedLayers.includes(layer.id),
    };
  });

  return showingLayers;
}
