import { useNavigate } from 'react-router-dom';
import { SearchResultWrapper } from '@data-exploration-app/containers/elements';
import { useQueryString } from '@data-exploration-app/hooks/hooks';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { ThreeDSearchResults } from '@data-exploration-app/containers/ThreeD/ThreeDSearchResults';
import { Model3DWithType } from '@data-exploration-app/containers/ThreeD/ThreeDGridPreview';
import { createLink } from '@cognite/cdf-utilities';

export const ThreeDSearchResultView = () => {
  const [query] = useQueryString(SEARCH_KEY);
  const navigate = useNavigate();

  return (
    <SearchResultWrapper>
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
    </SearchResultWrapper>
  );
};
