import React, { useEffect, useState } from 'react';
import { Icon, Input, Select } from '@cognite/cogs.js';
import sdk from 'services/CogniteSDK';
import JSZip from 'jszip';
import useSelector from 'hooks/useSelector';
import { ConfigPanelComponentProps, StorableNode } from '../types';

type FunctionData = {
  [key: string]: any;
  cogniteFunction?: CogniteFunction;
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

type CogniteFunction = {
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
  if (!funcData.cogniteFunction) {
    throw new Error('No external id given in config');
  }
  if (!funcData.tenant) {
    throw new Error('Did not get a tenant');
  }

  const { tenant, cogniteFunction, externalData } = funcData;

  const functionCallData: Record<string, any> = {};
  const inputPins = externalData.input.filter((input) => input.pin);
  const configurations = externalData.input.filter((input) => !input.pin);
  for (let i = 0; i < inputPins.length; i++) {
    functionCallData[inputPins[i].field] = rest[i];
  }
  for (let i = 0; i < configurations.length; i++) {
    functionCallData[configurations[i].field] = Number(
      funcData[configurations[i].field]
    );
  }
  console.log(inputPins, configurations);
  console.log(functionCallData);
  // Convert inputPin and config data into cognite function input
  // Correctly set outputs in Multiplier function
  // Use that correct output data

  // Fix whats wrong with the PRs right now
  // CLEAN CLEAN CLEAN

  // const inputFromPins = rest.map()

  const functionCall = await sdk.post<{ id: number }>(
    `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${cogniteFunction.id}/call`,
    {
      data: {
        data: functionCallData,
      },
    }
  );

  const status = await waitOnFunctionComplete(
    tenant,
    cogniteFunction.id,
    functionCall.data.id
  );
  if (status === 'Failed') {
    throw new Error(
      'Cognite function failed. Check the logs in fusion to find out why'
    );
  }

  if (status === 'Timeout') {
    throw new Error('Cognite function timed out. Took longer than 2 minutes');
  }

  const funcResult = await sdk.get<{ response: Record<string, any> }>(
    `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${cogniteFunction.id}/calls/${functionCall.data.id}/response`
  );

  const output = Object.keys(funcResult.data.response).reduce(
    (acc, key) => ({
      ...acc,
      [`out-${key}`]: funcResult.data.response[key],
    }),
    {}
  );
  console.log(output);
  return output;
};

export const effectId = 'COGNITE_FUNCTION';

export const configPanel = ({
  node,
  onUpdateNode,
}: ConfigPanelComponentProps) => {
  const tenant = useSelector((state) => state.environment.tenant);
  const [isLoading, setLoading] = useState(false);
  const [availableFunctions, setAvailableFunctions] = useState<
    CogniteFunction[]
  >([]);
  const [configPanelEditables, setConfigPanelEditables] = useState<
    ConfigPanelEditables
  >();

  const { functionData } = node;

  useEffect(() => {
    const getDetails = async () => {
      // Get the download link for the file
      const file = await sdk.files.getDownloadUrls([
        { id: functionData.cogniteFunction?.fileId || 0 },
      ]);

      // Download, unzip and get the config file (if it exists)
      const fileBlob = await sdk.get(file[0].downloadUrl, {
        responseType: 'arraybuffer',
      });
      console.log('blob', fileBlob);
      const loadedZip = await JSZip.loadAsync(fileBlob.data);
      const fileData = await loadedZip
        .file('cognite-charts-config.json')
        ?.async('text');

      // Get the pins and add them to the node
      if (fileData) {
        const parsedData = JSON.parse(fileData);
        const inputPins = (parsedData?.input || [])
          .filter((input: any) => input.pin)
          .map((input: any) => ({
            id: input.field,
            title: input.name,
            types: [input.type],
          }));

        const outputPins = (parsedData?.output || []).map((output: any) => ({
          id: `out-${output.field}`,
          title: output.name,
          type: output.type,
        }));
        console.log(inputPins, outputPins);

        onUpdateNode({
          inputPins,
          outputPins,
          functionData: {
            ...node.functionData,
            externalData: parsedData,
            tenant,
          },
        });

        const configurables = (parsedData?.input || []).filter(
          (input: any) => !input.pin
        );

        setConfigPanelEditables(configurables);
      }
    };
    if (functionData.cogniteFunction) {
      getDetails();
    }
  }, [functionData.cogniteFunction]);

  useEffect(() => {
    setLoading(true);
    sdk
      .get<{ items: CogniteFunction[] }>(
        `https://api.cognitedata.com/api/playground/projects/${tenant}/functions`
      )
      .then((result) => {
        setAvailableFunctions(
          result.data.items.filter((func) =>
            func.description.includes('[CHARTS]')
          )
        );
        setLoading(false);
      });
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
          functionData.cogniteFunction
            ? {
                value: functionData.cogniteFunction?.id,
                label: functionData.cogniteFunction?.name,
              }
            : undefined
        }
        onChange={(nextValue: { value: number }) => {
          const nextFunc = availableFunctions.find(
            (x) => x.id === nextValue.value
          );
          if (nextFunc) {
            onUpdateNode({
              functionData: {
                ...functionData,

                cogniteFunction: nextFunc,
              },
            });
          }
        }}
        options={availableFunctions.map((func) => ({
          value: func.id,
          label: func.name,
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
  title: 'CDF Function',
  subtitle: 'FUNCTION',
  color: '#18AF8E',
  icon: 'Function',
  inputPins: [],
  outputPins: [],
  functionEffectReference: effectId,
  functionData: {
    cogniteFunction: undefined,
  },
} as StorableNode;
