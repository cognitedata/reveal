import { Input, Title } from '@cognite/cogs.js';
import { ChangeEvent } from 'react';
import { useRecoilState } from 'recoil';
import { nameAtom } from 'recoil/popupShared/nameAtom';

export const NameInput: React.FC = () => {
  const [nameInput, setNameInput] = useRecoilState(nameAtom);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setNameInput(event.target.value);

  return (
    <>
      <Title level={6}>Name</Title>
      <Input value={nameInput} onChange={handleChange} />
    </>
  );
};
