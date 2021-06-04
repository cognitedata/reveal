/* eslint camelcase: 0 */

import React, { useState } from 'react';
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

const ToolFunctionWrapper = styled.div`
  .cogs-checkbox .checkbox-ui {
    margin: 0;
  }
`;

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
  onUpdateNode,
}: ConfigPanelComponentProps) => {
  const { functionData } = node;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [phrase, setPhrase] = useState<string>('');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [visible, setVisible] = useState<boolean>(false);

  const [isLoading, error, operations] = useAvailableOps();

  const renderAvailableOperations = (availableOperations: DSPFunction[]) => {
    const categories: { [key: string]: DSPFunction[] } = {};

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

    return (
      <Dropdown
        visible={visible}
        onClickOutside={() => setVisible(false)}
        content={
          <>
            <Input
              id="phrase"
              value={phrase}
              onChange={(newValue: React.ChangeEvent<HTMLInputElement>) =>
                setPhrase(newValue.target.value)
              }
              placeholder="Search tool function..."
              fullWidth
            />
            <Menu>
              <Menu.Header>Tool Functions</Menu.Header>
              {Object.keys(categories).map((category) => {
                const filtered = categories[
                  category
                ].filter(({ description }) =>
                  description.toLowerCase().includes(phrase.toLowerCase())
                );
                return (
                  <React.Fragment key={category}>
                    <Menu.Submenu
                      disabled={filtered.length === 0}
                      content={
                        <Menu style={{ maxHeight: 615, overflowY: 'auto' }}>
                          <Menu.Header>{category}</Menu.Header>
                          {filtered.map((func) => (
                            <Menu.Item
                              key={func.description}
                              appendIcon={
                                func.description ===
                                functionData?.toolFunction?.description
                                  ? 'Checkmark'
                                  : undefined
                              }
                              onClick={() => {
                                const { type_info, ...storableNextFunc } = func;

                                const inputPins = (
                                  getConfigFromDspFunction(func).input || []
                                )
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
                                  title: func.description,
                                  functionData: {
                                    ...functionData,
                                    toolFunction: storableNextFunc,
                                  },
                                });
                                setVisible(false);
                                trackUsage('ChartView.SelectFunction', {
                                  function: func.description,
                                });
                              }}
                            >
                              <span style={{ textAlign: 'left' }}>
                                {func.description}
                              </span>
                            </Menu.Item>
                          ))}
                        </Menu>
                      }
                    >
                      <>
                        {category} ({filtered.length})
                      </>
                    </Menu.Submenu>
                  </React.Fragment>
                );
              })}
            </Menu>
          </>
        }
      >
        <Button
          icon="Down"
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
          {functionData?.toolFunction?.description || 'Select tool function'}
        </Button>
      </Dropdown>
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
