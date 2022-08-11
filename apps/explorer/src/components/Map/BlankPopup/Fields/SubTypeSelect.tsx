import { Select, Title } from '@cognite/cogs.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  selectedSubTypeAtom,
  selectedTypeAtom,
} from 'recoil/blankPopup/blankPopupAtoms';
import { subTypeOptions } from 'recoil/blankPopup/constants';

export const SubTypeSelect: React.FC = () => {
  const [selectedSubType, setSelectedSubType] =
    useRecoilState(selectedSubTypeAtom);
  const { value: type } = useRecoilValue(selectedTypeAtom);
  return (
    <>
      <Title level={6}>Sub Type</Title>
      <Select
        value={selectedSubType}
        options={subTypeOptions[type]}
        onChange={setSelectedSubType}
      />
    </>
  );
};
