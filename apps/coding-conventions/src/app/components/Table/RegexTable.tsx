import { Convention } from '../../types';

import { BaseTable } from './BaseTable';

interface Props {
  selectedConvention: Convention;
  conventions?: Convention[];
  dependsOnId?: string;
}

const defaultColumns = [
  {
    Header: 'Regex String',
    accessor: 'regex',
  },
  {
    Header: 'Description',
    accessor: 'description',
  },
];

export const RegexTable: React.FC<Props> = ({
  selectedConvention,
  conventions,
  dependsOnId,
}) => {
  return (
    <div>
      <BaseTable
        selectedConvention={selectedConvention}
        conventions={conventions}
        baseColumns={defaultColumns}
        tagType="Regex"
        dependsOnId={dependsOnId}
      />
    </div>
  );
};
