import { useAppState } from 'scarlet/hooks';

import { DataElementList } from '..';

import { sortedKeys } from './utils';

export const EquipmentPanel = () => {
  const { equipment } = useAppState();

  return (
    <DataElementList
      data={equipment.data?.equipmentElements}
      loading={equipment.loading}
      skeletonAmount={20}
      sortedKeys={sortedKeys}
    />
  );
};
