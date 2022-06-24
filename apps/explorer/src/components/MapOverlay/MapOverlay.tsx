import { AvatarButton } from 'components/AvatarButton';
import { AbsoluteHeader } from 'components/Header';
import { Popup } from 'components/Map/Popup';
import { NavigateToSearchButton } from 'components/SearchBar';
import { useGetURLSearchParams } from 'hooks/useGetURLSearchParams';
import { PAGES } from 'pages/routers/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { SearchPeopleRoomsQueryTypeGenerated } from 'graphql/generated';
import { getDataFromMap, getDataFromSearch } from 'utils/map';

const renderLeftHeader = () => <NavigateToSearchButton />;

export const MapOverlay: React.FC<{
  data: SearchPeopleRoomsQueryTypeGenerated;
}> = ({ data }) => {
  const urlSearchParams = useGetURLSearchParams();
  const to = urlSearchParams.get('to') || '';
  const from = urlSearchParams.get('from') || '';

  // break into separate components later
  if (to && from) {
    return <div> ROUTING VIEW </div>;
  }
  if (to) {
    const toType = urlSearchParams.get('toType') || '';
    let destData;
    if (!toType) destData = getDataFromMap(data, to);
    else
      destData = getDataFromSearch(
        data,
        to,
        toType as keyof SearchPeopleRoomsQueryTypeGenerated
      );

    return (
      <Popup
        mainText={destData?.name || ''}
        subText={destData?.description || ''}
        labels={[]}
      />
    );
  }

  return (
    <AbsoluteHeader Left={renderLeftHeader}>
      <Link to={PAGES.PROFILE}>
        <AvatarButton />
      </Link>
    </AbsoluteHeader>
  );
};
