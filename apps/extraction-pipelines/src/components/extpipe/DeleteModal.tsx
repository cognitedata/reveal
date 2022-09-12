import { Button, Input } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { EditModal } from 'components/modals/EditModal';
import { DivFlex } from 'components/styled';
import React, { FunctionComponent, useCallback, useState } from 'react';

type Props = {
  isOpen: boolean;
  close: () => void;
  doDelete: () => void;
  pipelineName: string;
};

export const DeleteDialog: FunctionComponent<Props> = ({
  isOpen,
  pipelineName,
  close,
  doDelete,
}) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const isDisabled = inputText.toLocaleLowerCase() !== 'delete';
  const closeCallback = useCallback(() => {
    setInputText('');
    close();
  }, [close]);
  return (
    <EditModal
      title={`${t('delete')} "${pipelineName}"?`}
      width={450}
      visible={isOpen}
      close={closeCallback}
    >
      <p>{t('delete-ext-pipeline-desc')}</p>
      <p>{t('delete-ext-pipeline-confirm', { extPipeline: pipelineName })}</p>
      <p style={{ marginTop: '1.5rem' }}>
        <Input
          id="delete-input-text"
          value={inputText}
          title="Type DELETE to confirm"
          onChange={(ev) => setInputText(ev.target.value)}
          placeholder="Type here"
          fullWidth
        />
      </p>
      <DivFlex justify="flex-end" css="gap: 0.5rem">
        <Button type="ghost" onClick={closeCallback} data-testid="cancel-btn">
          {t('cancel')}
        </Button>
        <Button
          type="danger"
          disabled={isDisabled}
          onClick={doDelete}
          data-testid="delete-btn"
        >
          {t('delete')}
        </Button>
      </DivFlex>
    </EditModal>
  );
};
