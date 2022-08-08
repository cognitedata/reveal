import React, { useCallback, useState, useEffect } from 'react';
import { useAuthContext } from '@cognite/react-container';
import debounce from 'lodash/debounce';
import {
  DiagramInstanceId,
  DiagramSymbolInstance,
  DocumentMetadata,
} from '@cognite/pid-tools';
import {
  AutoComplete as CogsAutoComplete,
  Button as CogsButton,
  Row,
  Title,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { Asset } from '@cognite/sdk-v5/dist/src/types';

import { CollapseSeperator } from './CollapsableInstanceList';

const multiColName = 'col-2';

const SelectedSymbolInstanceInfo = styled.div`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  .${multiColName} {
    grid-template-columns: 3fr 2fr !important;
    margin-top: 0.5rem;
  }
  .cogs-row {
    gap: 2px !important;
    justify-items: start;
  }
`;

const AutoComplete = styled(CogsAutoComplete)`
  width: 100%;
  height: 28px;
  .cogs-select__control {
    border-radius: 6px 0px 0px 6px;
  }
  .cogs-select__single-value {
    font-size: 13px; // FIX some sort of auto resize
  }
  .cogs-select__option {
    font-size: 11px;
  }
  .cogs-select__menu {
    min-width: 100%;
    width: fit-content;
  }
`;

const AutoCompleteButton = styled(CogsButton)`
  border-radius: 0px 6px 6px 0px;
`;

const AutoCompleteButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

interface Option {
  value: Asset;
  label: string;
}

interface AddAssetControllerProps {
  documentMetadata: DocumentMetadata;
  symbolInstances: DiagramSymbolInstance[];
  setSymbolInstances: (arg: DiagramSymbolInstance[]) => void;
  labelSelection: DiagramInstanceId | null;
}

export const AddAssetController: React.FC<AddAssetControllerProps> = ({
  documentMetadata,
  symbolInstances,
  setSymbolInstances,
  labelSelection,
}) => {
  const [selectedSymbolInstance, setSelectedSymbolInstance] =
    useState<DiagramSymbolInstance>();
  const [labelNames, setLabelNames] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clickedAssetOption, setClickedAssetOption] = useState<Asset>();

  const { client } = useAuthContext();

  useEffect(() => {
    const symbolInstance = symbolInstances.find(
      (symbolInstance) => symbolInstance.id === labelSelection
    );
    setSelectedSymbolInstance(symbolInstance);

    if (!symbolInstance) return;

    const labelNames = symbolInstance.labelIds.map(
      (labelId) => document.getElementById(labelId)!.textContent!
    );
    const formattedAssetName = [documentMetadata.unit]
      .concat(labelNames)
      .join('-');

    onAssetSearchInputChange(formattedAssetName);
    setLabelNames(labelNames);
  }, [labelSelection]);

  const searchInputChangedHandler = useCallback(
    debounce((newValue: string): void => {
      if (newValue === '' && search.length > 1) return;
      setSearch(newValue);
      client?.assets
        .search({
          search: {
            query: newValue,
          },
          limit: 20,
        })
        .then((assets) => setAssets(assets));
    }, 300),
    []
  );

  const onAssetSearchInputChange = (newValue: string) => {
    if (newValue) {
      setSearch(newValue);
      searchInputChangedHandler(newValue);
    }
  };
  const handleClickedOption = (result: Option): void => {
    onAssetSearchInputChange(result.label);
    setClickedAssetOption(result.value);
  };

  const updateSymbolInstance = (): void => {
    const updatedSymbolInstances = [...symbolInstances];
    const toUpdateSymbolInstance = updatedSymbolInstances.find(
      (symbolInstance) => symbolInstance.id === labelSelection
    )!;
    toUpdateSymbolInstance.assetId = clickedAssetOption!.id;
    toUpdateSymbolInstance.assetName = clickedAssetOption!.name;
    setSymbolInstances(updatedSymbolInstances);
  };

  const isDisabled = (): boolean => {
    return (
      labelSelection === null ||
      !assets.some((asset) => asset.name === search) ||
      clickedAssetOption?.id === selectedSymbolInstance?.assetId
    );
  };

  return (
    <div>
      <CollapseSeperator>Selected Symbol Instance</CollapseSeperator>
      {selectedSymbolInstance && (
        <SelectedSymbolInstanceInfo>
          <Row cols={1}>
            <Title level={6}>Symbol Id</Title>
            <span>{labelSelection}</span>
          </Row>
          <Row cols={2} className={multiColName}>
            <Row cols={1}>
              <Title level={6}>Asset id</Title>
              {selectedSymbolInstance?.assetId
                ? selectedSymbolInstance?.assetId
                : 'undefined'}
            </Row>
            <Row cols={1}>
              <Title level={6}>Label name</Title>
              {labelNames.join(' ')}
            </Row>
          </Row>
          <Row cols={1}>
            <Title level={6}>Asset name</Title>
            {selectedSymbolInstance?.assetName
              ? selectedSymbolInstance?.assetName
              : 'undefined'}
          </Row>
        </SelectedSymbolInstanceInfo>
      )}
      <AutoCompleteButtonContainer>
        <AutoComplete
          placeholder="Search for Assets"
          value={selectedSymbolInstance ? { value: search, label: search } : ''}
          options={
            selectedSymbolInstance &&
            assets.map((asset: Asset) => ({
              value: asset,
              label: asset.name,
            }))
          }
          handleInputChange={onAssetSearchInputChange}
          onChange={handleClickedOption}
          menuPlacement="top"
          maxMenuHeight={500}
        />
        <AutoCompleteButton
          type="primary"
          onClick={updateSymbolInstance}
          disabled={isDisabled()}
        >
          Add
        </AutoCompleteButton>
      </AutoCompleteButtonContainer>
    </div>
  );
};
