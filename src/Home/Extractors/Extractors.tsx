import { useState } from 'react';

import { Colors, Flex, Input, Loader } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useExtractorsList } from 'hooks/useExtractorsList';
import { ListHeader } from 'components/ListHeader';
import { Layout } from 'components/Layout';
import { ExtractorsList } from 'components/ExtractorsList';
import { CreateExtractor } from 'components/CreateExtractor';
import { ContentContainer } from 'components/ContentContainer';
import CategorySidebar from 'components/category-sidebar/CategorySidebar';
import { trackUsage } from 'utils';
import { useTranslation } from 'common';

const Extractors = () => {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');

  const { data: extractors, status } = useExtractorsList();

  const extractorsList =
    extractors?.filter((extractor) => {
      const searchLowercase = search.toLowerCase();
      if (extractor.description?.toLowerCase()?.includes(searchLowercase)) {
        return true;
      }
      if (extractor.name.toLowerCase().includes(searchLowercase)) {
        return true;
      }
      if (
        extractor?.tags?.map((t) => t.toLowerCase()).includes(searchLowercase)
      ) {
        return true;
      }
      return false;
    }, []) ?? [];

  if (status === 'loading') {
    return <Loader />;
  }

  return (
    <Layout>
      <ListHeader />
      <Layout.Container>
        <ContentContainer>
          <Flex direction="column" gap={16}>
            <StyledSearchInput
              size="large"
              fullWidth
              placeholder={t('search-for-source-systems')}
              value={search}
              onChange={(evt) => {
                trackUsage({ e: 'Search.Extractor' });
                setSearch(evt.currentTarget.value);
              }}
            />
            <Flex gap={40}>
              <CategorySidebar />
              <StyledListContainer>
                <CreateExtractor />
                <ExtractorsList extractorsList={extractorsList} />
              </StyledListContainer>
            </Flex>
          </Flex>
        </ContentContainer>
      </Layout.Container>
    </Layout>
  );
};

const StyledListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const StyledSearchInput = styled(Input).attrs({
  type: 'search',
  icon: 'Search',
})`
  svg {
    color: ${Colors['text-icon--muted']};

    path {
      fill: currentColor;
    }
  }
`;

export default Extractors;
