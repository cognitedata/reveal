import React, { useEffect, useState } from 'react';
import { AutoComplete } from '@cognite/cogs.js';
import sdk from 'services/CogniteSDK';
import { StorableNode } from '../types';

type FunctionData = {
  timeSeriesExternalId: string;
};

export const effect = async (funcData: FunctionData) => {
  if (!funcData.timeSeriesExternalId) {
    throw new Error('No external id given in config');
  }
  const datapoints = await sdk.datapoints.retrieve({
    items: [{ externalId: funcData.timeSeriesExternalId }],
  });
  console.log(datapoints[0].datapoints);
  return {
    datapoints: datapoints[0].datapoints,
  };
};

export const effectId = 'DATAPOINTS';

export const configPanel = ({
  data,
  onUpdate,
}: {
  data: FunctionData;
  onUpdate: (nextData: FunctionData) => void;
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (data.timeSeriesExternalId) {
      sdk.timeseries
        .retrieve([{ externalId: data.timeSeriesExternalId }])
        .then((timeseries) => {
          setInputValue(timeseries[0]?.name || '');
        });
    }
  }, [data.timeSeriesExternalId]);

  const loadOptions = (
    input: string,
    callback: (options: { value?: string; label?: string }[]) => void
  ) => {
    sdk.timeseries
      .search({
        filter: {
          isString: false,
        },
        search: {
          query: input,
        },
      })
      .then((results) => {
        callback(
          results.map((result) => ({
            value: result.externalId,
            label: result.name,
          }))
        );
      });
  };
  console.log(inputValue);
  return (
    <div>
      <h4>CDF Timeseries</h4>
      <AutoComplete
        mode="async"
        theme="dark"
        loadOptions={loadOptions}
        onChange={(nextValue: { value: string; label: string }) => {
          onUpdate({
            timeSeriesExternalId: nextValue.value,
          });
        }}
        value={{ value: data.timeSeriesExternalId, label: inputValue }}
      />
    </div>
  );
};

export const node = {
  title: 'CDF Datapoints',
  subtitle: 'DATAPOINTS',
  color: '#FC2574',
  icon: 'Function',
  inputPins: [],
  outputPins: [
    {
      id: 'datapoints',
      title: 'Datapoints',
      type: 'DATAPOINTS',
    },
  ],
  functionEffectReference: effectId,
  functionData: {
    timeSeriesExternalId: undefined,
  },
} as StorableNode;
