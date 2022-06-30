import { Input } from '@cognite/cogs.js';
import { ChangeEvent, useContext } from 'react';

import { EditOptionItem } from '../../Popup/elements';
import { RoomContext } from '../RoomPopupProvider';

export const DescriptionInput: React.FC = () => {
  const { formState, updateFields } = useContext(RoomContext);
  const { description } = formState;
  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    updateFields({ description: event.target.value });

  return (
    <EditOptionItem>
      Description
      <Input value={description} onChange={handleChange} />
    </EditOptionItem>
  );
};
