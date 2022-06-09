import React from 'react';
import styled from 'styled-components';

import { Radio, RadioChangeEvent } from 'antd';

import { DataSet } from '@cognite/sdk';
import { getScopeLabel, getCapabilityScopes } from './utils';
import { RESOURCE_SELECTOR_LIMIT } from 'utils/constants';

import SecurityCategoriesSelector from './SecurityCategoriesSelector';
import PartitionSelector from './PartitionSelector';
import ResourcesSelector from './ResourcesSelector';
import RawSelector from './RawSelector';
import { useTranslation } from 'common/i18n';

const SelectorContainer = styled.div`
  margin-top: 10px;
`;

type Props = {
  capabilityKey: string;
  value?: any;
  onChange: (_: any) => void;
};
const ScopesSelector = ({ capabilityKey, value, onChange }: Props) => {
  const { t } = useTranslation();
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
    case 'extractionPipelineScope':
      selectedResources = value.extractionPipelineScope.ids;
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

  selectedResources = Array.isArray(selectedResources)
    ? selectedResources.map((r) =>
        typeof r === 'string' ? parseInt(r, 10) : r
      )
    : selectedResources;

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
      case 'extractionPipelineScope':
        scope = { extractionPipelineScope: { ids: [] } };
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
      case 'extractionPipelineScope':
        scope = { extractionPipelineScope: { ids: newSelectedResources } };
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

  function getScopesSelector() {
    switch (selectedScope) {
      case 'assetIdScope':
        return (
          <ResourcesSelector
            type="assets"
            value={selectedResources}
            onChange={onChangeResource}
          />
        );
      case 'datasetScope':
        return (
          <ResourcesSelector
            type="datasets"
            value={selectedResources}
            onChange={onChangeResource}
            useSearchApi={false}
            limit={RESOURCE_SELECTOR_LIMIT}
            itemFilter={(ds: DataSet) => ds.metadata?.archived !== 'true'}
            downloadAll
          />
        );
      case 'assetRootIdScope':
        return (
          <ResourcesSelector
            type="assets"
            filter={{ root: true }}
            value={selectedResources}
            onChange={onChangeResource}
          />
        );
      case 'partition':
        return (
          <SelectorContainer>
            <PartitionSelector
              value={selectedResources}
              onChange={onChangeResource}
            />
          </SelectorContainer>
        );
      case 'tableScope':
        return (
          <SelectorContainer>
            <RawSelector
              value={selectedResources}
              onChange={onChangeResource}
            />
          </SelectorContainer>
        );
      case 'extractionPipelineScope':
        return (
          <ResourcesSelector
            type="extpipes"
            value={selectedResources}
            onChange={onChangeResource}
            useSearchApi={false}
            limit={RESOURCE_SELECTOR_LIMIT}
            downloadAll
          />
        );
      case 'idScope':
      case 'idscope':
        switch (capabilityKey) {
          case 'extractionPipelinesAcl':
            return (
              <ResourcesSelector
                type="extpipes"
                value={selectedResources}
                onChange={onChangeResource}
                useSearchApi={false}
                limit={RESOURCE_SELECTOR_LIMIT}
                downloadAll
              />
            );
          case 'securityCategoriesAcl':
            return (
              <SecurityCategoriesSelector
                value={selectedResources}
                onChange={onChangeResource}
              />
            );
          case 'timeSeriesAcl':
            return (
              <ResourcesSelector
                type="timeseries"
                value={selectedResources}
                onChange={onChangeResource}
              />
            );
          default:
            return (
              <ResourcesSelector
                type="datasets"
                value={selectedResources}
                onChange={onChangeResource}
                useSearchApi={false}
                limit={RESOURCE_SELECTOR_LIMIT}
                itemFilter={(ds: DataSet) => ds.metadata?.archived !== 'true'}
                downloadAll
              />
            );
        }
    }
    return null;
  }

  return (
    <div>
      <Radio.Group value={selectedScope} onChange={(e) => onSelectScope(e)}>
        {scopes.map((scope) => (
          <Radio value={scope} key={scope}>
            {getScopeLabel(scope, capabilityKey, t)}
          </Radio>
        ))}
      </Radio.Group>
      <SelectorContainer>{getScopesSelector()}</SelectorContainer>
    </div>
  );
};
export default ScopesSelector;
