import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import ExtractorDownloadsLink from '../../components/links/ExtractorDownloadsLink';
import OverviewTab from '../../components/tabs/OverviewTab';
import { PageTitle } from '../../styles/StyledHeadings';
import { PageWrapper } from '../../styles/StyledPage';

const LinkWrapper = styled.div`
  grid-area: links;
  display: flex;
  justify-content: flex-end;
  margin: 1.5rem 0;
  a {
    align-self: center;
    margin-right: 2rem;
  }
`;

export const LEARNING_AND_RESOURCES_URL: Readonly<string> =
  'https://docs.cognite.com/cdf/integration/';

interface OwnProps {}

type Props = OwnProps;

const Integrations: FunctionComponent<Props> = () => {
  return (
    <PageWrapper>
      <PageTitle>Integrations</PageTitle>
      <LinkWrapper>
        <ExtractorDownloadsLink
          linkText="Download Extractors"
          link={{ path: '/extractors' }}
        />
        <ExtractorDownloadsLink
          linkText="Learning and resources"
          link={{ url: LEARNING_AND_RESOURCES_URL }}
        />
      </LinkWrapper>
      <OverviewTab />
    </PageWrapper>
  );
};
export default Integrations;
