import { Filter } from './index';

export interface NestedFilter {
  nested: {
    /**
     * @type {Array<string>}
     */
    scope: Array<string>;
    /**
     * @type {DmsFilter}
     */
    filter?: Filter;
  };
}
