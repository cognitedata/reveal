import styled from 'styled-components';

import { Body, Colors, Flex, Title } from '@cognite/cogs.js';

import images from '../../../assets/images';
import { useTranslation } from '../../../i18n';
import { ALL_APPS_SEARCH_QUERY_DISPLAY_LIMIT } from '../../utils/constants';

type EmptyStateProps = {
  query?: string | undefined;
};

const EmptyState = ({ query: searchText }: EmptyStateProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <StyledEmptyState
      direction="column"
      justifyContent="center"
      alignItems="center"
      gap={16}
    >
      <StyledImg src={images.EmptyStateImg} alt="No App found" />
      {/* <images.EmptyStateImg /> */}
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap={4}
      >
        <StyledTitle level={5}>
          {t('no-search-results-for-text', {
            searchText:
              searchText?.length &&
              searchText.length > ALL_APPS_SEARCH_QUERY_DISPLAY_LIMIT
                ? `${searchText.slice(
                    0,
                    ALL_APPS_SEARCH_QUERY_DISPLAY_LIMIT
                  )}...`
                : searchText,
          })}
        </StyledTitle>
        <StyledDesc level={2} muted>
          {t('no-search-results-desc')}
        </StyledDesc>
      </Flex>
    </StyledEmptyState>
  );
};

const StyledEmptyState = styled(Flex)`
  width: 100%;
  height: 432px;
  background: ${Colors['surface--medium']};
  border-radius: 6px;
`;

const StyledImg = styled.img`
  width: 64px;
  height: 64px;
`;

const StyledTitle = styled(Title)`
  font-weight: 500;
  line-height: 24px;
  text-align: center;
`;

const StyledDesc = styled(Body)`
  width: 269px;
  text-align: center;
`;

export default EmptyState;
