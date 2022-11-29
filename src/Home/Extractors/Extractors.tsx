import { useState } from 'react';

import { Flex, Loader } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useExtractorsList } from 'hooks/useExtractorsList';
import { ListHeader } from 'components/ListHeader';
import { Layout } from 'components/Layout';
import { ExtractorsList } from 'components/ExtractorsList';
import { CreateExtractor } from 'components/CreateExtractor';
import { ContentContainer } from 'components/ContentContainer';
import CategorySidebar from 'components/category-sidebar/CategorySidebar';

const Extractors = () => {
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
      <ListHeader search={search} setSearch={setSearch} />
      <Layout.Container>
        <ContentContainer>
          <Flex gap={40}>
            <CategorySidebar />
            <StyledListContainer>
              <CreateExtractor />
              <ExtractorsList extractorsList={extractorsList} />
            </StyledListContainer>
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

export default Extractors;
