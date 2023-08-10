import { useMemo } from 'react';

import styled from 'styled-components';

import {
  Body,
  Button,
  Flex,
  Select,
  Tooltip,
  SelectComponents,
} from '@cognite/cogs.js';

import {
  CopilotBotMessage,
  CopilotDataModelSelectionMessage,
  _DeprecatedCopilotDataModelSelectionMessage,
} from '../../../lib/types';
import { useDataModels } from '../../hooks/useDataModels';

import { MessageBase } from './MessageBase';

const CustomOption = ({
  innerRef,
  innerProps,
  children,
  getStyles,
  cx,
  ...props
}: {
  innerRef: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
  innerProps: any;
  cx: any;
  getStyles: any;
  data: { tooltip: string };
}) => {
  return (
    <Tooltip ref={innerRef} {...props} content={props.data.tooltip}>
      <Option
        className={cx(getStyles('option', props))}
        {...props}
        {...innerProps}
        style={{ cursor: 'pointer' }}
      >
        {children}
      </Option>
    </Tooltip>
  );
};

export const DataModelMessage = ({
  message: {
    key,
    data: message,
    meta: { updateMessage },
  },
}: {
  message: {
    key: number;
    data:
      | CopilotDataModelSelectionMessage
      | _DeprecatedCopilotDataModelSelectionMessage;
    meta: { updateMessage: (key: number, message: CopilotBotMessage) => void };
  };
}) => {
  const { data: dataModels = [] } = useDataModels();

  const dataModelOptions = useMemo(
    () =>
      dataModels.map((el) => ({
        dataModel: el.externalId,
        space: el.space,
        version: el.version,
        value: el.externalId,
        label: el.name || `<${el.externalId}>`,
        tooltip: `${el.name} <${el.externalId}> [${el.space}]`,
      })),
    [dataModels]
  );

  const selectedDataModels = useMemo(() => {
    if (message.type === 'data-model') {
      if (message.dataModel && message.space && message.version) {
        return [
          {
            dataModel: message.dataModel,
            space: message.space,
            version: message.version,
          },
        ];
      }
      return [];
    }
    return message.dataModels;
  }, [message]);

  return (
    <MessageBase
      message={{ data: { ...message, source: 'bot' } as any }}
      hideActions
    >
      <Wrapper direction="column" gap={6}>
        <Body level={2}>{message.content}</Body>
        <Select
          placeholder="Select data models"
          isMulti
          menuPortalTarget={document.body}
          components={{ ...SelectComponents, Option: CustomOption }}
          disabled={!message.pending}
          value={
            selectedDataModels
              ? dataModelOptions.filter((el) =>
                  selectedDataModels.some(
                    (selected) =>
                      selected.dataModel === el.dataModel &&
                      selected.space === el.space
                  )
                )
              : undefined
          }
          options={dataModelOptions}
          onChange={(
            values: {
              dataModel: string;
              space: string;
              version: string;
            }[]
          ) => {
            if (!values) {
              if (message.type === 'data-model') {
                return;
              } else {
                updateMessage(key, {
                  ...message,
                  dataModels: values || [],
                });
              }
              return;
            }
            if (message.type === 'data-model') {
              return;
            } else {
              updateMessage(key, {
                ...message,
                dataModels: values,
              });
            }
          }}
        />
        {message.pending && (
          <Button
            id="confirm"
            type="primary"
            onClick={() => {
              updateMessage(key, {
                ...message,
                pending: false,
              } as CopilotDataModelSelectionMessage);
            }}
            disabled={!(selectedDataModels.length > 0)}
          >
            Confirm
          </Button>
        )}
      </Wrapper>
    </MessageBase>
  );
};

const Wrapper = styled(Flex)`
  #confirm {
    margin-top: 6px;
  }
`;

const Option = styled.div<{ isSelected: boolean }>`
  padding: 8px 4px;
  color: ${(props) => (props.isSelected ? 'var(--cogs-primary)' : 'black')};
  border-radius: 4px;
  transition: all 0.2s;

  &&:hover {
    background: var(--cogs-surface--status-undefined--muted--hover);
  }
`;
