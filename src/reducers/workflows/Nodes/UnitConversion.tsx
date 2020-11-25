import React, { useState } from 'react';
import { Input } from '@cognite/cogs.js';
import { StorableNode } from '../types';

type FunctionData = {
  multiplier: number;
};

type DataPoint = {
  value: number;
};

export const effect = async (funcData: FunctionData, a: DataPoint[]) => {
  return {
    result: a.map((x) => ({
      ...x,
      value: x.value * funcData.multiplier,
    })),
  };
};

export const effectId = 'UNIT_CONVERSION';

export const configPanel = ({
  data,
  onUpdate,
}: {
  data: FunctionData;
  onUpdate: (nextData: FunctionData) => void;
}) => {
  const [multiplier, setMulitplier] = useState<string>(String(data.multiplier));

  return (
    <div>
      <h4>Multiplier</h4>
      <Input
        id="multiplier"
        value={multiplier}
        onChange={(newValue: React.ChangeEvent<HTMLInputElement>) => {
          setMulitplier(newValue.target.value);
          if (!Number.isNaN(Number(newValue.target.value))) {
            onUpdate({ ...data, multiplier: Number(newValue.target.value) });
          }
        }}
      />
    </div>
  );
};

export const node = {
  title: 'A to B',
  subtitle: 'CONVERSION',
  color: '#FC2574',
  icon: 'Function',
  outputPins: [
    {
      id: 'result',
      title: 'Result',
      type: 'TIMESERIES',
    },
  ],
  functionEffectReference: effectId,
  inputPins: [
    {
      id: 'input-A',
      title: 'Time Series',
      types: ['TIMESERIES'],
      required: true,
    },
  ],
  functionData: {
    multiplier: 2,
  },
} as StorableNode;
