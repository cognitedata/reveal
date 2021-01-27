import React, { useEffect, useState } from 'react';
import { Icon, Input, Select } from '@cognite/cogs.js';
import sdk from 'services/CogniteSDK';
import useSelector from 'hooks/useSelector';
import { DSPFunction, fromDspFunctionToConfig } from 'utils/transforms';
import { ConfigPanelComponentProps, StorableNode } from '../types';

type FunctionData = {
  [key: string]: any;
  operation?: string;
  externalData: {
    input: {
      field: string;
      pin: boolean;
    }[];
    output: {
      id: string;
    }[];
  };
};

type ConfigPanelEditables = {
  name: string;
  type: string;
  field: string;
  pin: boolean;
}[];

export type CogniteFunction = {
  id: number;
  externalId: string;
  name: string;
  fileId: number;
  description: string;
};

const waitOnFunctionComplete = (
  tenant: string,
  funcId: number,
  callId: number
): Promise<string> => {
  const startTime = Date.now();
  return new Promise((resolve) => {
    sdk
      .get<{ status: string }>(
        `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${funcId}/calls/${callId}`
      )
      .then((result) => {
        if (result.data.status === 'Running') {
          if (Date.now() - startTime >= 1000 * 60 * 2) {
            // If it takes longer than 60 seconds, time out.
            resolve('Timeout');
          }
          // Wait 1 second before checking the status again
          new Promise((resolveWaiter) => setTimeout(resolveWaiter, 1000)).then(
            () => {
              waitOnFunctionComplete(tenant, funcId, callId).then(resolve);
            }
          );
        } else if (result.data.status === 'Failed') {
          resolve('Failed');
        } else {
          resolve('Success');
        }
      });
  });
};

export const effect = async (funcData: FunctionData, ...rest: any[]) => {
  if (!funcData.operation) {
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
  const [configPanelEditables, setConfigPanelEditables] = useState<
    ConfigPanelEditables
  >();

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

      const status = await waitOnFunctionComplete(
        tenant,
        getAllOps.id,
        functionCall.data.id
      );

      const functionResult = await sdk.get<{ response: Record<string, any> }>(
        `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${getAllOps.id}/calls/${functionCall.data.id}/response`
      );

      const availableOperations =
        functionResult.data.response.all_available_ops;

      console.log({
        status,
        availableOperations,
        oldOperations: functions.data.items,
      });

      setAvailableFunctions(availableOperations);
      setLoading(false);
    }

    populateOptions();
  }, []);

  if (isLoading) {
    return <Icon type="Loading" />;
  }

  return (
    <div>
      <h4>CDF Function</h4>
      <Select
        theme="dark"
        defaultValue={
          functionData?.cogniteFunction
            ? {
                value: functionData.cogniteFunction?.id,
                label: functionData.cogniteFunction?.name,
              }
            : undefined
        }
        onChange={(nextValue: { value: string }) => {
          const nextFunc = availableFunctions.find(
            (x) => x.op === nextValue.value
          );
          if (nextFunc) {
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
                operation: nextFunc.op,
              },
            });

            const configurables = (
              fromDspFunctionToConfig(nextFunc).input || []
            )
              .map((input) => ({
                name: input.name,
                field: input.field,
                pin: input.pin || false,
                type: (input.types || [])[0],
              }))
              .filter((input) => !input.pin);

            setConfigPanelEditables(configurables);
          }
        }}
        options={availableFunctions.map((func) => ({
          value: func.op,
          label: func.description,
        }))}
      />

      {configPanelEditables &&
        configPanelEditables.map((editable) => (
          <div style={{ marginTop: 8 }}>
            <h4>{editable.name}</h4>

            <Input
              id={editable.field}
              value={functionData[editable.field] || ''}
              onChange={(newValue: React.ChangeEvent<HTMLInputElement>) => {
                onUpdateNode({
                  functionData: {
                    ...node.functionData,
                    [editable.field]: newValue.target.value,
                  },
                });
              }}
            />
          </div>
        ))}
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
    cogniteFunction: undefined,
  },
} as StorableNode;
