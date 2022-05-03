import { LoadingSpinner } from 'components/Loading';

import {
  EndPaginationText,
  Footer,
  LoadMoreButton,
  FooterWrapper,
} from './elements';

const NO_MORE_RESULTS = 'No more results, use filters to refine your search';

/**
 * FooterPaginationServer
 */
export const FooterPaginationServer = ({
  handleLoadMore,
  showingResults,
  totalResults,
  isLoading,
  pageSize,
}: {
  showingResults: number;
  pageSize: number;
  totalResults: number;
  isLoading?: boolean;
  handleLoadMore?: () => void;
}) => {
  const showLoadMoreExternalAction = !isLoading && handleLoadMore;

  const allResultsSeen = showingResults === totalResults;
  const lessThanOnePage = totalResults <= pageSize;

  // we only want to show this in a few situations
  // but they all basically mean that the user has reached the end of some pages of data
  // we do NOT show it when there is only one page or more pages remain
  const showRefineSearch =
    !showLoadMoreExternalAction && allResultsSeen && !lessThanOnePage;

  // console.log('Debug:', {
  //   showingResults,
  //   totalResults,
  //   lessThanOnePage,
  //   allResultsSeen,
  //   showLoadMoreExternalAction,
  //   showRefineSearch,
  // });

  return (
    <FooterWrapper>
      <Footer>
        {isLoading && <LoadingSpinner isLoading />}

        {showLoadMoreExternalAction && (
          <LoadMoreButton onClick={handleLoadMore} />
        )}

        {showRefineSearch && (
          <EndPaginationText level={2}>{NO_MORE_RESULTS}</EndPaginationText>
        )}
      </Footer>
    </FooterWrapper>
  );
};
