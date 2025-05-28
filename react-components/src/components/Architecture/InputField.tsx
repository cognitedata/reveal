/*!
 * Copyright 2024 Cognite AS
 */
import { Comment } from '@cognite/cogs.js';
import { type BaseInputCommand } from '../../architecture/base/commands/BaseInputCommand';
import { type ReactNode } from 'react';
import { useTranslation } from '../i18n/I18n';
import { type TranslationInput } from '../../architecture';
import { useCommand } from './useCommand';
import { useCommandProps } from './useCommandProps';
import { useCommandProperty } from './useCommandProperty';

export const InputField = ({ inputCommand }: { inputCommand: BaseInputCommand }): ReactNode => {
  const { t } = useTranslation();
  const command = useCommand(inputCommand);

  const content = useCommandProperty(command, () => command.content);
  const postLabel = useCommandProperty(command, () => translate(command.getPostButtonLabel()));
  const cancelLabel = useCommandProperty(command, () => translate(command.getCancelButtonLabel()));
  const placeholder = useCommandProperty(command, () => translate(command.getPlaceholder()));
  const isPostButtonEnabled = useCommandProperty(command, () => command.isPostButtonEnabled);

  const { uniqueId, isVisible, isEnabled } = useCommandProps(command);

  if (!isVisible) {
    return <></>;
  }

  return (
    <Comment
      key={uniqueId}
      placeholder={placeholder}
      message={content}
      setMessage={(content) => (command.content = content)}
      onPostMessage={() => {
        command.invoke();
        command.content = '';
      }}
      postButtonText={postLabel}
      postButtonDisabled={!(isPostButtonEnabled && isEnabled)}
      cancelButtonText={cancelLabel}
      cancelButtonDisabled={false}
      onCancel={command.onCancel}
      showButtons={true}
    />
  );

  function translate(input: TranslationInput | undefined): string | undefined {
    return input !== undefined ? t(input) : undefined;
  }
};
