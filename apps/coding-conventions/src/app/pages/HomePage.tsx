import styled from 'styled-components';
import { Header } from '../components/Header/Header';

import { ConventionsContainer } from '../containers/ConventionsContainer';
import { Page } from './elements';

export const HomePage = () => {
  return (
    <Page>
      <Header
        title="Coding Conventions"
        subtitle="All the coding conventions for the resources in your company"
        breadcrumbs={[{ title: 'Coding Conventions' }]}
      />
      <Content>
        <ConventionsContainer />
      </Content>
    </Page>
  );
};

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
