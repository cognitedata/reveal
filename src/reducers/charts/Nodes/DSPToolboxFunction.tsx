/* eslint camelcase: 0 */

import React from 'react';
import { Icon, Input, Select } from '@cognite/cogs.js';
import { DSPFunction, getConfigFromDspFunction } from 'utils/transforms';
import { StorableNode } from 'reducers/charts/types';
import AvailableOps from 'components/NodeEditor/AvailableOps';
import { ConfigPanelComponentProps } from '../types';

type FunctionData = {
  [key: string]: any;
  toolFunction?: DSPFunction;
};

export type CogniteFunction = {
  id: number;
  externalId: string;
  name: string;
  fileId: number;
  description: string;
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

export const configPanel = ({
  node,
  onUpdateNode,
}: ConfigPanelComponentProps) => {
  const { functionData } = node;

  return (
    <div>
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

      {functionData?.toolFunction?.parameters?.length &&
        (functionData?.toolFunction?.parameters || []).map(
          ({ param }: { param: string }) => {
            return (
              <div style={{ marginTop: 8 }}>
                <h4>{param}</h4>

                <Input
                  id={param}
                  value={functionData[param] || ''}
                  onChange={(newValue: React.ChangeEvent<HTMLInputElement>) => {
                    onUpdateNode({
                      functionData: {
                        ...node.functionData,
                        [param]: Number(newValue.target.value),
                      },
                    });
                  }}
                />
              </div>
            );
          }
        )}
    </div>
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
    toolFunction: undefined,
  },
} as StorableNode;
