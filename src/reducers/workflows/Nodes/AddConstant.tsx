import React, { useState } from 'react';
import { Input } from '@cognite/cogs.js';
import { ConfigPanelComponentProps, StorableNode } from '../types';

type FunctionData = {
  constant: number;
};

type DataPoint = {
  value: number;
};

export const effect = async (funcData: FunctionData, a: DataPoint[]) => {
  return {
    result: a.map((x) => ({
      ...x,
      value: x.value + funcData.constant,
    })),
  };
};

export const effectId = 'ADD_CONSTANT';

export const configPanel = ({
  node,
  onUpdateNode,
}: ConfigPanelComponentProps) => {
  const [constant, setConstant] = useState<string>(
    String(node.functionData.constant)
  );

  return (
    <div>
      <h4>Constant</h4>
      <Input
        id="constant"
        value={constant}
        onChange={(newValue: React.ChangeEvent<HTMLInputElement>) => {
          setConstant(newValue.target.value);
          if (!Number.isNaN(Number(newValue.target.value))) {
            onUpdateNode({
              functionData: {
                ...node.functionData,
                constant: Number(newValue.target.value),
              },
            });
          }
        }}
      />
    </div>
  );
};

export const node = {
  title: 'CONSTANT',
  subtitle: 'Add constant',
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
    constant: 100,
  },
} as StorableNode;
