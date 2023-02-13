import { Button, Flex, SegmentedControl } from '@cognite/cogs.js';
import { useState } from 'react';
import styled from 'styled-components';
import { AbbreviationTable } from '../../components/Table/AbbreviationTable';
import { Convention, TagTypes } from '../../types';

interface Props {
  selectedConvention?: Convention;
  conventions?: Convention[];
}
export const ConventionItem: React.FC<Props> = ({
  conventions,
  selectedConvention,
}) => {
  const [currentKey, setCurrentKey] = useState<TagTypes>('Abbreviation');

  if (!selectedConvention) {
    return null;
  }

  return (
    <Flex gap={8} direction="column">
      <SegmentedControl
        currentKey={currentKey}
        onButtonClicked={(nextKey: any) => setCurrentKey(nextKey)}
      >
        <SegmentedControl.Button key="Abbreviation">
          Abbreviations
        </SegmentedControl.Button>
        <SegmentedControl.Button key="Range">Ranges</SegmentedControl.Button>
        <SegmentedControl.Button key="Regex">Regex</SegmentedControl.Button>
      </SegmentedControl>

      <AbbreviationTable
        selectedConvention={selectedConvention}
        conventions={conventions}
      />
    </Flex>
  );
};

const SaveButton = styled(Button)`
  width: 100px;
  display: flex;
  align-self: flex-end;
`;
