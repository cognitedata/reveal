/*!
 * Copyright 2024 Cognite AS
 */
import { Comment } from '@cognite/cogs.js';
import { type BaseInputCommand } from '../../architecture/base/commands/BaseInputCommand';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../i18n/I18n';
import { useOnUpdate } from './useOnUpdate';
import { getDefaultCommand } from './utilities';
import { useRenderTarget } from '../RevealCanvas';
import { type TranslationInput } from '../../architecture';

export const InputField = ({
  inputCommand
}: {
  inputCommand: BaseInputCommand;
  placement: string;
}): ReactNode => {
  const { t } = useTranslation();
  const translateIfExists = (translationInput: TranslationInput | undefined): string | undefined =>
    translationInput !== undefined ? t(translationInput) : undefined;

  const renderTarget = useRenderTarget();

  const command = useMemo(() => getDefaultCommand(inputCommand, renderTarget), [inputCommand]);

  const [content, setContent] = useState<string>('');
  const [enabled, setEnabled] = useState<boolean>(command.isEnabled);
  const [postLabel, setPostLabel] = useState<string | undefined>(
    translateIfExists(command.getPostButtonLabel())
  );
  const [cancelLabel, setCancelLabel] = useState<string | undefined>(
    translateIfExists(command.getCancelButtonLabel())
  );
  const [placeholder, setPlaceholder] = useState<string | undefined>(
    translateIfExists(command.getPlaceholder())
  );

  useOnUpdate(command, () => {
    setContent(command.content);
    setEnabled(command.isEnabled);
    setPostLabel(translateIfExists(command.getPostButtonLabel()));
    setCancelLabel(translateIfExists(command.getCancelButtonLabel()));
    setPlaceholder(translateIfExists(command.getPlaceholder()));
  });

  return (
    <Comment
      key={command.uniqueId}
      placeholder={placeholder}
      message={content}
      setMessage={(content) => {
        command.content = content;
      }}
      onPostMessage={() => {
        command.invoke();
        setContent('');
      }}
      postButtonText={postLabel}
      postButtonDisabled={!enabled}
      cancelButtonText={cancelLabel}
      cancelButtonDisabled={false}
      onCancel={command.onCancel}
      showButtons={true}
    />
  );
};
