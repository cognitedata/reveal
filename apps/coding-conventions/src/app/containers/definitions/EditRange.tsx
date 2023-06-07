import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Flex, Input, Body } from '@cognite/cogs.js';

interface Props {
  description: string;
  minValue: number;
  maxValue: number;
  minimumCharacterLength?: number;
  onChange: (
    minValue: number,
    maxValue: number,
    description: string,
    minimumCharacterLength?: number
  ) => void;
}

export const EditRange: React.FC<Props> = ({
  description,
  minValue,
  maxValue,
  minimumCharacterLength,
  onChange,
}) => {
  const [min, setMin] = useState(minValue);
  const [max, setMax] = useState(maxValue);
  const [descriptionField, setDescriptionField] = useState(description);
  const [minimumCharacterLengthField, setMinimumCharacterLengthField] =
    useState(minimumCharacterLength);

  useEffect(() => {
    onChange(min, max, descriptionField, minimumCharacterLengthField);
  }, [min, max, descriptionField, minimumCharacterLengthField]);

  return (
    <Flex direction="column" gap={8}>
      <Subtitle>Min *</Subtitle>
      <Input
        id="min"
        type="number"
        value={min}
        onChange={(e) => setMin(Number(e.target.value))}
      />

      <Subtitle>Max *</Subtitle>
      <Input
        id="max"
        type="number"
        value={max}
        onChange={(e) => setMax(Number(e.target.value))}
      />

      <Subtitle>Minimum character length</Subtitle>
      <Input
        id="minimumCharacterLength"
        type="number"
        value={minimumCharacterLengthField}
        onChange={(e) => setMinimumCharacterLengthField(Number(e.target.value))}
      />

      <Subtitle>Description *</Subtitle>
      <Input
        id="description"
        type="text"
        value={descriptionField}
        onChange={(e) => setDescriptionField(e.target.value)}
      />
    </Flex>
  );
};

const Subtitle = styled(Body).attrs({ level: 3 })`
  padding-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;
