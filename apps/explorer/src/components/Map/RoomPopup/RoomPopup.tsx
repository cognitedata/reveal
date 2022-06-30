import { useRoomMutate } from 'domain/node/internal/actions/room/useRoomMutate';

import { Room } from 'graphql/generated';
import { useState } from 'react';

import { Container, Content } from '../Popup/elements';

import { RoomPopupContent } from './RoomPopupContent';
import { RoomEditPopupContent } from './RoomEditPopupContent/RoomEditPopupContent';
import { RoomPopupProvider } from './RoomPopupProvider';

export interface Props {
  data: Room;
}

export const RoomPopup: React.FC<Props> = ({ data }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const updateRoom = useRoomMutate();
  const handleEdit = () => setIsEditMode(true);
  const onSubmit = async (newFields: Partial<Room>) => {
    await updateRoom({ ...data, ...newFields });
    setIsEditMode(false);
  };

  return (
    <RoomPopupProvider data={data}>
      <Container>
        <Content className="z-2">
          {isEditMode ? (
            <RoomEditPopupContent onSubmit={onSubmit} />
          ) : (
            <RoomPopupContent handleEdit={handleEdit} />
          )}
        </Content>
      </Container>
    </RoomPopupProvider>
  );
};
