import { Flex } from '@cognite/cogs.js';

import { ListHeader } from 'components/ListHeader';
import { Layout } from 'components/Layout';
import { ExtractorsList } from 'components/ExtractorsList';
import { CreateExtractor } from 'components/CreateExtractor';
import { ContentContainer } from 'components/ContentContainer';
import { useState } from 'react';

const Extractors = () => {
  const [search, setSearch] = useState('');
  return (
    <Layout>
      <ListHeader search={search} setSearch={setSearch} />
      <Layout.Container>
        <ContentContainer>
          <Flex gap={48} direction="column">
            <CreateExtractor />
            <ExtractorsList search={search} />
          </Flex>
        </ContentContainer>
      </Layout.Container>
    </Layout>
  );
};

export default Extractors;
