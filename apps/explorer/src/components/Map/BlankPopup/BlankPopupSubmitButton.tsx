import { useCreateEquipment } from 'domain/node/internal/actions/equipment/useCreateEquipmentMutate';
import { useCreateRoom } from 'domain/node/internal/actions/room/useCreateRoomMutate';

import { Room } from 'graphql/generated';
import { useRecoilValue } from 'recoil';
import { blankFormState } from 'recoil/blankPopup/blankFormState';
import { selectedTypeAtom } from 'recoil/blankPopup/blankPopupAtoms';
import { useHistory } from 'react-router-dom-v5';
import { PAGES } from 'pages/constants';
import { MAP_OBJECTS } from 'recoil/blankPopup/constants';

import { FullWidthButton } from '../elements';

export const BlankPopupSubmitButton: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const history = useHistory();
  const newState = useRecoilValue(blankFormState);
  const { value: mainType } = useRecoilValue(selectedTypeAtom);
  const createEquipment = useCreateEquipment();
  const createRoom = useCreateRoom();

  const onSubmit = async (
    newFields: Pick<Room, 'name' | 'externalId' | 'nodeId' | 'type'>
  ) => {
    if (mainType === MAP_OBJECTS.EQUIPMENT) {
      await createEquipment({ ...newFields });
    } else if (mainType === MAP_OBJECTS.ROOM) {
      await createRoom({ ...newFields });
    }

    history.replace({
      pathname: PAGES.HOME,
    });
  };

  const handleSubmit = () => {
    onSubmit(newState);
  };

  return (
    <FullWidthButton onClick={handleSubmit} type="primary">
      {children}
    </FullWidthButton>
  );
};
