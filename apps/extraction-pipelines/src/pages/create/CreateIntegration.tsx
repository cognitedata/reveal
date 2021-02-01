import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Button } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { INTEGRATIONS } from '../../utils/baseURL';
import { useAppEnv } from '../../hooks/useAppEnv';
import {
  CreateIntegrationPageWrapper,
  GridTitleWrapper,
  GridMainWrapper,
  GridBreadCrumbsWrapper,
  GridH2Wrapper,
} from '../../styles/StyledPage';
import {
  CREATE_INTEGRATION_HEADING,
  NEXT,
  WIZARD_HEADING,
} from '../../utils/constants';

interface CreateIntegrationProps {}

const CreateIntegration: FunctionComponent<CreateIntegrationProps> = (
  _: PropsWithChildren<CreateIntegrationProps>
) => {
  const { cdfEnv, project } = useAppEnv();
  const history = useHistory();

  const handleNext = () => {
    history.push(
      `/${project}/${INTEGRATIONS}/create/integration-name${
        cdfEnv ? `?env=${cdfEnv}` : ''
      }`
    );
  };

  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper
        to={{
          pathname: `/${project}/${INTEGRATIONS}`,
          search: cdfEnv ? `?env=${cdfEnv}` : '',
        }}
      >
        Integrations overview
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>{CREATE_INTEGRATION_HEADING}</GridTitleWrapper>
      <GridMainWrapper>
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
        <Button type="primary" onClick={handleNext}>
          {NEXT}
        </Button>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default CreateIntegration;
