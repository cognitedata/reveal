import { Button, Comment, Flex, Input, Textarea } from '@cognite/cogs.js';
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
import styled from 'styled-components';

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
  const [postButtonDisabled, setPostButtonDisabled] = useState(true);

  const initialContents = useMemo(() => {
    return command.contents.map((fieldContent) => {
      if (fieldContent.type === 'submitButtons') {
        return { type: fieldContent.type, content: undefined };
      }
      if (fieldContent.type === 'customInput') {
        return { type: fieldContent.type, content: fieldContent.content };
      }
      return { type: fieldContent.type, content: fieldContent.content };
    });
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

      const isAnyTextContentEmpty = newContents.some(
        (fieldContent) =>
          fieldContent.type === 'text' && (fieldContent?.content ?? '').trim() === ''
      );
      setPostButtonDisabled(isAnyTextContentEmpty);
    },
    [contents, setContents]
  );

  const fields = contents.map((fieldContent, index) => {
    if (fieldContent.type === 'text') {
      return (
        <Input
          key={index}
          value={fieldContent.content}
          disabled={!enabled}
          onChange={(data: BaseSyntheticEvent) => {
            handleSetContents(index, data.target.value as string);
          }}
          placeholder={placeholders?.[index]}
        />
      );
    }
    if (fieldContent.type === 'comment') {
      return (
        <Textarea
          key={index}
          placeholder={placeholders?.[index]}
          value={fieldContent.content}
          onChange={(data: BaseSyntheticEvent) => {
            handleSetContents(index, data.target.value as string);
          }}
        />
      );
    }
    if (fieldContent.type === 'customInput') {
      return fieldContent.content;
    }
    if (fieldContent.type === 'submitButtons') {
      return (
        <Flex key={index} gap={8}>
          <Button
            type="secondary"
            disabled={!enabled}
            onClick={() => {
              command.onCancel?.();
              setContents([]);
            }}>
            {cancelLabel}
          </Button>
          <Button
            type="primary"
            disabled={postButtonDisabled || !enabled}
            onClick={() => {
              command.invokeWithContent(contents ?? []);
              setContents([]);
            }}>
            {postLabel}
          </Button>
        </Flex>
      );
    }
    if (fieldContent.type === 'commentWithButtons') {
      return (
        <Comment
          key={index}
          placeholder={placeholders?.[index]}
          message={fieldContent.content}
          setMessage={(data) => {
            handleSetContents(index, data);
          }}
          onPostMessage={() => {
            command.invokeWithContent(contents ?? []);
            setContents([]);
          }}
          postButtonText={postLabel}
          postButtonDisabled={postButtonDisabled || !enabled}
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
    <StyledFlex direction="column" gap={8}>
      {fields}
    </StyledFlex>
  );
};

const StyledFlex = styled(Flex)`
  padding: 6px;
`;
