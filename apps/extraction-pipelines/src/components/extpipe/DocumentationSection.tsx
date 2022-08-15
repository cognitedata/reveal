import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';
import {
  ContactBtnTestIds,
  DOCUMENTATION_HINT,
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
} from 'utils/constants';
import { FieldErrors, useForm } from 'react-hook-form';
import ValidationError from 'components/form/ValidationError';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { useExtpipeById } from 'hooks/useExtpipe';
import {
  documentationSchema,
  MAX_DOCUMENTATION_LENGTH,
} from 'utils/validation/extpipeSchemas';
import MessageDialog from 'components/buttons/MessageDialog';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  bottomSpacing,
  CountSpan,
  DivFlex,
  EditButton,
  Hint,
  StyledTextArea,
} from 'components/styled';
import { DetailFieldNames } from 'model/Extpipe';
import { MarkdownView } from 'components/markDown/MarkdownView';
import { AddFieldInfoText } from 'components/message/AddFieldInfoText';
import { Button, Graphic } from '@cognite/cogs.js';
import { Section } from 'components/extpipe/Section';
import { trackUsage } from 'utils/Metrics';
import { ExternalLink } from 'components/links/ExternalLink';
import { getProject } from '@cognite/cdf-utilities';

const DocumentationForm = styled.form`
  padding: 0 1rem;
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

export const DocumentationSection: FunctionComponent<
  DocumentationSectionProps
> = ({ canEdit }) => {
  const project = getProject();
  const [isEdit, setEdit] = useState(false);
  const { extpipe } = useSelectedExtpipe();
  const { data: currentExtpipe } = useExtpipeById(extpipe?.id);
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
      documentation: currentExtpipe?.documentation ?? '',
    },
    reValidateMode: 'onSubmit',
    shouldUnregister: false,
  });

  const count = watch('documentation')?.length ?? 0;

  const onValid = async (field: Fields) => {
    if (currentExtpipe && project) {
      trackUsage({ t: 'EditField.Save', field: 'documentation' });
      const mutateObj = createUpdateSpec({
        project,
        id: currentExtpipe.id,
        fieldValue: field.documentation,
        fieldName: 'documentation',
      });
      await mutate(mutateObj, {
        onError: (error) => {
          trackUsage({ t: 'EditField.Rejected', field: 'documentation' });
          setError('server', {
            type: 'server',
            message: error.data?.message,
            //@ts-ignore
            shouldFocus: true,
          });
        },
        onSuccess: () => {
          trackUsage({ t: 'EditField.Completed', field: 'documentation' });
          setEdit(false);
        },
      });
    }
  };

  const onEditClick = () => {
    if (canEdit) {
      trackUsage({ t: 'EditField.Start', field: 'documentation' });
      setEdit(true);
    }
  };
  const handleClickError = () => {
    clearErrors('server');
  };

  const onCancel = () => {
    trackUsage({ t: 'EditField.Cancel', field: 'documentation' });
    setEdit(false);
  };
  if (!currentExtpipe) {
    return null;
  }

  const infoHowEdit = (
    <>
      <p style={{ margin: '3rem 0', textAlign: 'center' }}>
        Use{' '}
        <ExternalLink href="https://guides.github.com/features/mastering-markdown/">
          markdown
        </ExternalLink>{' '}
        to document important information about the extraction pipeline, for
        troubleshooting or more detailed information about the data such as
        selection criteria.
      </p>
      <EditButton
        showPencilIcon={false}
        type="ghost"
        onClick={onEditClick}
        disabled={!canEdit}
      >
        <AddFieldInfoText>
          {DetailFieldNames.DOCUMENTATION.toLowerCase()}
        </AddFieldInfoText>
      </EditButton>
    </>
  );
  const infoNoDocumentation = (
    <p style={{ margin: '3rem 0', textAlign: 'center', color: 'grey' }}>
      No documentation added.
    </p>
  );
  const whenNotEditing =
    currentExtpipe.documentation == null ? (
      <DivFlex align="center" direction="column" css="margin: 5rem 5rem">
        <Graphic type="RuleMonitoring" />
        {canEdit ? infoHowEdit : infoNoDocumentation}
      </DivFlex>
    ) : (
      <MarkdownView>{currentExtpipe.documentation ?? ''}</MarkdownView>
    );
  const whenEditing = (
    <>
      <Hint className="hint">{DOCUMENTATION_HINT}</Hint>
      <ValidationError errors={errors as FieldErrors} name="documentation" />
      <StyledTextArea
        id="documentation-textarea"
        data-testid="documentation-textarea"
        {...register('documentation')}
        defaultValue={currentExtpipe?.documentation}
        className={`cogs-input ${!!errors.documentation && 'has-error'}`}
        rows={30}
        cols={30}
      />
      <div css="display: flex; justify-content: space-between; gap: 0.5rem; align-items: center">
        <div>
          {MAX_DOCUMENTATION_LENGTH && (
            <CountSpan className="count">
              {count}/{MAX_DOCUMENTATION_LENGTH}
            </CountSpan>
          )}
        </div>
        <div>
          <Button
            type="ghost"
            onClick={onCancel}
            aria-controls="documentation"
            data-testid={`${ContactBtnTestIds.CANCEL_BTN}documentation`}
          >
            Cancel
          </Button>
          <MessageDialog
            visible={!!errors.server}
            handleClickError={handleClickError}
            title={SERVER_ERROR_TITLE}
            contentText={SERVER_ERROR_CONTENT}
          >
            <Button
              htmlType="submit"
              type="primary"
              aria-controls="documentation"
              data-testid={`${TEST_ID_BTN_SAVE}documentation`}
            >
              Confirm
            </Button>
          </MessageDialog>
        </div>
      </div>
    </>
  );
  return (
    <Section
      title={DetailFieldNames.DOCUMENTATION}
      icon="Documentation"
      editButton={{ onClick: onEditClick, canEdit }}
    >
      <DocumentationForm onSubmit={handleSubmit(onValid)}>
        {isEdit ? whenEditing : whenNotEditing}
      </DocumentationForm>
    </Section>
  );
};
