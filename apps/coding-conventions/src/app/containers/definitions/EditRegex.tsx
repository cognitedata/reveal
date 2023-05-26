import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Flex, Input, Body } from '@cognite/cogs.js';

interface Props {
  description: string;
  regex: string;
  onChange: (regex: string, description: string) => void;
}
export const EditRegex: React.FC<Props> = ({
  description,
  regex,
  onChange,
}) => {
  const [regexValue, setRegexValue] = useState(regex);
  const [descriptionValue, setDescriptionValue] = useState(description);

  useEffect(() => {
    if (regexValue && descriptionValue) {
      onChange(regexValue, descriptionValue);
    }
  }, [regexValue, descriptionValue]);

  return (
    <Flex direction="column" gap={8}>
      <Subtitle>Regex *</Subtitle>
      <Input
        label="Regex"
        placeholder="Regex"
        id="regex"
        type="text"
        value={regexValue}
        onChange={(e) => setRegexValue(e.target.value)}
      />
      <Subtitle>Description *</Subtitle>
      <Input
        id="description"
        type="text"
        value={descriptionValue}
        onChange={(e) => setDescriptionValue(e.target.value)}
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
