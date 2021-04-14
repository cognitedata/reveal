import React, { FunctionComponent, useState } from 'react';
import {
  EditButton,
  Hint,
  StyledLabel,
  StyledTextArea,
} from 'styles/StyledForm';
import styled from 'styled-components';
import { Button, Colors, Icon } from '@cognite/cogs.js';
import { bottomSpacing } from 'styles/StyledVariables';
import { StyledTitle2 } from 'styles/StyledHeadings';
import {
  DOCUMENTATION_HEADING,
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
} from 'utils/constants';
import { useForm } from 'react-hook-form';
import ValidationError from 'components/form/ValidationError';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import {
  useDetailsUpdate,
  createUpdateSpec,
} from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import { useIntegrationById } from 'hooks/useIntegration';
import {
  documentationSchema,
  MAX_DESC_LENGTH,
} from 'utils/validation/integrationSchemas';
import { CountSpan } from 'components/form/DescriptionView';
import { ContactBtnTestIds } from 'components/form/ContactsView';
import MessageDialog from 'components/buttons/MessageDialog';
import { yupResolver } from '@hookform/resolvers/yup';

const DocumentationWrapper = styled.section`
  padding: 1rem;
  border-right: 1px solid ${Colors['greyscale-grey2'].hex()};
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
const DocumentationForm = styled.form`
  display: grid;
  grid-template-areas: 'label . .' 'hint . .' 'error . .' 'text text text' 'count btn1 btn2';
  grid-auto-columns: 1fr 3rem 3rem;
  grid-column-gap: 0.5rem;
  .hint {
    grid-area: hint;
  }
  .error-message {
    grid-area: error;
  }
  .count {
    grid-area: count;
  }
  .edit-button {
    grid-area: text;
  }
  textarea {
    grid-area: text;
    margin-bottom: ${bottomSpacing};
  }
  span[aria-expanded] {
    grid-area: btn1;
  }
  button[aria-label='Close'] {
    grid-area: btn2;
  }
`;

export const DOCUMENTATION_LABEL: Readonly<string> = 'Add documentation';
export const DOCUMENTATION_HINT: Readonly<string> =
  'Please add any relevant documentation.';
export const TEST_ID_BTN_SAVE: Readonly<string> = 'btn-save-';
interface DocumentationSectionProps {}

type Fields = { documentation: string; server: string };
export const DocumentationSection: FunctionComponent<DocumentationSectionProps> = () => {
  const { project } = useAppEnv();
  const [isEdit, setEdit] = useState(false);
  const { integration } = useSelectedIntegration();
  const { data: currentIntegration } = useIntegrationById(integration?.id);
  const { mutate } = useDetailsUpdate();
  const {
    handleSubmit,
    register,
    errors,
    setError,
    watch,
    clearErrors,
  } = useForm<Fields>({
    resolver: yupResolver(documentationSchema),
    defaultValues: {
      documentation: currentIntegration?.metadata?.documentation ?? '',
    },
    reValidateMode: 'onSubmit',
    shouldUnregister: false,
  });

  const onValid = async (field: Fields) => {
    if (currentIntegration && project) {
      const mutateObj = createUpdateSpec({
        project,
        id: currentIntegration.id,
        fieldValue: {
          ...currentIntegration.metadata,
          documentation: field.documentation,
        },
        fieldName: 'metadata',
      });
      await mutate(mutateObj, {
        onError: (error) => {
          setError('server', {
            type: 'server',
            message: error.data.message,
            shouldFocus: true,
          });
        },
        onSuccess: () => {
          setEdit(false);
        },
      });
    }
  };

  const count = watch('documentation')?.length ?? 0;
  const onEditClick = () => {
    setEdit(true);
  };
  const handleClickError = () => {
    clearErrors('documentation');
  };

  const onCancel = () => {
    setEdit(false);
  };
  if (!currentIntegration) {
    return null;
  }

  return (
    <DocumentationWrapper>
      <StyledTitle2 id="documentation-heading">
        {DOCUMENTATION_HEADING}
      </StyledTitle2>
      <DocumentationForm onSubmit={handleSubmit(onValid)}>
        <StyledLabel htmlFor="documentation-textarea">
          {DOCUMENTATION_LABEL}
        </StyledLabel>
        {isEdit ? (
          <>
            <Hint className="hint">{DOCUMENTATION_HINT}</Hint>
            <ValidationError errors={errors} name="documentation" />
            <StyledTextArea
              id="documentation-textarea"
              name="documentation"
              ref={register}
              defaultValue={currentIntegration.metadata?.documentation}
              className={`cogs-input ${!!errors.documentation && 'has-error'}`}
              rows={10}
              cols={30}
            />
            {MAX_DESC_LENGTH && (
              <CountSpan className="count">
                {count}/{MAX_DESC_LENGTH}
              </CountSpan>
            )}
            <MessageDialog
              visible={!!errors.server}
              handleClickError={handleClickError}
              title={SERVER_ERROR_TITLE}
              contentText={SERVER_ERROR_CONTENT}
            >
              <Button
                className="edit-form-btn btn-margin-right"
                type="primary"
                htmlType="submit"
                aria-controls="documentation"
                aria-label="Save"
                data-testid={`${TEST_ID_BTN_SAVE}documentation`}
              >
                <Icon type="Checkmark" />
              </Button>
            </MessageDialog>
            <Button
              variant="default"
              className="edit-form-btn"
              onClick={onCancel}
              aria-controls="documentation"
              aria-label="Close"
              data-testid={`${ContactBtnTestIds.CANCEL_BTN}documentation`}
            >
              <Icon type="Close" />
            </Button>
          </>
        ) : (
          <EditButton
            onClick={onEditClick}
            className="edit-button"
            title="Toggle edit documentation"
            aria-expanded={isEdit}
            aria-label="Edit documentation"
            aria-controls="documentation"
            data-testid={`${ContactBtnTestIds.EDIT_BTN}documentation`}
          >
            {currentIntegration.metadata?.documentation ?? '-'}
          </EditButton>
        )}
      </DocumentationForm>
    </DocumentationWrapper>
  );
};
