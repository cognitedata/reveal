import { useMemo } from 'react';

import { Chip, Table } from '@cognite/cogs.js';
import { Group, SingleCogniteCapability } from '@cognite/sdk';

import { useTranslation } from '../../../common/i18n';
import {
  CogsTableCellRenderer,
  isCapScopedOnDataSets,
  isGroupScopedOnDataSets,
} from '../../../utils';

interface GroupsWithAccessProps {
  dataSetId: number;
  groups: Group[];
  isOidcEnv: boolean;
}

interface CapShape {
  resource: string;
  actions: string[];
}
interface GroupWithResources {
  groupName: string;
  groupId: number;
  capabilities: CapShape[];
}

const resourceType = (cap: SingleCogniteCapability) => {
  if ('timeSeriesAcl' in cap) {
    return 'timeseries';
  }
  if ('assetsAcl' in cap) {
    return 'assets';
  }
  if ('filesAcl' in cap) {
    return 'files';
  }
  if ('eventsAcl' in cap) {
    return 'events';
  }
  if ('sequencesAcl' in cap) {
    return 'sequences';
  }
  const aclName = Object.keys(cap).find((keyName) => keyName.includes('Acl'));
  if (aclName) {
    const aclKeyIndex = aclName.indexOf('Acl');
    return aclName.substr(0, aclKeyIndex);
  }
  return 'NONE';
};

const toGroupWithResources = (group: Group) => {
  const groupWithResources: GroupWithResources = {
    groupId: group.id,
    groupName: group.name,
    capabilities: [],
  };
  return groupWithResources;
};

const createGroupScopedOnDataSets = (group: Group, dataSetId: number) => {
  const { capabilities } = group;
  const mappedGroup = toGroupWithResources(group);
  mappedGroup.capabilities =
    capabilities
      ?.filter((cap) => isCapScopedOnDataSets(cap as any, dataSetId))
      .map((cap: any) => {
        const aclName = Object.keys(cap)[0];
        return {
          resource: resourceType(cap),
          actions: cap[aclName].actions,
        };
      }) || [];
  return mappedGroup;
};

const GroupsWithAccess = (props: GroupsWithAccessProps) => {
  const { t } = useTranslation();
  const { dataSetId, groups } = props;

  const resourceColumns = useMemo(
    () => [
      {
        Header: t('group'),
        id: 'group',
        accessor: 'groupName',
        disableSortBy: true,
      },
      {
        Header: t('capabilities'),
        key: 'capabilities',
        disableSortBy: true,
        Cell: ({
          row: { original: record },
        }: CogsTableCellRenderer<GroupWithResources>) => (
          <div>
            {record.capabilities &&
              record.capabilities.length &&
              record.capabilities.map((capItem: CapShape) =>
                capItem.actions.map((action: string) => {
                  const capLabel = `${
                    capItem.resource
                  }:${action.toLowerCase()}`;
                  const key = `${record.groupId}${capLabel}`;
                  return (
                    <Chip
                      type="default"
                      size="x-small"
                      key={key}
                      label={capLabel}
                      css={{ marginRight: '5px' }}
                    />
                  );
                })
              )}
          </div>
        ),
      },
    ],
    []
  );

  const groupsWithAccess = useMemo(
    () =>
      groups.filter((group) =>
        isGroupScopedOnDataSets(group as any, dataSetId)
      ),
    [groups]
  );

  const dataSource = useMemo(
    () =>
      groupsWithAccess.map((group) =>
        createGroupScopedOnDataSets(group, dataSetId)
      ),
    [groupsWithAccess]
  );

  return (
    <div className="resource-table">
      <Table
        css={{ marginTop: '20px' }}
        columns={resourceColumns as any}
        dataSource={dataSource}
        rowKey={(d) => `${d['groupId']}`}
      />
    </div>
  );
};

export default GroupsWithAccess;
