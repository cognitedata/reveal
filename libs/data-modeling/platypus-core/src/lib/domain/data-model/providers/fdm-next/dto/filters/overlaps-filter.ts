import { RangeValue } from './types';
export interface OverlapsFilter {
  overlaps: {
    /**
     * Property you wish to filter. It's a list of strings to allow specifying nested properties.
     * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
     * @type {Array<string>}
     */
    startProperty: Array<string>;
    /**
     * Property you wish to filter. It's a list of strings to allow specifying nested properties.
     * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
     * @type {Array<string>}
     */
    endProperty: Array<string>;
    /**
     * @type {RangeValue}
     * @memberof OverlapsFilterOverlaps
     */
    gte?: RangeValue;
    /**
     * @type {RangeValue}
     */
    gt?: RangeValue;
    /**
     * @type {RangeValue}
     */
    lte?: RangeValue;
    /**
     * @type {RangeValue}
     */
    lt?: RangeValue;
  };
}
