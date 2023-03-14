import { Flex, SegmentedControl } from '@cognite/cogs.js';
import { useState } from 'react';
import { AbbreviationTable } from '../../components/Table/AbbreviationTable';
import { RangeTable } from '../../components/Table/RangeTable';
import { RegexTable } from '../../components/Table/RegexTable';
import { Convention, TagTypes } from '../../types';

interface Props {
  selectedConvention?: Convention;
  conventions?: Convention[];
  dependsOnId?: string;
}
export const ConventionItem: React.FC<Props> = ({
  conventions,
  selectedConvention,
  dependsOnId,
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

      {currentKey === 'Abbreviation' && (
        <AbbreviationTable
          selectedConvention={selectedConvention}
          conventions={conventions}
          dependsOnId={dependsOnId}
        />
      )}

      {currentKey === 'Range' && (
        <RangeTable
          selectedConvention={selectedConvention}
          conventions={conventions}
          dependsOnId={dependsOnId}
        />
      )}
      {currentKey === 'Regex' && (
        <RegexTable
          selectedConvention={selectedConvention}
          conventions={conventions}
          dependsOnId={dependsOnId}
        />
      )}
    </Flex>
  );
};
