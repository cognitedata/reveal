import { Checkbox, Title } from '@cognite/cogs.js';
import { useRecoilState } from 'recoil';
import { roomIsBookableAtom } from 'recoil/roomPopup/roomPopupAtoms';

export const IsBookableCheckbox = () => {
  const [isBookable, setIsBookable] = useRecoilState(roomIsBookableAtom);
  const handleChange = (nextState: boolean) => setIsBookable(nextState);

  return (
    <>
      <Title level={6}>Bookable </Title>
      <Checkbox
        indeterminate
        name="broken-equipment-checkbox"
        checked={isBookable}
        onChange={handleChange}
      />
    </>
  );
};
