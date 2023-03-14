import { Convention } from '../../types';
import { BaseTable } from './BaseTable';

interface Props {
  selectedConvention: Convention;
  conventions?: Convention[];
  dependsOnId?: string;
}

const baseColumns = [
  {
    Header: 'Min',
    accessor: 'value[0]',
  },
  {
    Header: 'Max',
    accessor: 'value[1]',
  },
  {
    Header: 'Description',
    accessor: 'description',
  },
  {
    Header: 'Padded Minimum length',
    accessor: 'minimumCharacterLength',
  },
];

export const RangeTable: React.FC<Props> = ({
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
        tagType="Range"
        dependsOnId={dependsOnId}
      />
    </div>
  );
};
