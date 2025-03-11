/*!
 * Copyright 2024 Cognite AS
 */
import { Comment } from '@cognite/cogs.js';
import { type BaseInputCommand } from '../../../architecture/base/commands/BaseInputCommand';
import { type ReactNode, useContext } from 'react';
import { InputFieldViewContext } from './InputField.view.context';

export const InputField = ({
  inputCommand
}: {
  inputCommand: BaseInputCommand;
  placement: string;
}): ReactNode => {
  const { useInputFieldViewModel } = useContext(InputFieldViewContext);

  const {
    key,
    placeholder,
    content,
    setContent,
    postButtonEnabled,
    onPostMessage,
    postLabel,
    cancelLabel,
    onCancel
  } = useInputFieldViewModel(inputCommand);

  return (
    <Comment
      key={key}
      placeholder={placeholder}
      message={content}
      setMessage={setContent}
      onPostMessage={onPostMessage}
      postButtonText={postLabel}
      postButtonDisabled={!postButtonEnabled}
      cancelButtonText={cancelLabel}
      cancelButtonDisabled={false}
      onCancel={onCancel}
      showButtons={true}
    />
  );
};
