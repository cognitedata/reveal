import { useEquipmentElements, useStorageState } from '../../hooks';
import { DataElement } from '..';

export const EquipmentPanel = () => {
  const { scanner } = useStorageState();

  const list = useEquipmentElements(scanner.data);

  return (
    <>
      {list?.map((item) => (
        <DataElement key={item.scannerKey} {...item} />
      ))}
    </>
  );
};
