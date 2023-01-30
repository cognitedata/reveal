import styled from 'styled-components';
import { Header } from '../components/Header/Header';
import { Drawer } from '@cognite/cogs.js';

import { ConventionsContainer } from '../containers/ConventionsContainer';
import { Page } from './elements';
import { ContentionsPage } from './conventions/ConventionsPage';
import { useNavigate, useParams } from 'react-router-dom';

export const HomePage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

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

      <DrawerStyled
        title="Coding conventions for 'file name'"
        width="50%"
        visible={!!id}
        onCancel={() => navigate('/')}
      >
        {id && <ContentionsPage id={id} />}
      </DrawerStyled>
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

const DrawerStyled = styled(Drawer)`
  .cogs-drawer-content {
    padding: 0;
  }
  .cogs-drawer-footer {
    display: none;
  }
  .cogs-drawer-header {
    display: none;
  }
`;
