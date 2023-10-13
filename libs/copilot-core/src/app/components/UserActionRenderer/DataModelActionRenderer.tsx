import { useMemo, useState } from 'react';

import styled from 'styled-components';

import { useBotUI } from '@botui/react';

import {
  Body,
  Button,
  Flex,
  Select,
  SelectComponents,
  Tooltip,
} from '@cognite/cogs.js';

import { CopilotDataModelSelectionResponse } from '../../../lib/types';
import { useDataModels } from '../../hooks/useDataModels';

export const DataModelActionRenderer = () => {
  const [selectedDataModels, setSelectedDataModels] = useState<
    {
      dataModel: string;
      space: string;
      version: string;
    }[]
  >([]);
  const { data: dataModels = [] } = useDataModels();

  const bot = useBotUI();

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

  return (
    <Wrapper direction="column" gap={6}>
      <Body level={2}>Select a data model</Body>
      <Select
        placeholder="Select data models"
        isMulti
        menuPortalTarget={document.body}
        components={{ ...SelectComponents, Option: CustomOption }}
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
            setSelectedDataModels([]);
            return;
          }
          setSelectedDataModels(values);
          return;
        }}
      />
      <Button
        id="confirm"
        type="primary"
        onClick={() => {
          bot.next(
            {
              content: 'Selected data models',
              dataModels: selectedDataModels,
              source: 'user',
              messageType: 'data-models',
              type: 'data-models',
            } as CopilotDataModelSelectionResponse,
            { messageType: 'data-models' }
          );
        }}
        disabled={!(selectedDataModels.length > 0)}
      >
        Confirm
      </Button>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  padding: 8px;
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
