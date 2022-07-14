import { Checkbox } from '@cognite/cogs.js';
import { useRecoilState } from 'recoil';
import { equipmentIsBrokenAtom } from 'recoil/equipmentPopup/equipmentPopupAtoms';

import { EditOptionItem } from '../../Popup/elements';

export const IsBrokenCheckbox: React.FC = () => {
  const [isBroken, setIsBroken] = useRecoilState(equipmentIsBrokenAtom);
  const handleChange = (nextState: boolean) => setIsBroken(nextState);

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
