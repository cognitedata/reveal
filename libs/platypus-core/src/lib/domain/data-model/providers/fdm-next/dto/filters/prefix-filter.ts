export interface PrefixFilter {
  prefix: {
    /**
     * Property you wish to filter. It's a list of strings to allow specifying nested properties.
     * For example, If you have the object `{"foo": {"../bar": "baz"}, "bar": 123}`, you can refer to the nested property as `["foo", "../bar"]` and the un-nested one as `["bar"]`.
     * @type {Array<string>}
     */
    property: Array<string>;
    /**
     * @type {Value}
     */
    value: boolean | number | string;
  };
}
