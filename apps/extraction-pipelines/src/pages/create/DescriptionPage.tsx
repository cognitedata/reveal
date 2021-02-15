import React, { FunctionComponent } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridH2Wrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from '../../styles/StyledPage';
import { NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';
import {
  CONTACTS_PAGE_PATH,
  SCHEDULE_PAGE_PATH,
} from '../../routing/RoutingConfig';

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
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm<ExternalIdFormInput>({
    resolver: yupResolver(descriptionSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const handleNext = () => {
    history.push(createLink(SCHEDULE_PAGE_PATH));
  };
  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(CONTACTS_PAGE_PATH)}>
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
