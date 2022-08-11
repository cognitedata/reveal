import { Input, Title } from '@cognite/cogs.js';
import { ChangeEvent } from 'react';
import { useRecoilState } from 'recoil';
import { roomDescriptionAtom } from 'recoil/roomPopup/roomPopupAtoms';

export const DescriptionInput: React.FC = () => {
  const [descriptionInput, setDescriptionInput] =
    useRecoilState(roomDescriptionAtom);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setDescriptionInput(event.target.value);

  return (
    <>
      <Title level={6}>Description </Title>
      <Input value={descriptionInput} onChange={handleChange} />
    </>
  );
};
