import { Convention } from '../../types';
import { BaseTable } from './BaseTable';

const baseColumns = [
  {
    Header: 'Abbreviation',
    accessor: 'key',
  },
  {
    Header: 'Description',
    accessor: 'description',
  },
];

interface Props {
  selectedConvention: Convention;
  conventions?: Convention[];
  dependsOnId?: string;
}

export const AbbreviationTable: React.FC<Props> = ({
  selectedConvention,
  conventions,
  dependsOnId,
}) => {
  return (
    <div>
      <BaseTable
        selectedConvention={selectedConvention}
        conventions={conventions}
        baseColumns={baseColumns}
        tagType="Abbreviation"
        dependsOnId={dependsOnId}
      />
    </div>
  );
};
