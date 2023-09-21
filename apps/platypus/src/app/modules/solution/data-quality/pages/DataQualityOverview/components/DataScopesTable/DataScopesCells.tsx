import { A, Body, Heading } from '@cognite/cogs.js';

type NameCellProps = {
  dataScopeName: string;
  onClick: VoidFunction;
};

type DataTypeCellProps = {
  dataType: string;
};

type FiltersCellProps = {
  filters: string;
};

export const NameCell = ({ dataScopeName, onClick }: NameCellProps) => {
  return (
    <Heading level={5}>
      <A onClick={onClick}>{dataScopeName}</A>
    </Heading>
  );
};

export const DataTypeCell = ({ dataType }: DataTypeCellProps) => {
  return <Heading level={6}>{dataType}</Heading>;
};

export const FiltersCell = ({ filters }: FiltersCellProps) => {
  return <Body size="medium">{filters}</Body>;
};
