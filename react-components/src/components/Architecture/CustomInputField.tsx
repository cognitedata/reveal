import { Button, Comment, Flex, Input, Textarea } from '@cognite/cogs.js';
import {
  type BaseSyntheticEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useMemo,
  useState
} from 'react';
import { type BaseCommand } from '../../architecture';
import {
  CustomBaseInputCommand,
  type FieldContent
} from '../../architecture/base/commands/CustomBaseInputCommand';
import styled from 'styled-components';
import { type PlacementType } from './types';
import { useCommand } from './hooks/useCommand';
import { useCommandEnable } from './hooks/useCommandProps';
import { translateIfExists } from '../../architecture/base/utilities/translation/translateUtils';
import { useCommandProperty } from './hooks/useCommandProperty';

export function createCustomInputField(
  command: BaseCommand,
  placement: PlacementType
): ReactElement | undefined {
  if (command instanceof CustomBaseInputCommand) {
    return <CustomInputField key={command.uniqueId} inputCommand={command} placement={placement} />;
  }
  return undefined;
}

export const CustomInputField = ({
  inputCommand
}: {
  inputCommand: CustomBaseInputCommand;
  placement: string;
}): ReactNode => {
  const command = useCommand(inputCommand);
  const isEnabled = useCommandEnable(command);
  const postLabel = useCommandProperty(command, () =>
    translateIfExists(command.getPostButtonLabel())
  );
  const cancelLabel = useCommandProperty(command, () =>
    translateIfExists(command.getCancelButtonLabel())
  );
  const placeholders = useCommandProperty(command, () => {
    return command.getAllPlaceholders()?.map((placeholder) => translateIfExists(placeholder));
  });

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
          disabled={!isEnabled}
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
            disabled={!isEnabled}
            onClick={() => {
              command.onCancel?.();
              setContents([]);
            }}>
            {cancelLabel}
          </Button>
          <Button
            type="primary"
            disabled={postButtonDisabled || !isEnabled}
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
          postButtonDisabled={postButtonDisabled || !isEnabled}
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
