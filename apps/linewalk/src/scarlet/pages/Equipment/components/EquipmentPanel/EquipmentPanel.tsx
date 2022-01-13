import { useStorageState } from 'scarlet/hooks';

import { DataElement } from '..';

export const EquipmentPanel = () => {
  const { equipment } = useStorageState();

  return (
    <>
      {equipment.data?.equipmentElements?.map((item) => (
        <DataElement key={item.scannerKey} {...item} />
      ))}
    </>
  );
};
