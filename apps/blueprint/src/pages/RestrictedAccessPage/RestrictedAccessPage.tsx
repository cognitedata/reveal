import { Button, Loader } from '@cognite/cogs.js';
import { AuthContext } from 'providers/AuthProvider';
import { useContext, useState } from 'react';
import {
  DATASET_EXTERNAL_ID,
  SetupValidation,
} from 'service/blueprint.service';

import { Container, Box } from './elements';

export type RestrictedAccessPageProps = {
  setup: SetupValidation;
};

const RestrictedAccessPage = ({ setup }: RestrictedAccessPageProps) => {
  const { client } = useContext(AuthContext);
  const [dataSetId, setDataSetId] = useState(setup.dataSetId);
  const [isLoading, setIsLoading] = useState(false);

  const makeDataset = () => {
    setIsLoading(true);
    client.datasets
      .create([
        {
          externalId: DATASET_EXTERNAL_ID,
          name: DATASET_EXTERNAL_ID,
          description:
            'Dataset containing user generated files for Cognite Blueprint.',
          writeProtected: false,
        },
      ])
      .then((res) => {
        setDataSetId(res[0].id);
        setIsLoading(false);
      });
  };

  const renderMessage = () => {
    if (setup.errorCode === 'DS-404') {
      if (setup.datasetAccess === 'WRITE') {
        return (
          <Box>
            <header>
              <h2>Error</h2>
              <h1>Setup Required</h1>
            </header>
            {dataSetId ? (
              <section>
                <Button block type="primary" disabled>
                  Data set exists! (id: {dataSetId})
                </Button>
              </section>
            ) : (
              <section>
                <p>
                  You must create a dataset with the external ID{' '}
                  <code>BLUEPRINT_APP_DATASET</code> to use the application.
                </p>
                <Button block onClick={makeDataset} type="primary">
                  Create dataset
                </Button>
              </section>
            )}
            <section>
              <p>
                You must ensure the users of this application have{' '}
                <code>FILES READ and/or WRITE</code> and{' '}
                <strong>access to this dataset</strong>.
              </p>
              <p>
                You can create and assign a group, or add the permissions to the
                default group
              </p>
            </section>
          </Box>
        );
      }
      return (
        <Box>
          <header>
            <h2>Error</h2>
            <h1>Setup Required</h1>
          </header>
          <p>Ask your IT manager to come to this page to perform setup.</p>
        </Box>
      );
    }
    if (setup.errorCode === 'BP-403') {
      return (
        <Box>
          <header>
            <h2>Error</h2>
            <h1>Permissions required</h1>
          </header>
          <p>Ask your IT manager to give you the correct permissions.</p>
          <p>
            You must have access to read and/or write files, and access to the
            applcation dataset.
          </p>
        </Box>
      );
    }
    return null;
  };

  if (isLoading) {
    <Container>
      <Loader />
    </Container>;
  }

  return <Container>{renderMessage()}</Container>;
};

export default RestrictedAccessPage;
