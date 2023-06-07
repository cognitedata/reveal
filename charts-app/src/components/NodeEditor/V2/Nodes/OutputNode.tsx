import { memo, useEffect, useState } from 'react';
import { NodeProps, Position } from 'react-flow-renderer';
import { Input } from '@cognite/cogs.js';
import { defaultTranslations } from 'components/NodeEditor/translations';
import {
  ColorBlock,
  InputWrapper,
  NodeWrapper,
  NoDragWrapper,
} from './elements';
import NodeHandle from './NodeHandle';

export type OutputNodeDataDehydrated = {};

export type OutputNodeCallbacks = {
  onOutputNameChange: (newName: string) => void;
};

export type OutputNodeData = OutputNodeDataDehydrated &
  OutputNodeCallbacks & {
    color: string;
    name: string;
    readOnly: boolean;
    translations: typeof defaultTranslations;
  };

const OutputNode = memo(({ data, selected }: NodeProps<OutputNodeData>) => {
  const { color, name, readOnly, onOutputNameChange, translations: t } = data;

  const [localName, setLocalName] = useState(name);

  useEffect(() => {
    setLocalName(name);
  }, [name]);

  return (
    <NodeWrapper className={selected ? 'selected' : ''}>
      <NodeHandle id="datapoints" type="target" position={Position.Left} />
      <div>{t.Output}</div>
      {readOnly ? (
        localName
      ) : (
        <InputWrapper>
          <ColorBlock color={color} />
          <NoDragWrapper>
            <Input
              value={localName}
              onChange={(event) => {
                setLocalName(event.target.value);
              }}
              onBlur={() => {
                onOutputNameChange(localName);
              }}
            />
          </NoDragWrapper>
        </InputWrapper>
      )}
    </NodeWrapper>
  );
});

export default OutputNode;
