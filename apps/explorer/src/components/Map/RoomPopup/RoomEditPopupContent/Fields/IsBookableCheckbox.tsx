import { Checkbox } from '@cognite/cogs.js';
import { useRecoilState } from 'recoil';
import { roomIsBookableAtom } from 'recoil/roomPopup/roomPopupAtoms';
import { EditOptionItem } from 'components/Map/Popup/elements';

export const IsBookableCheckbox = () => {
  const [isBookable, setIsBookable] = useRecoilState(roomIsBookableAtom);
  const handleChange = (nextState: boolean) => setIsBookable(nextState);

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
