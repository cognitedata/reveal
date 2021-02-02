import { Input } from '@cognite/cogs.js';
import React, { useState } from 'react';
import { Chart } from 'reducers/charts';
import { StorableNode, ConfigPanelComponentProps } from '../types';

type FunctionData = {
  value: number;
  context: {
    chart: Chart;
  };
};

export const effect = async (funcData: FunctionData) => {
  if (!funcData.value) {
    throw new Error('No constant provided in config');
  }

  return {
    result: {
      value: funcData.value,
    },
  };
};

export const effectId = 'CONSTANT';

export const configPanel = ({
  node,
  onUpdateNode,
}: ConfigPanelComponentProps) => {
  const [value, setValue] = useState<string>(String(node.functionData.value));

  return (
    <div>
      <h4>Constant</h4>
      <Input
        id="constant"
        value={value}
        onChange={(newValue: React.ChangeEvent<HTMLInputElement>) => {
          setValue(newValue.target.value);
          if (!Number.isNaN(Number(newValue.target.value))) {
            onUpdateNode({
              title: String(newValue.target.value),
              functionData: {
                ...node.functionData,
                value: Number(newValue.target.value),
              },
            });
          }
        }}
      />
    </div>
  );
};

export const node = {
  title: 'Constant',
  subtitle: 'Constant',
  color: '#FC2574',
  icon: 'Function',
  inputPins: [],
  outputPins: [
    {
      id: 'result',
      title: 'Constant',
      type: 'CONSTANT',
    },
  ],
  functionEffectReference: effectId,
  functionData: {
    value: 1,
  },
} as StorableNode;
