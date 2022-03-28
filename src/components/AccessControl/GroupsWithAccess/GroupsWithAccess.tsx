import Table from 'antd/lib/table';
import Tag from 'antd/lib/tag';

import { Group, SingleCogniteCapability } from '@cognite/sdk';
import {
  isCapScopedOnDataSets,
  isGroupScopedOnDataSets,
  getContainer,
} from 'utils/shared';

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
  const { dataSetId, groups } = props;

  const resourceColumns = [
    {
      title: 'Group',
      key: 'group',
      dataIndex: 'groupName',
    },
    {
      title: 'Capabilities',
      key: 'capabilities',
      render: (row: GroupWithResources) => (
        <div>
          {row.capabilities &&
            row.capabilities.length &&
            row.capabilities.map((capItem: CapShape) =>
              capItem.actions.map((action: string) => {
                const capLabel = `${capItem.resource}:${action.toLowerCase()}`;
                const key = `${row.groupId}${capLabel}`;
                return <Tag key={key}>{capLabel}</Tag>;
              })
            )}
        </div>
      ),
    },
  ];

  const groupsWithAccess = groups.filter((group) =>
    isGroupScopedOnDataSets(group as any, dataSetId)
  );

  const dataSource = groupsWithAccess.map((group) =>
    createGroupScopedOnDataSets(group, dataSetId)
  );

  return (
    <Table
      style={{ marginTop: '20px' }}
      columns={resourceColumns}
      dataSource={dataSource}
      rowKey="groupId"
      getPopupContainer={getContainer}
    />
  );
};

export default GroupsWithAccess;
