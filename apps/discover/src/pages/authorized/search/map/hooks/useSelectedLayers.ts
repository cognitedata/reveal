import { useMemo } from 'react';

// import { useMap } from 'modules/map/selectors';
import { SelectableLayer } from 'modules/map/types';

export const useSelectedLayers = (
  selectableLayers: SelectableLayer[],
  selected: string[]
) => {
  // const { selectedLayers } = useMap();

  // const { selectedLayers } = useMap();

  return useMemo(() => {
    return selectableLayers.map((layer) => {
      return { ...layer, selected: selected.includes(layer.id) };
    });
  }, [selectableLayers, selected]);
};
