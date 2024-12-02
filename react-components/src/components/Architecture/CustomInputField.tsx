/*!
 * Copyright 2024 Cognite AS
 */
import { Comment, Flex, Input } from '@cognite/cogs.js';
import { type BaseSyntheticEvent, type ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from '../i18n/I18n';
import { useOnUpdate } from './useOnUpdate';
import { getDefaultCommand } from './utilities';
import { useRenderTarget } from '../RevealCanvas';
import { type TranslationInput } from '../../architecture';
import {
  type FieldContent,
  type CustomBaseInputCommand
} from '../../architecture/base/commands/CustomBaseInputCommand';

export const CustomInputField = ({
  inputCommand
}: {
  inputCommand: CustomBaseInputCommand;
  placement: string;
}): ReactNode => {
  const { t } = useTranslation();
  const translateIfExists = (translationInput: TranslationInput | undefined): string | undefined =>
    translationInput !== undefined ? t(translationInput) : undefined;

  const renderTarget = useRenderTarget();

  const command = useMemo(() => getDefaultCommand(inputCommand, renderTarget), [inputCommand]);
  const [enabled, setEnabled] = useState<boolean>(command.isEnabled);
  const [postLabel, setPostLabel] = useState<string | undefined>(
    translateIfExists(command.getPostButtonLabel())
  );
  const [cancelLabel, setCancelLabel] = useState<string | undefined>(
    translateIfExists(command.getCancelButtonLabel())
  );

  const initialContents = useMemo(() => {
    return command.contents.map((fieldContent) => ({
      type: fieldContent.type,
      content: fieldContent.content
    }));
  }, [command]);

  const [contents, setContents] = useState<FieldContent[]>(initialContents);

  const initialPlaceholderLabels = command
    .getAllPlaceholders()
    ?.map((placeholder) => translateIfExists(placeholder));

  const [placeholders, setPlaceholders] = useState<Array<string | undefined> | undefined>(
    initialPlaceholderLabels
  );

  useOnUpdate(command, () => {
    setPostLabel(translateIfExists(command.getPostButtonLabel()));
    setCancelLabel(translateIfExists(command.getCancelButtonLabel()));
    setPlaceholders(
      command.getAllPlaceholders()?.map((placeholder) => translateIfExists(placeholder))
    );
    setEnabled(command.isEnabled);
  });

  const handleSetContents = useCallback(
    (index: number, data: string) => {
      const newContents = contents !== undefined ? [...contents] : [];
      newContents[index].content = newContents[index] !== undefined ? data : '';
      setContents(newContents);
    },
    [contents, setContents]
  );

  const fields = command.contents.map((fieldContent, index) => {
    if (fieldContent.type === 'text') {
      return (
        <Input
          key={index}
          value={contents?.[index]?.content ?? ''}
          disabled={!enabled}
          onChange={(data: BaseSyntheticEvent) => {
            handleSetContents(index, data.target.value as string);
          }}
          placeholder={placeholders?.[index]}
        />
      );
    }
    if (fieldContent.type === 'commentWithButtons') {
      return (
        <Comment
          key={index}
          placeholder={placeholders?.[index]}
          message={contents?.[index]?.content ?? ''}
          setMessage={(data) => {
            handleSetContents(index, data);
          }}
          onPostMessage={() => {
            command.invokeWithContent(contents ?? []);
            setContents([]);
          }}
          postButtonText={postLabel}
          postButtonDisabled={!enabled}
          cancelButtonText={cancelLabel}
          cancelButtonDisabled={false}
          onCancel={command.onCancel}
          showButtons={true}
        />
      );
    }
    return null;
  });

  return (
    <Flex direction="column" gap={8}>
      {fields}
    </Flex>
  );
};
