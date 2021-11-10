import { memo, useState } from 'react';
import { Position } from 'react-flow-renderer';
import { Input } from '@cognite/cogs.js';
import { ColorBlock, InputWrapper, NodeWrapper } from './elements';
import NodeHandle from './NodeHandle';

type OuputNodeProps = {
  id: string;
  data: {
    color: string;
    name: string;
    onOutputNameChange: (nodeId: string, newName: string) => void;
    saveOutputName: (newName: string) => void;
  };
  selected: boolean;
};

const OutputNode = memo(({ id, data, selected }: OuputNodeProps) => {
  const { color, name, onOutputNameChange, saveOutputName } = data;
  const [outputName, setOutputName] = useState<string>(name);

  return (
    <NodeWrapper className={selected ? 'selected' : ''}>
      <NodeHandle id="datapoints" type="target" position={Position.Left} />
      <div>Output</div>
      <InputWrapper>
        <ColorBlock color={color} />
        <Input
          value={outputName}
          onChange={(event) => {
            setOutputName(event.target.value);
          }}
          onBlur={() => {
            onOutputNameChange(id, outputName);
            saveOutputName(outputName);
          }}
        />
      </InputWrapper>
    </NodeWrapper>
  );
});

export default OutputNode;
