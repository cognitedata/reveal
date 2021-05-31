import React, { FunctionComponent, useState, KeyboardEvent } from 'react';
import { Hint, StyledTextArea } from 'styles/StyledForm';
import styled from 'styled-components';
import { bottomSpacing } from 'styles/StyledVariables';
import {
  ContactBtnTestIds,
  DOCUMENTATION_HINT,
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
} from 'utils/constants';
import { useForm } from 'react-hook-form';
import ValidationError from 'components/form/ValidationError';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import { useIntegrationById } from 'hooks/useIntegration';
import {
  documentationSchema,
  MAX_DOCUMENTATION_LENGTH,
} from 'utils/validation/integrationSchemas';
import { CountSpan } from 'styles/StyledWrapper';
import MessageDialog from 'components/buttons/MessageDialog';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  BluePlus,
  BlueText,
  CloseButton,
  EditButton,
  SaveButton,
} from 'styles/StyledButton';
import { HeadingLabel } from 'components/inputs/HeadingLabel';
import { DetailFieldNames } from 'model/Integration';
import { MarkdownView } from 'components/markDown/MarkdownView';

const EditDocumentationButton = styled(EditButton)`
  &.cogs-btn.cogs-btn-ghost.has-content {
    display: flex;
  }
  .cogs-documentation--header {
    margin: 1rem 0;
    text-align: left;
  }
`;
const DocumentationWrapper = styled.section`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
const DocumentationForm = styled.form`
  display: grid;
  grid-template-areas: 'label . .' 'hint . .' 'error . .' 'text text text' 'count btn1 btn2';
  grid-auto-columns: 1fr 3rem 3rem;
  grid-column-gap: 0.2rem;
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
    justify-self: end;
  }
  button[aria-label='Close'] {
    grid-area: btn2;
    justify-self: end;
  }
`;

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
      documentation: currentIntegration?.documentation ?? '',
    },
    reValidateMode: 'onSubmit',
    shouldUnregister: false,
  });

  const onValid = async (field: Fields) => {
    if (currentIntegration && project) {
      const mutateObj = createUpdateSpec({
        project,
        id: currentIntegration.id,
        fieldValue: field.documentation,
        fieldName: 'documentation',
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
    clearErrors('server');
  };

  const onCancel = () => {
    setEdit(false);
  };
  if (!currentIntegration) {
    return null;
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'inherit';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <DocumentationWrapper>
      <HeadingLabel labelFor="documentation-textarea">
        {DetailFieldNames.DOCUMENTATION}
      </HeadingLabel>
      <DocumentationForm onSubmit={handleSubmit(onValid)}>
        {isEdit ? (
          <>
            <Hint className="hint">{DOCUMENTATION_HINT}</Hint>
            <ValidationError errors={errors} name="documentation" />
            <StyledTextArea
              id="documentation-textarea"
              name="documentation"
              ref={register}
              defaultValue={currentIntegration?.documentation}
              className={`cogs-input ${!!errors.documentation && 'has-error'}`}
              onKeyDown={handleKeyDown}
              rows={30}
              cols={30}
            />
            {MAX_DOCUMENTATION_LENGTH && (
              <CountSpan className="count">
                {count}/{MAX_DOCUMENTATION_LENGTH}
              </CountSpan>
            )}
            <MessageDialog
              visible={!!errors.server}
              handleClickError={handleClickError}
              title={SERVER_ERROR_TITLE}
              contentText={SERVER_ERROR_CONTENT}
            >
              <SaveButton
                htmlType="submit"
                aria-controls="documentation"
                data-testid={`${TEST_ID_BTN_SAVE}documentation`}
              />
            </MessageDialog>
            <CloseButton
              onClick={onCancel}
              aria-controls="documentation"
              data-testid={`${ContactBtnTestIds.CANCEL_BTN}documentation`}
            />
          </>
        ) : (
          <EditDocumentationButton
            onClick={onEditClick}
            className={`edit-button ${
              currentIntegration?.documentation && 'has-content'
            }`}
            title="Toggle edit documentation"
            aria-expanded={isEdit}
            aria-label="Edit documentation"
            aria-controls="documentation"
            data-testid={`${ContactBtnTestIds.EDIT_BTN}documentation`}
            $full
          >
            {currentIntegration.documentation ? (
              <MarkdownView>
                {currentIntegration.documentation ?? ''}
              </MarkdownView>
            ) : (
              <>
                <BluePlus />
                <BlueText>add documentation</BlueText>
              </>
            )}
          </EditDocumentationButton>
        )}
      </DocumentationForm>
    </DocumentationWrapper>
  );
};
