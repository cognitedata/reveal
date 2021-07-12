import { FilterDataTypeType, FilterListFilters, FilterTypes } from './types';
import { StartContainer } from './elements';
import { FilterList } from './FilterList';

interface Props {
  datatype: FilterDataTypeType;
  openFilter: keyof FilterTypes | '';
  closeFilters: () => void;
  toggleFilter: (filterName: keyof FilterTypes) => void;
}

export const RenderSecondaryFilters = ({
  datatype,
  openFilter,
  closeFilters,
  toggleFilter,
}: Props) => {
  const secondaryFiltersList: FilterListFilters = [
    {
      name: 'dataTypes',
      label: 'Datatype',
      source: datatype.types,
      visible: !!(datatype.types.length > 0 && openFilter !== 'date'),
      onSelect: datatype.onSelectType,
      value: datatype.selected,
    },
  ];

  return (
    <StartContainer>
      <FilterList
        onReset={() => datatype.onSelectType(null)}
        resetText="All DataTypes"
        placeholder="All"
        closeHandler={closeFilters}
        toggleFilter={toggleFilter}
        openFilter={openFilter}
        filters={secondaryFiltersList}
      />
    </StartContainer>
  );
};
