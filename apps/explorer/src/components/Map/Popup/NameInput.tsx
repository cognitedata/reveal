import { Input } from '@cognite/cogs.js';
import { ChangeEvent } from 'react';
import { useRecoilState } from 'recoil';
import { EditOptionItem } from 'components/Map/Popup/elements';
import { nameAtom } from 'recoil/popupShared/nameAtom';

export const NameInput: React.FC = () => {
  const [nameInput, setNameInput] = useRecoilState(nameAtom);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setNameInput(event.target.value);

  return (
    <EditOptionItem>
      Name
      <Input value={nameInput} onChange={handleChange} />
    </EditOptionItem>
  );
};
