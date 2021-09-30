import React, { FunctionComponent, useState } from 'react';
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
import { CloseButton, SaveButton } from 'styles/StyledButton';
import { DetailFieldNames } from 'model/Integration';
import { MarkdownView } from 'components/markDown/MarkdownView';
import { AddFieldInfoText } from 'components/message/AddFieldInfoText';
import { Graphic } from '@cognite/cogs.js';
import { EditableAreaButton } from 'components/integration/EditableAreaButton';
import { Section } from 'components/integration/Section';

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
interface DocumentationSectionProps {
  canEdit: boolean;
}

type Fields = { documentation: string; server: string };

export const DocumentationSection: FunctionComponent<DocumentationSectionProps> = ({
  canEdit,
}) => {
  const { project } = useAppEnv();
  const [isEdit, setEdit] = useState(false);
  const { integration } = useSelectedIntegration();
  const { data: currentIntegration } = useIntegrationById(integration?.id);
  const { mutate } = useDetailsUpdate();
  const {
    handleSubmit,
    register,
    formState: { errors },
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

  const count = watch('documentation')?.length ?? 0;

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

  const onEditClick = () => {
    if (canEdit) {
      setEdit(true);
    }
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

  return (
    <Section title={DetailFieldNames.DOCUMENTATION} icon="Documentation">
      <DocumentationForm onSubmit={handleSubmit(onValid)}>
        {isEdit ? (
          <>
            <Hint className="hint">{DOCUMENTATION_HINT}</Hint>
            <ValidationError errors={errors} name="documentation" />
            <StyledTextArea
              id="documentation-textarea"
              {...register('documentation')}
              defaultValue={currentIntegration?.documentation}
              className={`cogs-input ${!!errors.documentation && 'has-error'}`}
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
          <EditableAreaButton
            onClick={onEditClick}
            disabled={!canEdit}
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  flexDirection: 'column',
                }}
              >
                <Graphic type="RuleMonitoring" />
                <p style={{ margin: '3em 0' }}>
                  Use markdown to document important information about the
                  extraction pipeline, for troubleshooting or more detailed
                  information about the data such as selection criteria.
                </p>
                <AddFieldInfoText>
                  {DetailFieldNames.DOCUMENTATION.toLowerCase()}
                </AddFieldInfoText>
              </div>
            )}
          </EditableAreaButton>
        )}
      </DocumentationForm>
    </Section>
  );
};
