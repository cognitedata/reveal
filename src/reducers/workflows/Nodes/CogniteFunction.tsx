import React, { useEffect, useState } from 'react';
import { Icon, Select } from '@cognite/cogs.js';
import sdk from 'services/CogniteSDK';
import JSZip from 'jszip';
import useSelector from 'hooks/useSelector';
import { StorableNode } from '../types';

type FunctionData = {
  [key: string]: any;
  cogniteFunction?: CogniteFunction;
};

type SelectedDetail = {
  input: {
    name: string;
    type: string;
    field: string;
    pin: boolean;
  }[];
  output: {
    name: string;
    type: string;
    field?: string;
  }[];
};

type CogniteFunction = {
  id: number;
  externalId: string;
  name: string;
  fileId: number;
  description: string;
};

export const effect = async (funcData: FunctionData) => {
  if (!funcData.cogniteFunction) {
    throw new Error('No external id given in config');
  }
  const datapoints = await sdk.datapoints.retrieve({
    items: [{ externalId: 'a' }],
  });
  return {
    datapoints: datapoints[0].datapoints,
  };
};

export const effectId = 'COGNITE_FUNCTION';

export const configPanel = ({
  data,
  onUpdate,
}: {
  data: FunctionData;
  onUpdate: (nextData: FunctionData) => void;
}) => {
  const tenant = useSelector((state) => state.environment.tenant);
  const [isLoading, setLoading] = useState(false);
  const [availableFunctions, setAvailableFunctions] = useState<
    CogniteFunction[]
  >([]);
  const [selectedFunctionDetail, setSelectedFunctionDetail] = useState<
    SelectedDetail
  >();
  useEffect(() => {
    const getDetails = async () => {
      // Get the download link for the file
      const file = await sdk.files.getDownloadUrls([
        { id: data.cogniteFunction?.fileId || 0 },
      ]);
      console.log('file', file);
      // Download, unzip and get the config file (if it exists)
      const fileBlob = await sdk.get(file[0].downloadUrl, {
        responseType: 'arraybuffer',
      });
      console.log('blob', fileBlob);
      const loadedZip = await JSZip.loadAsync(fileBlob.data);
      const fileData = await loadedZip
        .file('cognite-charts-config.json')
        ?.async('text');

      console.log(fileData);

      setSelectedFunctionDetail(JSON.parse(fileData || ''));
    };
    if (data.cogniteFunction) {
      getDetails();
    }
  }, [data]);

  useEffect(() => {
    setLoading(true);
    sdk
      .get<{ items: CogniteFunction[] }>(
        `https://api.cognitedata.com/api/playground/projects/${tenant}/functions`
      )
      .then((result) => {
        setAvailableFunctions(result.data.items);
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
          data.cogniteFunction
            ? {
                value: data.cogniteFunction?.id,
                label: data.cogniteFunction?.name,
              }
            : undefined
        }
        onChange={(nextValue: { value: number }) => {
          const nextFunc = availableFunctions.find(
            (x) => x.id === nextValue.value
          );
          if (nextFunc) {
            onUpdate({
              ...data,
              cogniteFunction: nextFunc,
            });
          }
          // Additional input/ouput pins in function data??
        }}
        options={availableFunctions.map((func) => ({
          value: func.id,
          label: func.name,
        }))}
      />

      {selectedFunctionDetail && JSON.stringify(selectedFunctionDetail)}
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
