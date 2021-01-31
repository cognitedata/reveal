/* eslint camelcase: 0 */

import React, { useEffect, useState } from 'react';
import { Icon, Input, Select } from '@cognite/cogs.js';
import sdk from 'services/CogniteSDK';
import useSelector from 'hooks/useSelector';
import { DSPFunction, fromDspFunctionToConfig } from 'utils/transforms';
import { waitOnFunctionComplete } from 'utils/cogniteFunctions';
import { ConfigPanelComponentProps, StorableNode } from '../types';

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
  const tenant = useSelector((state) => state.environment.tenant);
  const [isLoading, setLoading] = useState(false);
  const [availableFunctions, setAvailableFunctions] = useState<DSPFunction[]>(
    []
  );
  const { functionData } = node;

  useEffect(() => {
    async function populateOptions() {
      setLoading(true);

      if (!tenant) {
        return;
      }

      const functions = await sdk.get<{ items: CogniteFunction[] }>(
        `https://api.cognitedata.com/api/playground/projects/${tenant}/functions`
      );

      const getAllOps = functions.data.items.find(
        (func) => func.name === 'get_all_ops-master'
      );

      if (!getAllOps) {
        return;
      }

      const functionCall = await sdk.post<{ id: number }>(
        `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${getAllOps.id}/call`,
        {
          data: {},
        }
      );

      await waitOnFunctionComplete(tenant, getAllOps.id, functionCall.data.id);

      const functionResult = await sdk.get<{ response: Record<string, any> }>(
        `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${getAllOps.id}/calls/${functionCall.data.id}/response`
      );

      const availableOperations =
        functionResult.data.response.all_available_ops;

      // console.log({
      //   status,
      //   availableOperations,
      // });

      setAvailableFunctions(availableOperations);
      setLoading(false);
    }

    populateOptions();
  }, []);

  return (
    <div>
      <h4>Tool Function</h4>
      {isLoading ? (
        <Icon type="Loading" />
      ) : (
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

              const inputPins = (fromDspFunctionToConfig(nextFunc).input || [])
                .filter((input) => input.pin)
                .map((input) => ({
                  id: input.field,
                  title: input.name,
                  types: input.types,
                }));

              const outputPins = (
                fromDspFunctionToConfig(nextFunc).output || []
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

      {Object.keys(functionData?.toolFunction?.parameters || {}).length &&
        Object.keys(functionData?.toolFunction?.parameters).map((paramName) => {
          return (
            <div style={{ marginTop: 8 }}>
              <h4>{paramName}</h4>

              <Input
                id={paramName}
                value={functionData[paramName] || ''}
                onChange={(newValue: React.ChangeEvent<HTMLInputElement>) => {
                  onUpdateNode({
                    functionData: {
                      ...node.functionData,
                      [paramName]: Number(newValue.target.value),
                    },
                  });
                }}
              />
            </div>
          );
        })}
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
