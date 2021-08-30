/* eslint camelcase: 0 */

import { useState } from 'react';

import * as React from 'react';
import styled from 'styled-components';
import {
  Icon,
  Input,
  Dropdown,
  Button,
  Menu,
  Checkbox,
} from '@cognite/cogs.js';
import {
  DSPFunction,
  DSPFunctionParameter,
  DSPFunctionParameterType,
  getConfigFromDspFunction,
  transformParamInput,
} from 'utils/transforms';
import { StorableNode } from 'reducers/charts/types';
import { useAvailableOps } from 'components/NodeEditor/AvailableOps';
import { trackUsage } from 'utils/metrics';
import { ConfigPanelComponentProps } from '../types';
import { DSPToolboxFunctionInput } from './DSPToolboxFunctionInput';

type FunctionData = {
  [key: string]: any;
  toolFunction?: DSPFunction;
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
  const [visible, setVisible] = useState<boolean>(false);

  const [isLoading, error, operations] = useAvailableOps();

  const getCategories = (availableOperations: DSPFunction[]) => {
    const categories: { [key: string]: DSPFunction[] } = {};

    categories.Recent = [];

    nodes?.forEach((n) => {
      const toolFunction = n?.functionData?.toolFunction;

      if (toolFunction) {
        categories.Recent.push(toolFunction);
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
    toolFunctions: DSPFunction[]
  ) => {
    return (
      <>
        <Menu.Header>{category}</Menu.Header>
        {toolFunctions.map((func) => (
          <Menu.Item
            key={func.name}
            onClick={() => {
              const { type_info, ...storableNextFunc } = func;

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
              setVisible(false);
              trackUsage('ChartView.SelectFunction', {
                function: func.name,
              });
            }}
          >
            <span style={{ textAlign: 'left' }}>{func.name}</span>
          </Menu.Item>
        ))}
      </>
    );
  };

  const renderSearchResultMenu = (categories: {
    [key: string]: DSPFunction[];
  }) => (
    <Menu>
      {Object.keys(categories).map((category: string) => {
        const filtered = categories[category].filter(({ name }) =>
          name.toLowerCase().includes(phrase.toLowerCase())
        );

        return !!filtered.length && renderFunctionsList(category, filtered);
      })}
    </Menu>
  );

  const renderCategoryMenu = (categories: { [key: string]: DSPFunction[] }) => {
    return (
      <Menu>
        {Object.entries(categories).map(([category, toolFunctions]) => {
          return (
            <React.Fragment key={category}>
              <Menu.Submenu
                content={
                  !!toolFunctions.length && (
                    <Menu
                      className="sub-menu"
                      style={{ maxHeight: 615, overflowY: 'auto' }}
                    >
                      {renderFunctionsList(category, toolFunctions)}
                    </Menu>
                  )
                }
              >
                <>{category}</>
              </Menu.Submenu>
            </React.Fragment>
          );
        })}
      </Menu>
    );
  };

  const renderAvailableOperations = (availableOperations: DSPFunction[]) => {
    const categories = getCategories(availableOperations);

    return (
      <StyledDropdown
        visible={visible}
        onClickOutside={() => setVisible(false)}
        content={
          <>
            <Input
              id="phrase"
              value={phrase}
              icon="Search"
              onChange={(newValue: React.ChangeEvent<HTMLInputElement>) =>
                setPhrase(newValue.target.value)
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
            setVisible(true);
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
      </StyledDropdown>
    );
  };

  const renderParameter = (parameters: any) => {
    return parameters.map(
      ({ param, type, default: _default }: DSPFunctionParameter) => {
        return (
          <div style={{ marginTop: 8 }}>
            <h4>{param}</h4>
            {type === DSPFunctionParameterType.boolean ? (
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
              <DSPToolboxFunctionInput
                key={param}
                id={param}
                defaultValue={functionData[param] || _default || ''}
                onChange={(value) => {
                  onUpdateNode({
                    functionData: {
                      ...node.functionData,
                      [param]: transformParamInput(type, value),
                    },
                  });
                }}
              />
            )}
          </div>
        );
      }
    );
  };

  const hasParameters = functionData?.toolFunction?.parameters?.length > 0;

  const parameters = hasParameters
    ? functionData?.toolFunction?.parameters
    : [];

  return (
    <ToolFunctionWrapper>
      <h4>Tool Function</h4>
      {error && <Icon style={{ color: 'white' }} type="XLarge" />}
      {isLoading && <Icon style={{ color: 'white' }} type="Loading" />}
      {operations && renderAvailableOperations(operations)}
      {hasParameters && renderParameter(parameters)}
    </ToolFunctionWrapper>
  );
};

const ToolFunctionWrapper = styled.div`
  .cogs-checkbox .checkbox-ui {
    margin: 0;
  }
`;

const StyledDropdown = styled(Dropdown)`
  &.cogs-dropdown.tippy-box {
    top: 8px;
    border-radius: 8px;
    color: var(--cogs-greyscale-grey7);
    padding: 8px;

    .cogs-input-container {
      color: var(--cogs-greyscale-grey6);

      input,
      input:hover,
      input:focus {
        width: 100%;
        height: 36px;
        padding-left: 34px;
        border: none;
        border-radius: 6px;
        color: var(--cogs-greyscale-grey7);
        background: #f1f1f1 !important;
        box-shadow: none;
      }

      .cogs-input.with-icon-left ~ .input-icon {
        left: 10px;
      }
    }

    input::placeholder {
      color: var(--cogs-greyscale-grey7);
    }

    .cogs-menu.sub-menu {
      padding: 8px;
    }

    .cogs-menu {
      > span:nth-of-type(1) {
        margin-bottom: 10px;

        > button {
          margin-bottom: 8px;
        }

        &::after {
          position: absolute;
          left: -8px;
          content: ' ';
          display: block;
          border-bottom: 2px solid var(--cogs-greyscale-grey4);
          width: 106.5%;
        }
      }

      padding: 8px 0;
      width: 250px;
      box-shadow: none;
      border: none;
      border-radius: 8px;

      .cogs-menu-header {
        margin: 0;
        color: var(--cogs-greyscale-grey6);
        font-weight: 400;
        text-transform: none;
      }

      .cogs-menu-item:hover {
        color: var(--cogs-greyscale-grey9);
        background: var(--cogs-greyscale-grey3);
      }
    }
  }
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
