import { Comment } from '@cognite/cogs.js';
import { BaseInputCommand } from '../../architecture/base/commands/BaseInputCommand';
import { type ReactElement, type ReactNode } from 'react';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand, type TranslationInput } from '../../architecture';
import { useCommand } from './hooks/useCommand';
import { useCommandProps } from './hooks/useCommandProps';
import { useCommandProperty } from './hooks/useCommandProperty';
import { type IReactElementCreator } from './Factories/IReactElementCreator';
import { type PlacementType } from './types';
import { installReactElement } from './Factories/ReactElementFactory';

export class InputFieldCreator implements IReactElementCreator {
  create(command: BaseCommand, _: PlacementType): ReactElement | undefined {
    if (command instanceof BaseInputCommand) {
      return <InputField key={command.uniqueId} inputCommand={command} />;
    }
    return undefined;
  }
}

installReactElement(new InputFieldCreator());

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
