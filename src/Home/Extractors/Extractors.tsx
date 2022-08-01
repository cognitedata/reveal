import { useState } from 'react';
import { Flex, Loader } from '@cognite/cogs.js';

import { useExtractorsList } from 'hooks/useExtractorsList';
import { ListHeader } from 'components/ListHeader';
import { Layout } from 'components/Layout';
import { ExtractorsList } from 'components/ExtractorsList';
import { CreateExtractor } from 'components/CreateExtractor';
import { ContentContainer } from 'components/ContentContainer';
import { ExtractorWithRelease } from 'service/extractors';
import {
  ExtractorExtended,
  extractorsListExtended,
} from 'utils/extractorsListExtended';

type TExtractorsListExtended = typeof extractorsListExtended;
type ExtractorWithReleaseExtended = ExtractorWithRelease & ExtractorExtended;

const mergeExtractorsExtended = (
  extractors: ExtractorWithRelease[],
  extractorsListExtended: TExtractorsListExtended
): ExtractorWithReleaseExtended[] => {
  return extractors.map((extractor) => {
    return { ...extractorsListExtended[extractor.externalId], ...extractor };
  });
};

const Extractors = () => {
  const [search, setSearch] = useState('');

  const { data: extractors, status } = useExtractorsList();

  const extractorsList = mergeExtractorsExtended(
    extractors ?? [],
    extractorsListExtended
  ).filter((extractor) => {
    const searchLowercase = search.toLowerCase();
    if (extractor.description?.toLowerCase()?.includes(searchLowercase)) {
      return true;
    }
    if (extractor.name.toLowerCase().includes(searchLowercase)) {
      return true;
    }
    if (extractor.tags.map((t) => t.toLowerCase()).includes(searchLowercase)) {
      return true;
    }
    return false;
  }, []);

  if (status === 'loading') {
    return <Loader />;
  }

  return (
    <Layout>
      <ListHeader search={search} setSearch={setSearch} />
      <Layout.Container>
        <ContentContainer>
          <Flex gap={48} direction="column">
            <CreateExtractor />
            <ExtractorsList extractorsList={extractorsList} />
          </Flex>
        </ContentContainer>
      </Layout.Container>
    </Layout>
  );
};

export default Extractors;
