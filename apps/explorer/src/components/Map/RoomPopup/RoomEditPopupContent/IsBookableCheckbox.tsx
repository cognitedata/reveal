import { Checkbox } from '@cognite/cogs.js';
import { useContext } from 'react';

import { EditOptionItem } from '../../Popup/elements';
import { RoomContext } from '../RoomPopupProvider';

export const IsBookableCheckbox = () => {
  const { formState, updateFields } = useContext(RoomContext);
  const { isBookable } = formState;
  const handleChange = (nextState: boolean) =>
    updateFields({ isBookable: nextState });

  return (
    <EditOptionItem>
      Bookable
      <Checkbox
        indeterminate
        name="broken-equipment-checkbox"
        checked={isBookable}
        onChange={handleChange}
      />
    </EditOptionItem>
  );
};
