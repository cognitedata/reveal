import styled from 'styled-components';
import { Flex } from '@cognite/cogs.js';

import { Header } from 'components/Header';
import { Layout } from 'components/Layout';
import { ExtractorsList } from 'components/ExtractorsList';
import { CreateExtractor } from 'components/CreateExtractor';

const Extractors = () => {
  return (
    <Layout>
      <Header />
      <Layout.Container>
        <StyledContentContainer>
          <Flex gap={48} direction="column">
            <CreateExtractor />
            <ExtractorsList />
          </Flex>
        </StyledContentContainer>
      </Layout.Container>
    </Layout>
  );
};

export default Extractors;

const StyledContentContainer = styled.div`
  padding: 48px 0 52px 0;
`;
