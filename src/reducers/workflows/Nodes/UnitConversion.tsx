import React, { useState } from 'react';
import { Input } from '@cognite/cogs.js';
import { ConfigPanelComponentProps, StorableNode } from '../types';

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
  node,
  onUpdateNode,
}: ConfigPanelComponentProps) => {
  const [multiplier, setMultiplier] = useState<string>(
    String(node.functionData.multiplier)
  );

  return (
    <div>
      <h4>Multiplier</h4>
      <Input
        id="multiplier"
        value={multiplier}
        onChange={(newValue: React.ChangeEvent<HTMLInputElement>) => {
          setMultiplier(newValue.target.value);
          if (!Number.isNaN(Number(newValue.target.value))) {
            onUpdateNode({
              functionData: {
                ...node.functionData,
                multiplier: Number(newValue.target.value),
              },
            });
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
