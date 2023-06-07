import { useNavigate, useParams } from 'react-router-dom';

import styled from 'styled-components';

import { Drawer } from '../components/Drawer';
import { Header } from '../components/Header/Header';
import { Modal } from '../components/Modal/Modal';
import { ConventionEdit } from '../containers/convention/ConventionEdit';
import { ConventionTest } from '../containers/convention/ConventionTest';
import { ConventionValidation } from '../containers/convention/ConventionValidation';
import { ConventionView } from '../containers/convention/ConventionView';
import { SystemView } from '../containers/system/SystemView';

interface Props {
  validate?: boolean;
  test?: boolean;
  editDefinition?: boolean;
}
export const ConventionsPage: React.FC<Props> = ({
  validate,
  test,
  editDefinition,
}) => {
  const { systemId } = useParams();

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

      <Modal
        title="Test run validation"
        visible={!!test}
        modalHeight="300px"
        modalWidth="500px"
        onCancel={() => navigate(`/conventions/${systemId}`)}
      >
        {test && <ConventionTest />}
      </Modal>

      <Modal
        title="Validate on data"
        visible={!!validate}
        modalWidth="600px"
        modalMaxHeight="700px"
        onCancel={() => navigate(`/conventions/${systemId}`)}
      >
        {validate && <ConventionValidation />}
      </Modal>

      {editDefinition && <ConventionEdit />}

      <Drawer
        title="Coding conventions for 'file name'"
        width="50%"
        visible={!!systemId}
        onCancel={() => navigate('/')}
      >
        {systemId && <ConventionView id={systemId} />}
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
