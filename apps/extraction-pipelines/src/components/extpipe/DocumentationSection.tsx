import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';
import { ContactBtnTestIds } from 'utils/constants';
import { FieldErrors, useForm } from 'react-hook-form';
import ValidationError from 'components/form/ValidationError';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { useSelectedExtpipe } from 'hooks/useExtpipe';
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
  Hint,
  StyledTextArea,
} from 'components/styled';
import { MarkdownView } from 'components/markDown/MarkdownView';
import { A, Button, Graphic } from '@cognite/cogs.js';
import Section from 'components/section';
import { trackUsage } from 'utils/Metrics';
import { useTranslation } from 'common';
import { MASTERING_MARKDOWN_LINK } from 'utils/utils';

export const TEST_ID_BTN_SAVE: Readonly<string> = 'btn-save-';
interface DocumentationSectionProps {
  canEdit: boolean;
}

type Fields = { documentation: string; server: string };

export const DocumentationSection: FunctionComponent<
  DocumentationSectionProps
> = ({ canEdit }) => {
  const { t } = useTranslation();
  const [isEdit, setEdit] = useState(false);
  const { data: currentExtpipe } = useSelectedExtpipe();
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
    if (currentExtpipe) {
      trackUsage({ t: 'EditField.Save', field: 'documentation' });
      const mutateObj = createUpdateSpec({
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
        {t('ext-pipeline-how-to-edit-info-1')}{' '}
        <A href={MASTERING_MARKDOWN_LINK}>
          {t('ext-pipeline-how-to-edit-info-2')}
        </A>
        &nbsp;
        {t('ext-pipeline-how-to-edit-info-3')}
      </p>
      <Button onClick={onEditClick} disabled={!canEdit} icon="Add" type="link">
        {t('add-documentation')}
      </Button>
    </>
  );
  const infoNoDocumentation = (
    <p style={{ margin: '3rem 0', textAlign: 'center', color: 'grey' }}>
      {t('no-documentation-added')}
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
      <Hint className="hint">
        {t('ext-pipeline-edit-info-1')}{' '}
        <A href={MASTERING_MARKDOWN_LINK}>{t('ext-pipeline-edit-info-2')}</A>
      </Hint>
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
            {t('cancel')}
          </Button>
          <MessageDialog
            visible={!!errors.server}
            handleClickError={handleClickError}
            title={t('server-err-title')}
            contentText={t('server-err-desc')}
          >
            <Button
              htmlType="submit"
              type="primary"
              aria-controls="documentation"
              data-testid={`${TEST_ID_BTN_SAVE}documentation`}
            >
              {t('confirm')}
            </Button>
          </MessageDialog>
        </div>
      </div>
    </>
  );
  return (
    <Section
      title={t('documentation')}
      extra={
        <Button
          disabled={!canEdit}
          onClick={onEditClick}
          size="small"
          type="ghost"
        >
          Edit
        </Button>
      }
      icon="Documentation"
      data-testid="documentation"
      items={[
        {
          key: 'documentation',
          value: (
            <DocumentationForm onSubmit={handleSubmit(onValid)}>
              {isEdit ? whenEditing : whenNotEditing}
            </DocumentationForm>
          ),
        },
      ]}
    />
  );
};

const DocumentationForm = styled.form`
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
