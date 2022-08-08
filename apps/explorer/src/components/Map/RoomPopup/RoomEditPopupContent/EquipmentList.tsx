import { Flex, Label } from '@cognite/cogs.js';
import { PAGES } from 'pages/constants';
import { DATA_TYPES } from 'pages/MapOverlay/MapOverlayRouter';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { prevRoomEquipmentSelectAtom } from 'recoil/roomPopup/roomPopupAtoms';

export const EquipmentList: React.FC = () => {
  const equipmentList = useRecoilValue(prevRoomEquipmentSelectAtom);
  return (
    <Flex gap={4}>
      {equipmentList?.map((equipment) => {
        if (!equipment) {
          return null;
        }

        const labelVariant = equipment.isBroken ? 'disaster' : 'unknown';
        const externalId = equipment.value;
        const name = equipment.label;
        return (
          <Link
            key={externalId}
            to={{
              pathname: `${PAGES.HOME}`,
              search: `?to=${externalId}&toType=${DATA_TYPES.EQUIPMENT}`,
            }}
          >
            <Label variant={labelVariant}>{name}</Label>
          </Link>
        );
      })}
    </Flex>
  );
};
