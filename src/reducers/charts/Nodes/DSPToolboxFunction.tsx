/* eslint camelcase: 0 */

import React from 'react';
import styled from 'styled-components';
import { Icon, Input, Select, Checkbox } from '@cognite/cogs.js';
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

  return (
    <ToolFunctionWrapper>
      <h4>Tool Function</h4>
      <AvailableOps
        renderLoading={() => <Icon style={{ color: 'white' }} type="Loading" />}
        renderError={() => <Icon style={{ color: 'white' }} type="XLarge" />}
        renderCall={(availableFunctions) => (
          <Select
            theme="dark"
            defaultValue={
              functionData?.toolFunction
                ? {
                    value: functionData?.toolFunction?.op,
                    label: functionData?.toolFunction?.description,
                  }
                : undefined
            }
            onChange={(nextValue: { value: string }) => {
              const nextFunc = availableFunctions.find(
                (x) => x.op === nextValue.value
              );

              if (nextFunc) {
                const { type_info, ...storableNextFunc } = nextFunc;

                const inputPins = (
                  getConfigFromDspFunction(nextFunc).input || []
                )
                  .filter((input) => input.pin)
                  .map((input) => ({
                    id: input.field,
                    title: input.name,
                    types: input.types,
                  }));

                const outputPins = (
                  getConfigFromDspFunction(nextFunc).output || []
                ).map((output) => ({
                  id: `out-${output.field}`,
                  title: output.name,
                  type: output.type,
                }));

                onUpdateNode({
                  inputPins,
                  outputPins,
                  title: nextFunc.description,
                  functionData: {
                    ...functionData,
                    toolFunction: storableNextFunc,
                  },
                });
              }
            }}
            options={availableFunctions.map((func) => ({
              value: func.op,
              label: func.description,
            }))}
          />
        )}
      />

      {functionData?.toolFunction?.parameters?.length > 0 &&
        (functionData?.toolFunction?.parameters || []).map(
          ({ param, type, default }: DSPFunctionParameter) => {
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
                    value={functionData[param] || default || ''}
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
