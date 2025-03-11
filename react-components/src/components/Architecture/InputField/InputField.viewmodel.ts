import { useCallback, useContext, useMemo, useState } from 'react';
import { InputFieldContext } from './InputField.viewmodel.context';
import { TranslationInput } from '../../../architecture';
import { getDefaultCommand } from '../utilities';
import { BaseInputCommand } from '../../../architecture/base/commands/BaseInputCommand';
import { useOnUpdate } from '../useOnUpdate';

export function useInputFieldViewModel(inputCommand: BaseInputCommand) {
  const { useRenderTarget, useTranslation } = useContext(InputFieldContext);

  const { t } = useTranslation();

  const renderTarget = useRenderTarget();

  const command = useMemo(() => getDefaultCommand(inputCommand, renderTarget), [inputCommand]);

  const [enabled, setEnabled] = useState<boolean>(command.isEnabled);

  const [postLabel, setPostLabel] = useState<string | undefined>(
    translateIfExists(command.getPostButtonLabel(), t)
  );
  const [cancelLabel, setCancelLabel] = useState<string | undefined>(
    translateIfExists(command.getCancelButtonLabel(), t)
  );
  const [placeholder, setPlaceholder] = useState<string | undefined>(
    translateIfExists(command.getPlaceholder(), t)
  );

  useOnUpdate(command, () => {
    setContent(command.content);
    setEnabled(command.isEnabled);
    setPostLabel(translateIfExists(command.getPostButtonLabel(), t));
    setCancelLabel(translateIfExists(command.getCancelButtonLabel(), t));
    setPlaceholder(translateIfExists(command.getPlaceholder(), t));
  });

  const setContent = useCallback(
    (content: string) => {
      command.content = content;
    },
    [command]
  );

  const onPostMessage = useCallback(() => {
    command.invoke();
    setContent('');
  }, [command, setContent]);

  return {
    key: command.uniqueId,
    placeholder,
    content: command.content,
    setContent,
    postButtonEnabled: command.isEnabled,
    onPostMessage,
    postLabel,
    cancelLabel,
    onCancel: command.onCancel
  };
}

function translateIfExists(
  translationInput: TranslationInput | undefined,
  t: (translationInput: TranslationInput) => string
): string | undefined {
  return translationInput !== undefined ? t(translationInput) : undefined;
}
