import { useNavigate } from 'react-location';

import { ModelForm } from '@simint-app/components/forms/ModelForm';
import { createCdfLink } from '@simint-app/utils/createCdfLink';
import styled from 'styled-components/macro';

export function NewModel() {
  const navigate = useNavigate();

  return (
    <NewModelContainer>
      <h2>Configure new model</h2>
      <ModelForm
        onUpload={({ modelName, simulator }) => {
          navigate({
            to: createCdfLink(
              `/model-library/models/${encodeURIComponent(
                simulator
              )}/${encodeURIComponent(modelName)}`
            ),
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
