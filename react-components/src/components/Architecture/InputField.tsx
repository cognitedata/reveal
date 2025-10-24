import { Comment } from '@cognite/cogs.js';
import { BaseInputCommand } from '../../architecture/base/commands/BaseInputCommand';
import { type ReactElement, type ReactNode } from 'react';
import { useCommand } from './hooks/useCommand';
import { useCommandProps } from './hooks/useCommandProps';
import { useCommandProperty } from './hooks/useCommandProperty';
import { translateIfExists } from '../../architecture/base/utilities/translation/translateUtils';
import { type BaseCommand } from '../../architecture';
import { type PlacementType } from './types';

export function createInputField(command: BaseCommand, _: PlacementType): ReactElement | undefined {
  if (command instanceof BaseInputCommand) {
    return <InputField key={command.uniqueId} inputCommand={command} />;
  }
  return undefined;
}

export const InputField = ({ inputCommand }: { inputCommand: BaseInputCommand }): ReactNode => {
  const command = useCommand(inputCommand);

  const content = useCommandProperty(command, () => command.content);
  const postLabel = useCommandProperty(command, () =>
    translateIfExists(command.getPostButtonLabel())
  );
  const cancelLabel = useCommandProperty(command, () =>
    translateIfExists(command.getCancelButtonLabel())
  );
  const placeholder = useCommandProperty(command, () =>
    translateIfExists(command.getPlaceholder())
  );
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
};
