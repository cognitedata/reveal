import { Input } from '@cognite/cogs.js';
import { ChangeEvent, useContext } from 'react';

import { EditOptionItem } from '../../Popup/elements';
import { EquipmentContext } from '../EquipmentPopupProvider';

export const NameInput: React.FC = () => {
  const { formState, updateFields } = useContext(EquipmentContext);
  const { name } = formState;
  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    updateFields({ name: event.target.value });

  return (
    <EditOptionItem>
      Name
      <Input value={name} onChange={handleChange} />
    </EditOptionItem>
  );
};
