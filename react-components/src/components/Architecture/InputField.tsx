/*!
 * Copyright 2024 Cognite AS
 */
import { Comment } from '@cognite/cogs.js';
import { type BaseInputCommand } from '../../architecture/base/commands/BaseInputCommand';
import { type ReactNode, useState } from 'react';
import { useTranslation } from '../i18n/I18n';

export const InputField = ({
  inputCommand
}: {
  inputCommand: BaseInputCommand;
  placement: string;
}): ReactNode => {
  const [content, setContent] = useState<string>('');
  const { t } = useTranslation();

  const cancelButtonLabel = inputCommand.getCancelButtonLabel(t);

  return (
    <Comment
      key={inputCommand.uniqueId}
      placeholder={inputCommand.getPlaceholder(t)}
      message={content}
      setMessage={setContent}
      onPostMessage={() => inputCommand.invokeWithContent(content)}
      postButtonText={inputCommand.getPostButtonLabel(t)}
      cancelButtonText={cancelButtonLabel}
      cancelButtonDisabled={false}
      onCancel={inputCommand.onCancel}
      showButtons={true}
    />
  );
};
