import { Select, Title } from '@cognite/cogs.js';
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

export const MainTypeSelect: React.FC = () => {
  const [selectedType, setSelectedType] = useRecoilState(selectedTypeAtom);
  const setSelectedSubType = useSetRecoilState(selectedSubTypeAtom);

  const handleChange = (newValue: { label: string; value: MAP_OBJECTS }) => {
    const selectedType = newValue?.value || MAP_OBJECTS.EQUIPMENT;
    setSelectedSubType(subTypeOptions[selectedType][0]);
    setSelectedType(newValue);
  };

  return (
    <>
      <Title level={6}>Object Type</Title>
      <Select
        value={selectedType}
        options={mainTypeSelectOptions}
        onChange={handleChange}
      />
    </>
  );
};
