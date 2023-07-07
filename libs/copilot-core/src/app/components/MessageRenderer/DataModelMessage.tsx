import { useMemo } from 'react';

import styled from 'styled-components';

import { Body, Button, Flex, Select, Tooltip } from '@cognite/cogs.js';

import {
  CopilotBotMessage,
  CopilotDataModelSelectionMessage,
} from '../../../lib/types';
import { useDataModel, useDataModels } from '../../hooks/useDataModels';

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
    data: CopilotDataModelSelectionMessage;
    meta: { updateMessage: (key: number, message: CopilotBotMessage) => void };
  };
}) => {
  const { data: dataModels = [] } = useDataModels();
  const { data: dataModelVersions = [] } = useDataModel(
    dataModels.find((el) => el.externalId === message.dataModel)?.space,
    dataModels.find((el) => el.externalId === message.dataModel)?.externalId
  );

  const dataModelOptions = useMemo(
    () =>
      dataModels.map((el) => ({
        space: el.space,
        value: el.externalId,
        version: el.version,
        label: el.name || `<${el.externalId}>`,
        tooltip: `${el.name} <${el.externalId}> [${el.space}]`,
      })),
    [dataModels]
  );

  const versionOptions = useMemo(
    () =>
      dataModelVersions.map((el) => ({
        value: el.version,
        label: el.version,
      })),
    [dataModelVersions]
  );
  return (
    <MessageBase message={{ source: 'bot', content: message.content }}>
      <Flex direction="column">
        <Body level={2}>{message.content}</Body>
        <Select
          label="Select data model"
          menuPortalTarget={document.body}
          components={{ Option: CustomOption }}
          disabled={!message.pending}
          value={
            message.dataModel
              ? dataModelOptions.find((el) => el.value === message.dataModel)
              : undefined
          }
          options={dataModelOptions}
          onChange={({
            value,
            version,
            space,
          }: {
            value: string;
            space: string;
            version: string;
          }) => {
            updateMessage(key, {
              ...message,
              dataModel: value,
              space,
              version,
            });
          }}
        />
        {message.dataModel && (
          <Select
            label="Select version"
            menuPortalTarget={document.body!}
            disabled={!message.pending}
            value={
              message.version
                ? { label: message.version, value: message.version }
                : undefined
            }
            options={versionOptions}
            onChange={({ value }: { value: string }) => {
              updateMessage(key, { ...message, version: value });
            }}
          />
        )}
        {message.pending && (
          <Button
            onClick={() => {
              updateMessage(key, { ...message, pending: false });
            }}
            disabled={!(message.version && message.dataModel && message.space)}
          >
            Confirm
          </Button>
        )}
      </Flex>
    </MessageBase>
  );
};

const Option = styled.div<{ isSelected: boolean }>`
  padding: 8px 4px;
  color: ${(props) => (props.isSelected ? 'var(--cogs-primary)' : 'black')};
  border-radius: 4px;
  transition: all 0.2s;

  &&:hover {
    background: var(--cogs-surface--status-undefined--muted--hover);
  }
`;
