import { useGetURLSearchParams } from 'hooks/useGetURLSearchParams';
import React from 'react';
import {
  GetSearchDataQueryTypeGenerated,
  useGetMapDataQuery,
  useGetSearchDataQuery,
} from 'graphql/generated';
import { getDataFromMap, getDataFromSearch } from 'utils/map';
import { RoomPopup } from 'components/Map/RoomPopup';
import { EquipmentPopup } from 'components/Map/EquipmentPopup';
import { PersonPopup } from 'components/Map/PersonPopup';
import { useQueryClient } from 'react-query';
import { BlankPopup } from 'components/Map/Popup/BlankPopup';

import { DefaultView } from './Views/DefaultView';

export const DATA_TYPES: { [key: string]: string } = {
  PERSON: 'people',
  ROOM: 'rooms',
  EQUIPMENT: 'equipment',
};

export const MapOverlay: React.FC = () => {
  const urlSearchParams = useGetURLSearchParams();
  const { data, error, isLoading } = useGetMapDataQuery();
  const queryClient = useQueryClient();
  const searchQueryKey = useGetSearchDataQuery.getKey();
  const searchData =
    queryClient.getQueryData<GetSearchDataQueryTypeGenerated>(searchQueryKey) ||
    {};
  const to = urlSearchParams.get('to') || '';
  const from = urlSearchParams.get('from') || '';

  if (error) return <div> {error as string}</div>;
  if (isLoading) return <div>Loading</div>;

  // break into separate components later
  if (to && from) {
    return <div> ROUTING VIEW </div>;
  }
  if (to) {
    let toType = urlSearchParams.get('toType') || '';
    let destData;
    if (!toType) {
      const { key, item } = getDataFromMap(data || {}, to);
      destData = item;
      toType = key;
    } else {
      destData = getDataFromSearch(
        searchData,
        to,
        toType as keyof GetSearchDataQueryTypeGenerated
      );
    }

    // try object routing?
    switch (toType) {
      case DATA_TYPES.PERSON:
        return <PersonPopup data={destData} />;
      case DATA_TYPES.ROOM:
        return <RoomPopup data={destData} />;
      case DATA_TYPES.EQUIPMENT:
        return <EquipmentPopup data={destData} />;
      default:
        return <BlankPopup />;
    }
  }

  return <DefaultView />;
};
