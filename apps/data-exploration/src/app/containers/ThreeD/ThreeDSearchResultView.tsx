import { useNavigate } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';

import { useFlagNewThreeDView } from '../../hooks/flags/useFlagNewThreeDView';
import { useQueryString } from '../../hooks/hooks';
import { SEARCH_KEY } from '../../utils/constants';
import { SearchResultWrapper } from '../elements';

import { Model3DWithType } from './ThreeDGridPreview';
import { ThreeDSearchResults } from './ThreeDSearchResults';
import { ThreeDSearchResultsNew } from './ThreeDSearchResultsNew';

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
