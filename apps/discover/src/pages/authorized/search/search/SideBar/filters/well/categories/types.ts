import { WellFilterMap, WellFilterOptionValue } from 'modules/wellSearch/types';

export interface CustomFilterBaseProps {
  onValueChange: (
    _filterCategory: number,
    id: number,
    selectedVals: WellFilterOptionValue[],
    filterGroupName: string
  ) => void;
  selectedOptions: WellFilterMap;
}
