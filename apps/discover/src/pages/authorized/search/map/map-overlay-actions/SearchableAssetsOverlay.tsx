import * as React from 'react';

import { MapFeature } from '@cognite/react-map';

import { MapDataSource } from 'modules/map/types';

import { useLayers } from '../hooks/useLayers';
import { useSearchableConfig } from '../hooks/useSearchableConfig';

import { SearchableAssets } from './SearchableAssets';

interface Props {
  sources: MapDataSource[];
  onQuickSearchSelection: (selection: MapFeature) => void;
}
export const SearchableAssetsOverlay: React.FC<Props> = ({
  sources,
  onQuickSearchSelection,
}) => {
  const { allLayers } = useLayers();
  const { layers: searchableAssets, title: searchableTitle } =
    useSearchableConfig(allLayers, sources);

  return (
    <>
      {searchableTitle && (
        <SearchableAssets
          onSelect={onQuickSearchSelection}
          items={searchableAssets}
          placeholder={searchableTitle}
        />
      )}
    </>
  );
};
