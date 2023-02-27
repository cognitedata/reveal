export interface ContainsAllFilter {
  containsAll: {
    /**
     * Property you wish to filter. It's a list of strings to allow specifying nested properties.
     * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
     * @type {Array<string>}
     */
    property: Array<string>;
    /**
     * One or more values you wish to find in the provided property.
     * @type {Array<boolean | number | string>}
     */
    values: Array<boolean | number | string>;
  };
}
