import styled from 'styled-components/macro';

import { Flex } from '@cognite/cogs.js';

import type { Option } from '../TimeSeriesSelector';

import TextHighlighter from './TextHighlighter';

interface TimeSeriesSelectorOptionProps {
  option: Option;
  inputValue?: string;
}

function TimeSeriesSelectorOption({
  option,
  inputValue,
}: TimeSeriesSelectorOptionProps) {
  if (!option.data || !option.value) {
    return null;
  }
  const timeSeriesData = option.data;
  return (
    <Flex direction="column">
      <Text size={14} weight={600}>
        <TextHighlighter
          key="name"
          searchString={inputValue}
          text={timeSeriesData.name}
        />
      </Text>
      <Text size={12} weight={400}>
        <TextHighlighter
          key="description"
          searchString={inputValue}
          text={timeSeriesData.description}
        />
      </Text>
    </Flex>
  );
}

const Text = styled.div<{ weight: number; size: number }>`
  font-weight: ${(props) => props.weight};
  font-size: ${(props) => `${props.size}px`};
  margin: 6px 0;
  text-align: left;
  align-items: flex-start;
`;

export default TimeSeriesSelectorOption;
