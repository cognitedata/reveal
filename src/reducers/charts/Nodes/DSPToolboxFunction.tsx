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
import AvailableOps from 'components/NodeEditor/AvailableOps';
import { ConfigPanelComponentProps } from '../types';

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

export const configPanel = ({
  node,
  onUpdateNode,
}: ConfigPanelComponentProps) => {
  const { functionData } = node;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [phrase, setPhrase] = useState<string>('');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [visible, setVisible] = useState<boolean>(false);
  return (
    <ToolFunctionWrapper>
      <h4>Tool Function</h4>
      <AvailableOps
        renderLoading={() => <Icon style={{ color: 'white' }} type="Loading" />}
        renderError={() => <Icon style={{ color: 'white' }} type="XLarge" />}
        renderCall={(availableFunctions) => {
          const categories: { [key: string]: DSPFunction[] } = {};
          availableFunctions.forEach((func) => {
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
                        <>
                          <Menu.Submenu
                            disabled={filtered.length === 0}
                            content={
                              <Menu>
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
                                      const {
                                        type_info,
                                        ...storableNextFunc
                                      } = func;

                                      const inputPins = (
                                        getConfigFromDspFunction(func).input ||
                                        []
                                      )
                                        .filter((input) => input.pin)
                                        .map((input) => ({
                                          id: input.field,
                                          title: input.name,
                                          types: input.types,
                                        }));

                                      const outputPins = (
                                        getConfigFromDspFunction(func).output ||
                                        []
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
                        </>
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
                {functionData?.toolFunction?.description ||
                  'Select tool function'}
              </Button>
            </Dropdown>
          );
        }}
      />

      {functionData?.toolFunction?.parameters?.length > 0 &&
        (functionData?.toolFunction?.parameters || []).map(
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
                  <Input
                    id={param}
                    value={functionData[param] || _default || ''}
                    onChange={({
                      target,
                    }: React.ChangeEvent<HTMLInputElement>) => {
                      onUpdateNode({
                        functionData: {
                          ...node.functionData,
                          [param]: transformParamInput(type, target.value),
                        },
                      });
                    }}
                  />
                )}
              </div>
            );
          }
        )}
    </ToolFunctionWrapper>
  );
};

export const node = {
  title: 'Toolbox Function',
  subtitle: 'Toolbox Function',
  color: '#9118af',
  icon: 'Function',
  inputPins: [],
  outputPins: [],
  functionEffectReference: effectId,
  functionData: {
    toolFunction: '',
  },
} as StorableNode;
