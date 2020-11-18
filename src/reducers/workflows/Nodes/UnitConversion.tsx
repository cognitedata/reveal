import React, { useState } from 'react';
import { Input } from '@cognite/cogs.js';
import { StorableNode } from '../types';

type FunctionData = {
  multiplier: number;
};

type DataPoint = {
  value: number;
};

export const NodeEffect = async (funcData: FunctionData, a: DataPoint[]) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    result: a.map((x) => ({
      ...x,
      value: x.value * funcData.multiplier,
    })),
  };
};

export const NodeEffectId = 'UNIT_CONVERSION';

export const ConfigPanel = ({
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

export default {
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
  functionEffectReference: NodeEffectId,
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
