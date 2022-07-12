import { EquipmentPopup } from 'components/Map/EquipmentPopup';
import { PersonPopup } from 'components/Map/PersonPopup';
import { BlankPopup } from 'components/Map/BlankPopup/BlankPopup';
import { RoomPopup } from 'components/Map/RoomPopup';
import {
  GetSearchDataQueryTypeGenerated,
  GetMapDataQueryTypeGenerated,
} from 'graphql/generated';
import { useGetURLSearchParams } from 'hooks/useGetURLSearchParams';
import { DATA_TYPES } from 'pages/MapOverlay/MapOverlayRouter';
import { getData } from 'utils/map/getData';

import { PopupWrapper } from './PopupWrapper';

interface Props {
  mapData: GetMapDataQueryTypeGenerated;
  searchData: GetSearchDataQueryTypeGenerated;
}

export const Popup: React.FC<Props> = ({ mapData, searchData }) => {
  const urlSearchParams = useGetURLSearchParams();
  const to = urlSearchParams.get('to') || '';

  let PopupComponent: React.ReactNode = null;

  if (to) {
    const type = urlSearchParams.get('toType') || '';
    const { data: destData, type: dataType } = getData(
      type,
      to,
      mapData,
      searchData
    );

    switch (dataType) {
      case DATA_TYPES.PERSON:
        PopupComponent = <PersonPopup data={destData} />;
        break;
      case DATA_TYPES.ROOM:
        PopupComponent = <RoomPopup data={destData} />;
        break;
      case DATA_TYPES.EQUIPMENT:
        PopupComponent = <EquipmentPopup data={destData} />;
        break;
      default:
        PopupComponent = <BlankPopup />;
    }
  }

  return PopupComponent && <PopupWrapper>{PopupComponent} </PopupWrapper>;
};
