import React from 'react';
import styled from 'styled-components';

import { Radio, RadioChangeEvent } from 'antd';

import { getScopeLabel, getCapabilityScopes } from './utils';

import SecurityCategoriesSelector from './SecurityCategoriesSelector';
import PartitionSelector from './PartitionSelector';
import ResourcesSelector from './ResourcesSelector';
import RawSelector from './RawSelector';

const SelectorContainer = styled.div`
  margin-top: 10px;
`;

type Props = {
  capabilityKey: string;
  value?: any;
  onChange: (_: any) => void;
};
const ScopesSelector = ({ capabilityKey, value, onChange }: Props) => {
  const scopes = getCapabilityScopes(capabilityKey);

  const selectedScope = Object.keys(value || {})?.[0] || 'all';
  let selectedResources: number[] = [];

  switch (selectedScope) {
    case 'assetIdScope':
      selectedResources = value.assetIdScope.subtreeIds;
      break;
    case 'assetRootIdScope':
      selectedResources = value.assetRootIdScope.rootIds;
      break;
    case 'idscope':
      selectedResources = value.idscope.ids;
      break;
    case 'idScope':
      selectedResources = value.idScope.ids;
      break;
    case 'tableScope':
      selectedResources = value.tableScope;
      break;
    case 'datasetScope':
      selectedResources = value.datasetScope.ids;
      break;
    case 'partition':
      selectedResources = value.partition.partitionIds;
      break;
    default:
      break;
  }

  selectedResources = selectedResources?.map(r =>
    typeof r === 'string' ? parseInt(r, 10) : r
  );

  const onSelectScope = (e: RadioChangeEvent) => {
    const newSelectedScope = e.target.value;
    let scope;
    switch (newSelectedScope) {
      case 'all':
        scope = { all: {} };
        break;
      case 'currentuserscope':
        scope = { currentuserscope: {} };
        break;
      case 'assetIdScope':
        scope = { assetIdScope: { subtreeIds: [] } };
        break;
      case 'assetRootIdScope':
        scope = { assetRootIdScope: { rootIds: [] } };
        break;
      case 'idscope':
        scope = { idscope: { ids: [] } };
        break;
      case 'idScope':
        scope = { idScope: { ids: [] } };
        break;
      case 'datasetScope':
        scope = { datasetScope: { ids: [] } };
        break;
      case 'tableScope':
        scope = { tableScope: {} };
        break;
      case 'partition':
        scope = { partition: { partitionIds: [] } };
        break;
      default:
        break;
    }
    onChange(scope);
  };

  const onChangeResource = (newSelectedResources: number[]) => {
    let scope = value;
    switch (selectedScope) {
      case 'assetIdScope':
        scope = { assetIdScope: { subtreeIds: newSelectedResources } };
        break;
      case 'assetRootIdScope':
        scope = { assetRootIdScope: { rootIds: newSelectedResources } };
        break;
      case 'idscope':
        scope = { idscope: { ids: newSelectedResources } };
        break;
      case 'idScope':
        scope = { idScope: { ids: newSelectedResources } };
        break;
      case 'datasetScope':
        scope = { datasetScope: { ids: newSelectedResources } };
        break;
      case 'tableScope':
        scope = { tableScope: newSelectedResources };
        break;
      case 'securitycategories':
        scope = { idscope: { ids: newSelectedResources } };
        break;
      case 'partition':
        scope = { partition: { partitionIds: newSelectedResources } };
        break;
      default:
        break;
    }
    onChange(scope);
  };

  const getScopesSelector = () => {
    return (
      <>
        <Radio.Group value={selectedScope} onChange={e => onSelectScope(e)}>
          {scopes.map(scope => (
            <Radio value={scope} key={scope}>
              {getScopeLabel(scope, capabilityKey)}
            </Radio>
          ))}
        </Radio.Group>
        {selectedScope === 'assetIdScope' && (
          <SelectorContainer>
            <ResourcesSelector
              type="assets"
              value={selectedResources}
              onChange={onChangeResource}
            />
          </SelectorContainer>
        )}
        {selectedScope === 'idScope' && (
          <SelectorContainer>
            <ResourcesSelector
              type="datasets"
              value={selectedResources}
              onChange={onChangeResource}
              useSearchApi={false}
              prefetchItems={1000}
            />
          </SelectorContainer>
        )}
        {selectedScope === 'datasetScope' && (
          <SelectorContainer>
            <ResourcesSelector
              type="datasets"
              value={selectedResources}
              onChange={onChangeResource}
              useSearchApi={false}
              prefetchItems={1000}
            />
          </SelectorContainer>
        )}
        {selectedScope === 'idscope' &&
          capabilityKey === 'securityCategoriesAcl' && (
            <SelectorContainer>
              <SecurityCategoriesSelector
                value={selectedResources}
                onChange={onChangeResource}
              />
            </SelectorContainer>
          )}
        {selectedScope === 'assetRootIdScope' && (
          <SelectorContainer>
            <ResourcesSelector
              type="assets"
              body={{ filter: { root: true } }}
              value={selectedResources}
              onChange={onChangeResource}
            />
          </SelectorContainer>
        )}
        {selectedScope === 'idscope' && capabilityKey === 'timeSeriesAcl' && (
          <SelectorContainer>
            <ResourcesSelector
              type="timeseries"
              value={selectedResources}
              onChange={onChangeResource}
            />
          </SelectorContainer>
        )}
        {selectedScope === 'tableScope' && (
          <SelectorContainer>
            <RawSelector
              value={selectedResources}
              onChange={onChangeResource}
            />
          </SelectorContainer>
        )}
        {selectedScope === 'partition' && (
          <SelectorContainer>
            <PartitionSelector
              value={selectedResources}
              onChange={onChangeResource}
            />
          </SelectorContainer>
        )}
      </>
    );
  };

  return <div>{getScopesSelector()}</div>;
};
export default ScopesSelector;
