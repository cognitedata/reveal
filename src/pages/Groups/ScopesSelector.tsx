import React from 'react';
import styled from 'styled-components';

import { Radio, RadioChangeEvent } from 'antd';

import { DataSet } from '@cognite/sdk';
import { getScopeLabel, getCapabilityScopes } from './utils';

import SecurityCategoriesSelector from './SecurityCategoriesSelector';
import PartitionSelector from './PartitionSelector';
import ResourcesSelector from './ResourcesSelector';
import RawSelector from './RawSelector';

import { AclScopeTableIds, CapabilityScope, ScopeNames } from 'types';

const SelectorContainer = styled.div`
  margin-top: 10px;
`;

type Props = {
  capabilityKey: string;
  value?: CapabilityScope;
  onChange: (scope: CapabilityScope) => void;
};

const ScopesSelector = ({ capabilityKey, value, onChange }: Props) => {
  const scopes = getCapabilityScopes(capabilityKey);
  let selectedResources: number[] = [];

  switch (value?.scope) {
    case ScopeNames.AssetIdScope:
      selectedResources = value.assetIdScope.subtreeIds;
      break;
    case ScopeNames.AssetRootIdScope:
      selectedResources = value.assetRootIdScope.rootIds;
      break;
    case ScopeNames.Idscope:
      selectedResources = value.idscope.ids;
      break;
    case ScopeNames.IdScope:
      selectedResources = value.idScope.ids;
      break;
    case ScopeNames.ExtractionPipelineScope:
      selectedResources = value.extractionPipelineScope.ids;
      break;
    case ScopeNames.TableScope:
      (selectedResources as unknown as AclScopeTableIds[ScopeNames.TableScope]) =
        value.tableScope;
      break;
    case ScopeNames.DatasetScope:
      selectedResources = value.datasetScope.ids;
      break;
    case ScopeNames.PartitionScope:
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
    let scope: CapabilityScope;
    switch (newSelectedScope) {
      case ScopeNames.AllScopes:
        scope = { scope: ScopeNames.AllScopes, all: {} };
        break;
      case ScopeNames.CurrentUserScope:
        scope = { scope: ScopeNames.CurrentUserScope, currentuserscope: {} };
        break;
      case ScopeNames.AssetIdScope:
        scope = {
          scope: ScopeNames.AssetIdScope,
          assetIdScope: { subtreeIds: [] },
        };
        break;
      case ScopeNames.AssetRootIdScope:
        scope = {
          scope: ScopeNames.AssetRootIdScope,
          assetRootIdScope: { rootIds: [] },
        };
        break;
      case ScopeNames.Idscope:
        scope = { scope: ScopeNames.Idscope, idscope: { ids: [] } };
        break;
      case ScopeNames.IdScope:
        scope = { scope: ScopeNames.IdScope, idScope: { ids: [] } };
        break;
      case ScopeNames.DatasetScope:
        scope = { scope: ScopeNames.DatasetScope, datasetScope: { ids: [] } };
        break;
      case ScopeNames.ExtractionPipelineScope:
        scope = {
          scope: ScopeNames.ExtractionPipelineScope,
          extractionPipelineScope: { ids: [] },
        };
        break;
      case ScopeNames.TableScope:
        scope = { scope: ScopeNames.TableScope, tableScope: {} };
        break;
      case ScopeNames.PartitionScope:
        scope = {
          scope: ScopeNames.PartitionScope,
          partition: { partitionIds: [] },
        };
        break;
      default:
        throw new Error('Undefined scope!');
    }
    onChange(scope);
  };

  const onChangeResource = (newSelectedResources: number[]) => {
    let scope = value;
    switch (scope?.scope) {
      case ScopeNames.AssetIdScope:
        scope = {
          scope: ScopeNames.AssetIdScope,
          assetIdScope: { subtreeIds: newSelectedResources },
        };
        break;
      case ScopeNames.AssetRootIdScope:
        scope = {
          scope: ScopeNames.AssetRootIdScope,
          assetRootIdScope: { rootIds: newSelectedResources },
        };
        break;
      case ScopeNames.Idscope:
        scope = {
          scope: ScopeNames.Idscope,
          idscope: { ids: newSelectedResources },
        };
        break;
      case ScopeNames.IdScope:
        scope = {
          scope: ScopeNames.IdScope,
          idScope: { ids: newSelectedResources },
        };
        break;
      case ScopeNames.DatasetScope:
        scope = {
          scope: ScopeNames.DatasetScope,
          datasetScope: { ids: newSelectedResources },
        };
        break;
      case ScopeNames.ExtractionPipelineScope:
        scope = {
          scope: ScopeNames.ExtractionPipelineScope,
          extractionPipelineScope: { ids: newSelectedResources },
        };
        break;
      case ScopeNames.TableScope:
        scope = {
          scope: ScopeNames.TableScope,
          tableScope:
            newSelectedResources as unknown as AclScopeTableIds['tableScope'],
        };
        break;
      case ScopeNames.PartitionScope:
        scope = {
          scope: ScopeNames.PartitionScope,
          partition: { partitionIds: newSelectedResources },
        };
        break;
      default:
        throw new Error('Undefined scope!');
    }
    onChange(scope);
  };

  function getScopesSelector() {
    switch (value?.scope) {
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
            limit={1000}
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
            limit={1000}
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
                limit={1000}
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
                limit={1000}
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
      <Radio.Group value={value?.scope} onChange={(e) => onSelectScope(e)}>
        {scopes.map((scope) => (
          <Radio value={scope} key={scope}>
            {getScopeLabel(scope, capabilityKey)}
          </Radio>
        ))}
      </Radio.Group>
      <SelectorContainer>{getScopesSelector()}</SelectorContainer>
    </div>
  );
};

export default ScopesSelector;
