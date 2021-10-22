/* eslint camelcase: 0 */

import {
  Operation,
  OperationParameters,
  OperationParametersTypeEnum,
} from '@cognite/calculation-backend';
import {
  Button,
  Checkbox,
  Dropdown,
  Icon,
  Input,
  Menu,
  Modal,
  Select,
  Tooltip,
} from '@cognite/cogs.js';
import { useAvailableOps } from 'components/NodeEditor/AvailableOps';
import * as React from 'react';
import { useState } from 'react';
import { StorableNode } from 'models/chart/types';
import styled from 'styled-components';
import { trackUsage } from 'services/metrics';
import {
  getConfigFromDspFunction,
  transformParamInput,
} from 'utils/transforms';
import Layers from 'utils/z-index';
import { DSPToolboxFunctionInput } from './DSPToolboxFunctionInput';
import { ConfigPanelComponentProps } from '.';

type FunctionData = {
  [key: string]: any;
  toolFunction?: Operation;
};

export const effect = async (funcData: FunctionData) => {
  if (!funcData.toolFunction) {
    throw new Error('No external id given in config');
  }
  if (!funcData.tenant) {
    throw new Error('Did not get a tenant');
  }

  return {};
};

export const effectId = 'TOOLBOX_FUNCTION';

export const ConfigPanel = ({
  node,
  nodes,
  onUpdateNode,
}: ConfigPanelComponentProps) => {
  const { functionData } = node;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [phrase, setPhrase] = useState<string>('');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedFunction, setSelectedFunction] = useState<Operation>();

  const [isLoading, error, operations] = useAvailableOps();

  const getCategories = (availableOperations: Operation[]) => {
    const categories: { [key: string]: Operation[] } = {};

    categories.Recent = [];

    nodes?.forEach((n) => {
      const toolFunction = n?.functionData?.toolFunction;

      if (toolFunction) {
        const isFunctionInRecent = categories.Recent.some(
          ({ op }) => op.toLowerCase() === toolFunction.op.toLowerCase()
        );

        if (!isFunctionInRecent) {
          const operation = availableOperations.find(
            (op) => op.op.toLowerCase() === toolFunction.op.toLowerCase()
          );

          if (operation) {
            categories.Recent.push(operation);
          }
        }
      }
    });

    availableOperations.forEach((func) => {
      if (Array.isArray(func.category)) {
        func.category.forEach((category) => {
          if (!categories[category]) {
            categories[category] = [];
          }
          categories[category].push(func);
        });
      } else {
        if (!categories[func.category]) {
          categories[func.category] = [];
        }
        categories[func.category].push(func);
      }
    });

    return categories;
  };

  const renderFunctionsList = (
    category: string,
    toolFunctions: Operation[]
  ) => {
    return (
      <>
        <Menu.Header>{category}</Menu.Header>
        {toolFunctions.filter(Boolean).map((func) => (
          <Menu.Item
            key={func.name}
            onClick={() => {
              const { ...storableNextFunc } = func;

              const inputPins = (getConfigFromDspFunction(func).input || [])
                .filter((input) => input.pin)
                .map((input) => ({
                  id: input.field,
                  title: input.name,
                  types: input.types,
                }));

              const outputPins = (
                getConfigFromDspFunction(func).output || []
              ).map((output) => ({
                id: `out-${output.field}`,
                title: output.name,
                type: output.type,
              }));

              onUpdateNode({
                inputPins,
                outputPins,
                title: func.name,
                functionData: {
                  ...functionData,
                  toolFunction: storableNextFunc,
                },
              });
              setIsDropdownVisible(false);
              trackUsage('ChartView.SelectFunction', {
                function: func.name,
              });
            }}
          >
            <FunctionNameWrapper>
              <span style={{ textAlign: 'left' }}>{func.name}</span>
              {func.description && (
                <InfoButton
                  type="Info"
                  id={`${func.op}-info-button`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFunction(func);
                    setIsModalVisible(true);
                  }}
                />
              )}
            </FunctionNameWrapper>
          </Menu.Item>
        ))}
      </>
    );
  };

  const renderSearchResultMenu = (categories: {
    [key: string]: Operation[];
  }) => (
    <Menu>
      {Object.keys(categories).map((category: string) => {
        const filtered = categories[category].filter(({ name }) =>
          name?.toLowerCase().includes(phrase?.toLowerCase())
        );

        return !!filtered.length && renderFunctionsList(category, filtered);
      })}
    </Menu>
  );

  const renderCategoryMenu = (categories: { [key: string]: Operation[] }) => {
    return (
      <Menu style={{ boxShadow: 'none' }}>
        {/* Recent category */}
        {!!categories.Recent.length && (
          <>
            <Menu.Submenu
              content={
                <Menu style={{ maxHeight: 615, overflowY: 'auto' }}>
                  {renderFunctionsList('Recent', categories.Recent)}
                </Menu>
              }
            >
              <span>Recent</span>
            </Menu.Submenu>
            <Menu.Divider />
          </>
        )}
        {/* Toolbox function categories */}
        {Object.entries(categories)
          .filter(([category]) => category !== 'Recent')
          .map(
            ([category, toolFunctions]) =>
              !!toolFunctions.length && (
                <Menu.Submenu
                  key={category}
                  visible={selectedCategory === category}
                  trigger={undefined}
                  content={
                    <Menu style={{ maxHeight: 615, overflowY: 'auto' }}>
                      {renderFunctionsList(category, toolFunctions)}
                    </Menu>
                  }
                >
                  <CategoryItem
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedCategory(category)}
                    onKeyDown={() => setSelectedCategory(category)}
                    style={{ width: '100%', textAlign: 'left' }}
                  >
                    {category}
                  </CategoryItem>
                </Menu.Submenu>
              )
          )}
      </Menu>
    );
  };

  const renderAvailableOperations = (availableOperations: Operation[]) => {
    const categories = getCategories(availableOperations);

    return (
      <ToolboxFunctionsDropdown
        visible={isDropdownVisible}
        // Prevent dropdown from closing on modal click
        onClickOutside={
          !isModalVisible ? () => setIsDropdownVisible(false) : () => {}
        }
        zIndex={Layers.DROPDOWN}
        content={
          <>
            <Input
              id="phrase"
              value={phrase}
              icon="Search"
              onChange={(newValue: React.ChangeEvent<HTMLInputElement>) =>
                setPhrase(newValue.target.value || '')
              }
              placeholder="Search"
              fullWidth
            />
            {phrase
              ? renderSearchResultMenu(categories)
              : renderCategoryMenu(categories)}
          </>
        }
      >
        <Button
          icon="ChevronDownCompact"
          iconPlacement="right"
          onClick={() => {
            setIsDropdownVisible(!isDropdownVisible);
            setSelectedCategory(undefined);
            setTimeout(() => {
              const phraseEl = document.getElementById('phrase');
              if (phraseEl) {
                phraseEl.focus();
              }
            }, 300);
          }}
          style={{ width: '100%' }}
        >
          {functionData?.toolFunction?.name || 'Select tool function'}
        </Button>
      </ToolboxFunctionsDropdown>
    );
  };

  const renderParameter = (parameters: OperationParameters[]) => {
    return parameters.map(
      ({ name, param, description, type, default_value, options = [] }) => {
        const hasAvailableOptions = !!options?.length;

        const inputElement = hasAvailableOptions ? (
          <Select
            theme="dark"
            value={
              (functionData[param] &&
                options.find(({ value }) => value === functionData[param])) ??
              default_value
            }
            options={options.map((option) => ({
              label: option.label || option.value,
              value: option.value,
            }))}
            onChange={(option: { label: string; value: string }) => {
              onUpdateNode({
                functionData: {
                  ...node.functionData,
                  [param]: transformParamInput(type, option.value),
                },
              });
            }}
            closeMenuOnSelect
          />
        ) : (
          <DSPToolboxFunctionInput
            key={param}
            id={param}
            defaultValue={functionData[param] ?? (default_value || '')}
            onChange={(value) => {
              onUpdateNode({
                functionData: {
                  ...node.functionData,
                  [param]: transformParamInput(type, value),
                },
              });
            }}
          />
        );

        return (
          <div style={{ marginTop: 8 }}>
            <Tooltip
              disabled={!description}
              type="primary"
              content={description}
            >
              <ParameterTitle>
                {name || param} <ParameterIcon type="Info" size={12} />
              </ParameterTitle>
            </Tooltip>
            {type === OperationParametersTypeEnum.Bool ? (
              <Checkbox
                onChange={(nextState: boolean) => {
                  onUpdateNode({
                    functionData: {
                      ...node.functionData,
                      [param]: nextState,
                    },
                  });
                }}
                name={param}
                value={functionData[param]}
              />
            ) : (
              inputElement
            )}
          </div>
        );
      }
    );
  };

  const selectedOperation = operations?.find(
    (dspFunction) => dspFunction.op === functionData?.toolFunction?.op
  );

  const parameters = (selectedOperation?.parameters ||
    functionData?.toolFunction?.parameters) as
    | OperationParameters[]
    | undefined;

  return (
    <>
      <h4>Tool Function</h4>
      {error && <Icon style={{ color: 'white' }} type="XLarge" />}
      {isLoading && <Icon style={{ color: 'white' }} type="Loading" />}
      {operations && renderAvailableOperations(operations)}
      {!!parameters?.length && renderParameter(parameters)}
      <InfoModal
        appElement={document.getElementsByTagName('body')}
        title={selectedFunction?.name}
        visible={isModalVisible}
        footer={null}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        width={750}
      >
        <p>{selectedFunction?.description}</p>
      </InfoModal>
    </>
  );
};

const ParameterTitle = styled.h4`
  display: inline-flex;
  align-items: center;
`;

const ParameterIcon = styled(Icon)`
  margin-left: 5px;
`;

const ToolboxFunctionsDropdown = styled(Dropdown)`
  width: 275px;

  .cogs-input-container {
    padding: 8px;

    input,
    input:hover,
    input:focus {
      color: var(--cogs-greyscale-grey7);
      background: var(--cogs-greyscale-grey2) !important;
      box-shadow: none;
    }
  }
`;

const FunctionNameWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  span {
    line-height: 28px;
  }
`;

const InfoButton = styled(Icon)`
  margin-left: 10px;
`;

const InfoModal = styled(Modal)`
  .cogs-modal-header {
    border-bottom: none;
    font-size: var(--cogs-t3-font-size);
  }
`;

const CategoryItem = styled.div`
  height: 100%;
  width: 100%;
  text-align: left;
`;

export const node = {
  title: 'Function',
  subtitle: 'Function',
  color: '#9118af',
  icon: 'Function',
  inputPins: [],
  outputPins: [],
  functionEffectReference: effectId,
  functionData: {
    toolFunction: '',
  },
} as StorableNode;
