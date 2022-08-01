import { Select } from '@cognite/cogs.js';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  selectedTypeAtom,
  selectedSubTypeAtom,
} from 'recoil/blankPopup/blankPopupAtoms';
import {
  mainTypeSelectOptions,
  MAP_OBJECTS,
  subTypeOptions,
} from 'recoil/blankPopup/constants';

import { EditOptionItem } from '../../Popup/elements';

export const MainTypeSelect: React.FC = () => {
  const [selectedType, setSelectedType] = useRecoilState(selectedTypeAtom);
  const setSelectedSubType = useSetRecoilState(selectedSubTypeAtom);

  const handleChange = (newValue: { label: string; value: MAP_OBJECTS }) => {
    const selectedType = newValue?.value || MAP_OBJECTS.EQUIPMENT;
    setSelectedSubType(subTypeOptions[selectedType][0]);
    setSelectedType(newValue);
  };

  return (
    <EditOptionItem>
      Object Type
      <Select
        value={selectedType}
        options={mainTypeSelectOptions}
        onChange={handleChange}
        width={150}
      />
    </EditOptionItem>
  );
};
