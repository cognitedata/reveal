import { Button, Flex, Title } from '@cognite/cogs.js';
import { useState } from 'react';
import { ShapeAttribute } from 'typings/rules';

import { AttributeDisplay } from './AttributesDisplay';
import { AttributeForm } from './AttributesForm';
import { RightWrapper } from './elements';

type AttributesControlProps = {
  attributes: ShapeAttribute[];
  onChange: (nextAttributes: ShapeAttribute[]) => void;
};

const AttributesControl = ({
  attributes,
  onChange,
}: AttributesControlProps) => {
  const [isAdding, setIsAdding] = useState(false);
  return (
    <RightWrapper>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ padding: 16 }}
      >
        <Title level={4}>Attributes</Title>
        <Button
          icon="Add"
          type="ghost"
          onClick={() => {
            setIsAdding(true);
          }}
        >
          Add attribute
        </Button>
      </Flex>
      {attributes?.map((attr) => (
        <AttributeDisplay
          key={attr.id}
          attribute={attr}
          onChange={(next) => {
            onChange(attributes.map((a) => (a.id === next.id ? next : a)));
          }}
          onDelete={() => {
            onChange(attributes.filter((a) => a.id !== attr.id));
          }}
        />
      ))}
      {isAdding && (
        <AttributeForm
          onDone={(next) => {
            onChange([...attributes, next]);
            setIsAdding(false);
          }}
        />
      )}
    </RightWrapper>
  );
};

export default AttributesControl;
