/*!
 * Copyright 2024 Cognite AS
 */
import { Comment } from '@cognite/cogs.js';
import { type BaseInputCommand } from '../../architecture/base/commands/BaseInputCommand';
import { type ReactNode, useState } from 'react';
import { useTranslation } from '../i18n/I18n';
import { useOnUpdate } from './useOnUpdate';

export const InputField = ({
  inputCommand
}: {
  inputCommand: BaseInputCommand;
  placement: string;
}): ReactNode => {
  const { t } = useTranslation();

  const [content, setContent] = useState<string>('');
  const [enabled, setEnabled] = useState<boolean>(inputCommand.isEnabled);
  const [postLabel, setPostLabel] = useState<string | undefined>(
    inputCommand.getPostButtonLabel(t)
  );
  const [cancelLabel, setCancelLabel] = useState<string | undefined>(
    inputCommand.getCancelButtonLabel(t)
  );
  const [placeholder, setPlaceholder] = useState<string | undefined>(
    inputCommand.getPlaceholder(t)
  );

  useOnUpdate(inputCommand, () => {
    setPostLabel(inputCommand.getPostButtonLabel(t));
    setCancelLabel(inputCommand.getCancelButtonLabel(t));
    setPlaceholder(inputCommand.getPlaceholder(t));
    setEnabled(inputCommand.isEnabled);
  });

  return (
    <Comment
      key={inputCommand.uniqueId}
      placeholder={placeholder}
      message={content}
      setMessage={setContent}
      onPostMessage={() => inputCommand.invokeWithContent(content)}
      postButtonText={postLabel}
      postButtonDisabled={!enabled}
      cancelButtonText={cancelLabel}
      cancelButtonDisabled={false}
      onCancel={inputCommand.onCancel}
      showButtons={true}
    />
  );
};
