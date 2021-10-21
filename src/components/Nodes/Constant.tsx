import { Input } from '@cognite/cogs.js';
import { useState } from 'react';
import * as React from 'react';
import { Chart, StorableNode } from 'models/chart/types';
import { ConfigPanelComponentProps } from '.';

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

export const ConfigPanel = ({
  node,
  onUpdateNode,
}: ConfigPanelComponentProps) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [value, setValue] = useState<string>(String(node?.functionData?.value));

  return (
    <div>
      <h4>Constant</h4>
      <Input
        id="constant"
        value={value}
        onChange={(newValue: React.ChangeEvent<HTMLInputElement>) => {
          setValue(newValue.target.value);
          const formattedValue = Number(
            newValue.target.value.replace(',', '.')
          );
          if (!Number.isNaN(formattedValue)) {
            onUpdateNode({
              functionData: {
                ...node.functionData,
                value: formattedValue,
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
