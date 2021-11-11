import { Body, Title } from '@cognite/cogs.js';
import {
  CreateMetadataModel,
  ModelSourceProperty,
} from '@cognite/simconfig-api-sdk';
import { ModelForm } from 'components/forms/ModelForm';
import { DEFAULT_MODEL_SOURCE } from 'components/forms/ModelForm/constants';
import { ModelFormState } from 'components/forms/ModelForm/types';
import { Container, Header } from 'pages/elements';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function NewVersion() {
  const { modelName } = useParams<{ modelName: string }>();
  const { cdfClient } = useContext(CdfClientContext);
  const [initialModelFormState, setInitialModelFormState] =
    useState<ModelFormState>();

  // XXX temp workaround, refactor along with model library
  useEffect(() => {
    cdfClient.files
      .list({
        filter: {
          source: DEFAULT_MODEL_SOURCE,
          name: modelName,
          metadata: {
            nextVersion: '',
          },
        },
      })
      .then((files) => {
        if (!files.items.length) {
          return;
        }
        const fileInfo = files.items[0];
        if (!fileInfo) {
          throw new Error('Invalid model file');
        }
        // XXX fix
        const metadata = fileInfo.metadata as unknown as CreateMetadataModel;
        setInitialModelFormState({
          fileInfo: {
            ...fileInfo,
            // XXX fix
            source: fileInfo.source as ModelSourceProperty,
          },
          metadata: {
            ...metadata,
            simulator: fileInfo.source as ModelSourceProperty,
          },
          boundaryConditions: [], // XXX fix
        });
      });
  }, [cdfClient]);

  return (
    <Container>
      <Header>
        <Title>Create new version</Title>
      </Header>
      <Body>
        {initialModelFormState ? (
          <ModelForm initialModelFormState={initialModelFormState} />
        ) : (
          'Loading...'
        )}
      </Body>
    </Container>
  );
}
