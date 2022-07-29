import { Flex } from '@cognite/cogs.js';

import { ListHeader } from 'components/ListHeader';
import { Layout } from 'components/Layout';
import { ExtractorsList } from 'components/ExtractorsList';
import { CreateExtractor } from 'components/CreateExtractor';
import { ContentContainer } from 'components/ContentContainer';

const Extractors = () => {
  return (
    <Layout>
      <ListHeader />
      <Layout.Container>
        <ContentContainer>
          <Flex gap={48} direction="column">
            <CreateExtractor />
            <ExtractorsList />
          </Flex>
        </ContentContainer>
      </Layout.Container>
    </Layout>
  );
};

export default Extractors;
