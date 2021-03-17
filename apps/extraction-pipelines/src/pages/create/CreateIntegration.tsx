import React, { FunctionComponent, PropsWithChildren } from 'react';
import { useHistory } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { GridH2Wrapper } from 'styles/StyledPage';
import { NEXT, WIZARD_HEADING } from 'utils/constants';
import { NAME_PAGE_PATH } from 'routing/CreateRouteConfig';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { CreateFormWrapper } from 'styles/StyledForm';
import { ButtonPlaced } from 'styles/StyledButton';

interface CreateIntegrationProps {}

const CreateIntegration: FunctionComponent<CreateIntegrationProps> = (
  _: PropsWithChildren<CreateIntegrationProps>
) => {
  const history = useHistory();

  const handleNext = () => {
    history.push(createLink(NAME_PAGE_PATH));
  };

  return (
    <RegisterIntegrationLayout>
      <CreateFormWrapper onSubmit={handleNext}>
        <GridH2Wrapper>{WIZARD_HEADING}</GridH2Wrapper>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </p>
        <ButtonPlaced type="primary" onClick={handleNext}>
          {NEXT}
        </ButtonPlaced>
      </CreateFormWrapper>
    </RegisterIntegrationLayout>
  );
};
export default CreateIntegration;
