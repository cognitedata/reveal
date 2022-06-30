import { Checkbox } from '@cognite/cogs.js';
import { useContext } from 'react';

import { EditOptionItem } from '../../Popup/elements';
import { EquipmentContext } from '../EquipmentPopupProvider';

export const IsBrokenCheckbox: React.FC = () => {
  const { formState, updateFields } = useContext(EquipmentContext);
  const { isBroken } = formState;
  const handleChange = (nextState: boolean) =>
    updateFields({ isBroken: nextState });

  return (
    <EditOptionItem>
      Broken
      <Checkbox
        indeterminate
        name="broken-equipment-checkbox"
        checked={isBroken}
        onChange={handleChange}
      />
    </EditOptionItem>
  );
};
