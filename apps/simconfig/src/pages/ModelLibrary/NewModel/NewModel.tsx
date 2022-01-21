import { useNavigate } from 'react-location';

import styled from 'styled-components/macro';

import { ModelForm } from 'components/forms/ModelForm';

export function NewModel() {
  const navigate = useNavigate();

  return (
    <NewModelContainer>
      <h2>Configure new model</h2>
      <ModelForm
        onUpload={({ modelName, simulator }) => {
          navigate({
            to: `/model-library/models/${encodeURIComponent(
              simulator
            )}/${encodeURIComponent(modelName)}`,
            replace: true,
          });
        }}
      />
    </NewModelContainer>
  );
}

const NewModelContainer = styled.div`
  margin: 24px;
`;
