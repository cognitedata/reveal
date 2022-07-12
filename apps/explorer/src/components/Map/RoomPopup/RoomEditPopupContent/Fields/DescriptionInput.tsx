import { Input } from '@cognite/cogs.js';
import { ChangeEvent } from 'react';
import { useRecoilState } from 'recoil';
import { roomDescriptionAtom } from 'recoil/roomPopup/roomPopupAtoms';
import { EditOptionItem } from 'components/Map/Popup/elements';

export const DescriptionInput: React.FC = () => {
  const [descriptionInput, setDescriptionInput] =
    useRecoilState(roomDescriptionAtom);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setDescriptionInput(event.target.value);

  return (
    <EditOptionItem>
      Description
      <Input value={descriptionInput} onChange={handleChange} />
    </EditOptionItem>
  );
};
