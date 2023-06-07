import { ISimpleFilterModel } from 'ag-grid-community';
import { ISimpleFilterModelType } from 'ag-grid-community/dist/lib/filter/provided/simpleFilter';

export type ThemeNames =
  | 'default'
  | 'compact'
  | 'suggestions'
  | 'basic-striped';

export type ThemeClasses = {
  [key in ThemeNames]: string;
};

export interface CustomFilterModel extends ISimpleFilterModel {
  type: ISimpleFilterModelType;

  filterType: string;
  /**
   * The text value associated with the filter.
   * It's optional as custom filters may not have a text value.
   * */
  filter?: any | null;
  /**
   * indicates dataType of the custom field filter type.
   * */
  filterTo?: string;
}
