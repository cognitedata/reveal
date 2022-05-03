import {
  EndPaginationText,
  Footer,
  LoadMoreButton,
  FooterWrapper,
} from './elements';

/**
 * ShowMore for client side pagination
 */
export const ShowMore = ({
  showingSize,
  pageSizeLimit,
  totalClientData,
  setPageSize,
  enabled,
}: {
  enabled?: boolean;
  showingSize: number;
  pageSizeLimit: number;
  totalClientData: number;
  setPageSize: (size: number) => void;
}) => {
  const showFooterForPaginationButton =
    enabled && totalClientData > pageSizeLimit;

  if (!showFooterForPaginationButton) {
    return null;
  }

  return (
    <FooterWrapper>
      <Footer>
        {showingSize < totalClientData ? (
          <LoadMoreButton
            onClick={() => setPageSize(showingSize + pageSizeLimit)}
          />
        ) : (
          <EndPaginationText level={2}>
            Use filters to refine your search
          </EndPaginationText>
        )}
      </Footer>
    </FooterWrapper>
  );
};
