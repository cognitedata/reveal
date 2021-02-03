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

const StyledInput = styled.input`
  width: 50%;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
`;
interface ExternalIdPageProps {}

interface ExternalIdFormInput {
  externalId: string;
}

export const INTEGRATION_EXTERNAL_ID_HEADING: Readonly<string> =
  'Integration external id';
export const EXTERNAL_ID_REQUIRED: Readonly<string> = 'External id is required';
const nameSchema = yup.object().shape({
  externalId: yup.string().required(EXTERNAL_ID_REQUIRED),
});
const ExternalIdPage: FunctionComponent<ExternalIdPageProps> = () => {
  const { cdfEnv, project } = useAppEnv();
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm<ExternalIdFormInput>({
    resolver: yupResolver(nameSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const handleNext = () => {
    history.push(
      `/${project}/${INTEGRATIONS}/create/integration-contacts${
        cdfEnv ? `?env=${cdfEnv}` : ''
      }`
    );
  };
  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper
        to={{
          pathname: `/${project}/${INTEGRATIONS}/integration-name`,
          search: cdfEnv ? `?env=${cdfEnv}` : '',
        }}
      >
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_EXTERNAL_ID_HEADING}</GridH2Wrapper>
        <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
          <label htmlFor="integration-external-id" className="input-label">
            External id
          </label>
          <span id="external-id-hint" className="input-hint">
            The external id is the id used to refer to this integration
            externally. It must be unique. Follow company conventions.
          </span>
          <ErrorMessage
            errors={errors}
            name="externalId"
            render={({ message }) => (
              <span id="external-id-error" className="error-message">
                {message}
              </span>
            )}
          />
          <StyledInput
            id="integration-external-id"
            name="externalId"
            type="text"
            ref={register}
            className={`cogs-input ${errors.externalId ? 'has-error' : ''}`}
            aria-invalid={!!errors.externalId}
            aria-describedby="external-id-hint external-id-error"
          />

          <Button type="primary" htmlType="submit">
            {NEXT}
          </Button>
        </CreateFormWrapper>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default ExternalIdPage;
