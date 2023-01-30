import styled from 'styled-components';
import { Header } from '../components/Header/Header';

import { useNavigate, useParams } from 'react-router-dom';
import { SystemView } from '../containers/system/SystemView';
import { Drawer } from '../components/Drawer';
import { ConventionView } from '../containers/convention/ConventionView';

export const ConventionsPage = () => {
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
        <SystemView />
      </Content>

      <Drawer
        title="Coding conventions for 'file name'"
        width="50%"
        visible={!!id}
        onCancel={() => navigate('/')}
      >
        {id && <ConventionView id={id} />}
      </Drawer>
    </Page>
  );
};

export const Page = styled.main`
  height: 100vh;
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
