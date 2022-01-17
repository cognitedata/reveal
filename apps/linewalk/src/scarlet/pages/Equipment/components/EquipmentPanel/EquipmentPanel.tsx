import { useStorageState } from 'scarlet/hooks';

import { DataElement } from '..';

export const EquipmentPanel = () => {
  const { equipment } = useStorageState();

  return (
    <>
      {equipment.data?.equipmentElements?.map(({ key, ...item }) => (
        <DataElement key={key} {...item} />
      ))}
    </>
  );
};
