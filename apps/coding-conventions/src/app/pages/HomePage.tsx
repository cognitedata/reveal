import {
  Body,
  Breadcrumb as CogsBreadcrumb,
  Input,
  Title as CogsTitle,
} from '@cognite/cogs.js';
import styled from 'styled-components';

import { Card } from '../components/Card/Card';

export const HomePage = () => {
  return (
    <Page>
      <Header>
        <Breadcrumb>
          <Breadcrumb.Item title="Home" link="" />
          <Breadcrumb.Item title="Coding conventions" link="" />
        </Breadcrumb>
        <Title>Coding Conventions</Title>
        <Subtitle>Create coding conventions for resources</Subtitle>
      </Header>

      <Content>
        {/* <SearchInput placeholder="Filter by name..." /> */}

        <Card
          title="File name"
          subtitle="Extract file type"
          onClick={() => {
            console.log('HI');
          }}
        />

        <Card
          title="Assets"
          subtitle="Extract file type"
          onClick={() => {
            console.log('HI');
          }}
        />
      </Content>
    </Page>
  );
};

const Header = styled.section`
  height: 160px;
  background: var(--cogs-surface--status-neutral--muted--default);
  padding: 24px 156px;
`;

const Breadcrumb = styled(CogsBreadcrumb)`
  padding: 0;
`;

const Content = styled.section`
  padding: 24px 156px;
  overflow: auto;
  height: 100%;
  && {
    display: flex;
    flex-direction: row;
    align-content: flex-start;
    gap: 16px;
    flex-wrap: wrap;
  }
`;

const Title = styled(CogsTitle).attrs({ level: 2 })`
  margin-top: 16px !important;
`;

const Subtitle = styled(Body)`
  padding-top: 4px;
`;

const Page = styled.main`
  height: 100vh;
`;

const SearchInput = styled(Input)`
  margin-bottom: 16px !important;
  border: 2px solid rgba(83, 88, 127, 0.16) !important;
  width: 256px !important;
`;
