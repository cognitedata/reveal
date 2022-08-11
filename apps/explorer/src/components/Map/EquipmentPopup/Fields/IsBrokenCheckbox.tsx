import { Body, Checkbox } from '@cognite/cogs.js';
import { useRecoilState } from 'recoil';
import { equipmentIsBrokenAtom } from 'recoil/equipmentPopup/equipmentPopupAtoms';

export const IsBrokenCheckbox: React.FC = () => {
  const [isBroken, setIsBroken] = useRecoilState(equipmentIsBrokenAtom);
  const handleChange = (nextState: boolean) => setIsBroken(nextState);

  return (
    <>
      <Body strong level={2}>
        Broken
      </Body>
      <Checkbox
        indeterminate
        name="broken-equipment-checkbox"
        checked={isBroken}
        onChange={handleChange}
      />
    </>
  );
};
