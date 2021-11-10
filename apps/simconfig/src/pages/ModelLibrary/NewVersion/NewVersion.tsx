import { Body, Title } from '@cognite/cogs.js';
import { CreateModelRequestModel } from '@cognite/simconfig-api-sdk';
import { ModelForm } from 'components/forms/ModelForm';
import { ModelFormState } from 'components/forms/ModelForm/types';
import { Container, Header } from 'pages/elements';
import { useLocation } from 'react-router-dom';

export default function NewVersion() {
  const location = useLocation<CreateModelRequestModel>();
  const { file, fileInfo, metadata } = location.state;

  const modelFormState: ModelFormState = {
    file,
    fileInfo,
    metadata,
    boundaryConditions: [],
  };

  return (
    <Container>
      <Header>
        <Title>Create new version</Title>
      </Header>
      <Body>
        <ModelForm initialModelFormState={modelFormState} />
      </Body>
    </Container>
  );
}
