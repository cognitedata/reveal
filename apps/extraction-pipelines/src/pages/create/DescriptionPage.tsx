import React, { FunctionComponent } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { useAppEnv } from '../../hooks/useAppEnv';
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridH2Wrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from '../../styles/StyledPage';
import { INTEGRATIONS } from '../../utils/baseURL';
import { NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';

const StyledTextArea = styled.textarea`
  width: 80%;
  height: 10rem;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
`;
interface DescriptionPageProps {}

interface ExternalIdFormInput {
  description: string;
}

export const INTEGRATION_DESCRIPTION_HEADING: Readonly<string> =
  'Integration description';
const descriptionSchema = yup.object().shape({
  description: yup.string(),
});
const DescriptionPage: FunctionComponent<DescriptionPageProps> = () => {
  const { cdfEnv, project } = useAppEnv();
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm<ExternalIdFormInput>({
    resolver: yupResolver(descriptionSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const handleNext = () => {
    history.push(
      `/${project}/${INTEGRATIONS}/create/integration-schedule${
        cdfEnv ? `?env=${cdfEnv}` : ''
      }`
    );
  };
  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper
        to={{
          pathname: `/${project}/${INTEGRATIONS}/integration-contacts`,
          search: cdfEnv ? `?env=${cdfEnv}` : '',
        }}
      >
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_DESCRIPTION_HEADING}</GridH2Wrapper>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <label htmlFor="integration-description" className="input-label">
            Description
          </label>
          <span id="description-hint" className="input-hint">
            Describe the the integration as best you can.
          </span>
          <ErrorMessage
            errors={errors}
            name="description"
            render={({ message }) => (
              <span id="description-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledTextArea
            id="integration-description"
            name="description"
            cols={30}
            rows={10}
            ref={register}
            className={`cogs-input ${errors.description ? 'has-error' : ''}`}
            aria-invalid={!!errors.description}
            aria-describedby="description-hint description-error"
          />

          <Button type="primary" htmlType="submit">
            {NEXT}
          </Button>
        </CreateFormWrapper>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default DescriptionPage;
