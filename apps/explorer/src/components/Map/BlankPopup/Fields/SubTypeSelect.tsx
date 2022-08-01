import { Select } from '@cognite/cogs.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  selectedSubTypeAtom,
  selectedTypeAtom,
} from 'recoil/blankPopup/blankPopupAtoms';
import { EditOptionItem } from 'components/Map/Popup/elements';
import { subTypeOptions } from 'recoil/blankPopup/constants';

export const SubTypeSelect: React.FC = () => {
  const [selectedSubType, setSelectedSubType] =
    useRecoilState(selectedSubTypeAtom);
  const { value: type } = useRecoilValue(selectedTypeAtom);
  return (
    <EditOptionItem>
      Sub Type
      <Select
        value={selectedSubType}
        options={subTypeOptions[type]}
        onChange={setSelectedSubType}
        width={150}
      />
    </EditOptionItem>
  );
};
