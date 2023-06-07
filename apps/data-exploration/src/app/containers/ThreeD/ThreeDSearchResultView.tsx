import { useNavigate } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';

import { SearchResultWrapper } from '@data-exploration-app/containers/elements';
import { Model3DWithType } from '@data-exploration-app/containers/ThreeD/ThreeDGridPreview';
import { ThreeDSearchResults } from '@data-exploration-app/containers/ThreeD/ThreeDSearchResults';
import { ThreeDSearchResultsNew } from '@data-exploration-app/containers/ThreeD/ThreeDSearchResultsNew';
import { useFlagNewThreeDView } from '@data-exploration-app/hooks/flags/useFlagNewThreeDView';
import { useQueryString } from '@data-exploration-app/hooks/hooks';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';

export const ThreeDSearchResultView = () => {
  const [query] = useQueryString(SEARCH_KEY);
  const navigate = useNavigate();
  const isNewThreeDViewEnabled = useFlagNewThreeDView();

  return (
    <SearchResultWrapper>
      {isNewThreeDViewEnabled ? (
        <ThreeDSearchResultsNew
          onClick={(item: Model3DWithType) => {
            navigate(
              createLink(
                `/explore/threeD/${
                  item?.type === 'img360' ? item?.siteId + 'img360' : item.id
                }`
              )
            );
          }}
          query={query}
        />
      ) : (
        <ThreeDSearchResults
          onClick={(item: Model3DWithType) => {
            navigate(
              createLink(
                `/explore/threeD/${
                  item?.type === 'img360' ? item?.siteId + 'img360' : item.id
                }`
              )
            );
          }}
          query={query}
        />
      )}
    </SearchResultWrapper>
  );
};
