import { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  getExtractorsWithReleases,
  ExtractorWithRelease,
  // Artifact,
  // Release,
  // getDownloadUrl,
} from './ExtractorDownloadApi';
// import { useTranslation } from 'common/i18n';
// import { getArtifactName } from './common';
import { Header } from 'components/Header';
import { Layout } from 'components/Layout';
import { CreateExtractor } from 'components/CreateExtractor';

// TODO: move this to react-query
const _useGetExtractors = () => {
  const [extractors, setExtractors] = useState<ExtractorWithRelease[]>();
  useEffect(() => {
    getExtractorsWithReleases()
      .then((res) => {
        setExtractors(res);
      })
      // eslint-disable-next-line no-console
      .catch((e) => console.error(e));
  }, []);

  return extractors;
};

const Extractors = () => {
  return (
    <Layout>
      <Header />
      <Layout.Container>
        <StyledContentContainer>
          <CreateExtractor />
        </StyledContentContainer>
      </Layout.Container>
    </Layout>
  );
};

export default Extractors;

const StyledContentContainer = styled.div`
  padding: 48px 0 52px 0;
`;
