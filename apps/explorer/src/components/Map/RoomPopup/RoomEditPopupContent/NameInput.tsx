import { Input } from '@cognite/cogs.js';
import { ChangeEvent, useContext } from 'react';

import { EditOptionItem } from '../../Popup/elements';
import { RoomContext } from '../RoomPopupProvider';

export const NameInput: React.FC = () => {
  const { formState, updateFields } = useContext(RoomContext);
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
