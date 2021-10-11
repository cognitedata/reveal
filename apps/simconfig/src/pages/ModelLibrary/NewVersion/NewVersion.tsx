import { Body, Title } from '@cognite/cogs.js';
import { ModelForm } from 'components/forms/ModelForm';
import { ModelFormData } from 'components/forms/ModelForm/types';
import { Container, Header } from 'pages/elements';
import { useLocation } from 'react-router-dom';

export default function NewVersion() {
  const location = useLocation<Pick<ModelFormData, 'file' | 'fileInfo'>>();
  const { name, metadata, mimeType, source } = location.state.fileInfo;
  const { file } = location.state;

  const fileInfo = {
    name,
    mimeType,
    source,
    metadata: {
      ...metadata,
      version: (parseInt(metadata.version, 10) + 1).toString(),
      description: '',
    },
  };

  const formData: ModelFormData = {
    file,
    fileInfo,
    boundaryConditions: [],
  };

  return (
    <Container>
      <Header>
        <Title>Create new version</Title>
      </Header>
      <Body>
        <ModelForm formData={formData} />
      </Body>
    </Container>
  );
}
