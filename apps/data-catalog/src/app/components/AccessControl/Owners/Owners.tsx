import { Group } from '@cognite/sdk';
import { getAllSetOwnersFromGroups } from 'utils/shared';
import { useTranslation } from 'common/i18n';
import { Table } from '@cognite/cogs.js';

interface OwnersProps {
  dataSetId: number;
  groups: Group[];
  isOidcEnv: boolean;
}

const Owners = (props: OwnersProps) => {
  const { dataSetId, groups } = props;
  const { t } = useTranslation();

  const ownerColumns = [
    {
      Header: t('group'),
      id: 'group',
      accessor: 'name',
    },
    {
      Header: t('sourceid'),
      id: 'sourceId',
      accessor: 'sourceId',
    },
  ];

  const ownerGroups = getAllSetOwnersFromGroups(dataSetId, groups);

  const ownersDataSource = ownerGroups.map((ownerGroup: Group) => ({
    groupId: ownerGroup.id,
    name: ownerGroup.name,
    sourceId: ownerGroup?.sourceId,
  }));

  return (
    <div className="resource-table">
      <Table
        css={{ marginTop: '20px' }}
        columns={ownerColumns}
        dataSource={ownersDataSource}
        rowKey={(d) => `${d['groupId']}`}
      />
    </div>
  );
};

export default Owners;
