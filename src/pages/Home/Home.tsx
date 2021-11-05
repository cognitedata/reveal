import React, { useEffect } from 'react';
import { useUserContext } from '@cognite/cdf-utilities';
import { handleUserIdentification } from 'utils/config';
import { Page } from 'components/Page';
import { Header } from 'components/Header';
import { homeConfig } from 'configs/global.config';
import { Button } from '@cognite/cogs.js';
import { useDocumentsPipelinesQuery } from 'services/query/documents/query';
import { useNavigation } from 'hooks/useNavigation';
import ClassifierWidget from './components/widgets/ClassifierWidget';
import { ClassifierTable } from './components/table/ClassifierTable';

const Home = () => {
  const user = useUserContext();
  const { toClassifier } = useNavigation();

  const { data: pipeline } = useDocumentsPipelinesQuery();
  // const metrics = useMetrics('Document-Search-UI');

  useEffect(() => {
    handleUserIdentification(user.username);
  }, [user]);

  return (
    <Page Widget={<ClassifierWidget />}>
      <Header
        title={`Trained models for ${pipeline?.classifier.name}`}
        description={homeConfig.DESCRIPTION}
        Action={
          <Button
            icon="PlusCompact"
            type="primary"
            onClick={() => toClassifier(pipeline?.classifier.name || 'No name')}
          >
            Train new model
          </Button>
        }
      />

      <ClassifierTable />
    </Page>
  );
};

export default Home;
