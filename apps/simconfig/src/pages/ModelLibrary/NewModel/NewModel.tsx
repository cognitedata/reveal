import { useNavigate } from 'react-location';

import styled from 'styled-components/macro';

import { ModelForm } from 'components/forms/ModelForm';

export function NewModel() {
  const navigate = useNavigate();

  const handleRedirect = (modelName: string, source: string) => {
    navigate({
      to: `/model-library/models/${encodeURIComponent(
        source
      )}/${encodeURIComponent(modelName)}`,
      replace: true,
    });
  };

  return (
    <NewModelContainer>
      <h2>Configure new model</h2>
      <ModelForm onUpload={handleRedirect} />
    </NewModelContainer>
  );
}

const NewModelContainer = styled.div`
  margin: 24px;
`;
