import { Button } from '@cognite/cogs.js';
import { FileInfo, Timeseries } from '@cognite/sdk';
import IconContainer from 'components/icons';
import Loading from 'components/utils/Loading';
import useFullScreenView from 'hooks/useFullScreenView';
import { useGlobalSearchQuery } from 'hooks/useQuery/useGlobalSearchQuery';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ResourceType, SdkResourceType } from 'types/core';
import { mapResourceTypeToLabel } from 'utils/resourceTypes';

import SearchResult from '../SearchResult';

import {
  GlobalSearchMenu,
  ResourceTypeContainer,
  ResultContainer,
} from './elements';

export type GlobalSearchProps = {
  query?: string;
  onResultSelected?: () => void;
};

type ResourceTypeSelectorProps = {
  selectedType?: ResourceType;
  onTypeSelected: (type: ResourceType | undefined) => void;
};

const defaultSearchResourceTypes: SdkResourceType[] = [
  'timeseries',
  'assets',
  'files',
];

const ResourceTypeSelector = ({
  selectedType,
  onTypeSelected,
}: ResourceTypeSelectorProps) => {
  return (
    <ResourceTypeContainer>
      {defaultSearchResourceTypes.map((type) => (
        <Button
          key={type}
          type="tertiary"
          size="small"
          toggled={selectedType === type}
          onClick={() =>
            onTypeSelected(selectedType === type ? undefined : type)
          }
        >
          <IconContainer
            type={`Resource.${type}`}
            className="resource-type-selector--icon"
          />
          {mapResourceTypeToLabel(type)}
        </Button>
      ))}
    </ResourceTypeContainer>
  );
};

const GlobalSearch = ({ query = '', onResultSelected }: GlobalSearchProps) => {
  const history = useHistory();
  const [selectedType, setSelectedType] = useState<ResourceType | undefined>();

  const { data: results, isLoading } = useGlobalSearchQuery(
    query,
    selectedType as SdkResourceType
  );

  const { openTimeSeriesView, openDocumentView } = useFullScreenView();

  const handleAssetSelected = (assetId: number) => {
    history.push(`/explore/${assetId}/detail`);
    if (onResultSelected) {
      onResultSelected();
    }
  };

  const handleTimeSeriesSelected = (timeSeries: Timeseries) => {
    openTimeSeriesView(timeSeries.id);
    if (onResultSelected) {
      onResultSelected();
    }
  };

  const handleFileSelected = (file: FileInfo) => {
    openDocumentView(file.id);
    if (onResultSelected) {
      onResultSelected();
    }
  };

  return (
    <GlobalSearchMenu>
      <ResourceTypeSelector
        selectedType={selectedType}
        onTypeSelected={setSelectedType}
      />
      {isLoading && <Loading />}
      {!isLoading && (
        <ResultContainer>
          {results?.assets?.map((asset) => (
            <SearchResult
              type="assets"
              key={asset.id}
              name={asset.name}
              description={asset.description}
              onClick={() => handleAssetSelected(asset.id)}
            />
          ))}
          {results?.timeseries?.map((ts) => (
            <SearchResult
              type="timeseries"
              key={ts.id}
              name={ts.name}
              description={ts.description}
              onClick={() => handleTimeSeriesSelected(ts)}
            />
          ))}
          {results?.files?.map((file) => (
            <SearchResult
              type="files"
              key={file.id}
              name={file.name}
              onClick={() => handleFileSelected(file)}
            />
          ))}
        </ResultContainer>
      )}
    </GlobalSearchMenu>
  );
};

export default GlobalSearch;
