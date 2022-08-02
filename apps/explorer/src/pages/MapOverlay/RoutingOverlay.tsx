import { Flex } from '@cognite/cogs.js';
import {
  GetMapDataQueryTypeGenerated,
  GetSearchDataQueryTypeGenerated,
} from 'graphql/generated';
import { useGetURLSearchParams } from 'hooks/useGetURLSearchParams';
import { HOME_ROUTES, PAGES } from 'pages/constants';
import { Link, useHistory } from 'react-router-dom';
import { getDataFromMapAndSearch } from 'utils/map/getDataFromMapAndSearch';
import { LocationSelectorField } from 'components/LocationSelectorField/LocationSelectorField';
import { LinkButton } from 'components/LinkButton/LinkButton';

import {
  DivWithMarginTop,
  FullWidthButton,
  RoutingViewWrapper,
} from './elements';

interface Props {
  mapData: GetMapDataQueryTypeGenerated;
  searchData: GetSearchDataQueryTypeGenerated;
}

export const RoutingOverlay: React.FC<Props> = ({ mapData, searchData }) => {
  const urlSearchParams = useGetURLSearchParams();
  const stringSearchParams = `?${urlSearchParams.toString()}`;
  const history = useHistory();

  let destData: any;
  let srcData: any;

  const destName = urlSearchParams.get('to') || '';
  const srcName = urlSearchParams.get('from') || '';
  const destType = urlSearchParams.get('toType') || '';
  const srcType = urlSearchParams.get('fromType') || '';

  if (destName) {
    destData = getDataFromMapAndSearch(
      destType,
      destName,
      mapData,
      searchData
    ).data;
  }

  if (srcName) {
    srcData = getDataFromMapAndSearch(
      srcType,
      srcName,
      mapData,
      searchData
    ).data;
  }

  const handleDelSrcClick = () => {
    urlSearchParams.delete('from');
    urlSearchParams.delete('fromType');

    history.replace({
      search: urlSearchParams.toString(),
    });
  };

  const handleDelDestClick = () => {
    urlSearchParams.delete('to');
    urlSearchParams.delete('toType');

    history.replace({
      search: urlSearchParams.toString(),
    });
  };

  return (
    <RoutingViewWrapper>
      <DivWithMarginTop>
        <LinkButton
          to={PAGES.HOME}
          icon="ArrowLeft"
          aria-label="back to previous page"
          style={{ display: 'block' }}
        />
        <Flex direction="column">
          <LocationSelectorField
            name={srcData?.externalId ? srcData.name : srcName && 'Unknown'}
            onClear={handleDelSrcClick}
            route={HOME_ROUTES.HOME_NAVIGATE_SET_SRC + stringSearchParams}
          />

          <LocationSelectorField
            name={destData?.externalId ? destData.name : destName && 'Unknown'}
            onClear={handleDelDestClick}
            route={HOME_ROUTES.HOME_NAVIGATE_SET_DEST + stringSearchParams}
          />
        </Flex>
      </DivWithMarginTop>
      <Link
        to={{
          pathname: `${PAGES.HOME}/route`,
          search: `?${urlSearchParams.toString()}`,
        }}
      >
        <FullWidthButton disabled={!srcName || !destName} type="primary">
          Go
        </FullWidthButton>
      </Link>
    </RoutingViewWrapper>
  );
};
