import { Body, Title } from '@cognite/cogs.js';
import { ModelForm } from 'components/forms/ModelForm';
import { ModelFormData } from 'components/forms/ModelForm/types';
import { Container, Header } from 'pages/elements';
import { useLocation } from 'react-router-dom';
import { formatFileInfoForNewVersion } from 'utils/fileInfo';

export default function NewVersion() {
  const location = useLocation<Pick<ModelFormData, 'file' | 'fileInfo'>>();
  const { file } = location.state;

  const fileInfo = formatFileInfoForNewVersion(location.state.fileInfo);

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
