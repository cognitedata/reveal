import isEmpty from 'lodash/isEmpty';
import { isObjectEmpty } from 'utils';

export type AdvancedFilter<T> = LeafFilter<T> | BoolFilter<T>;
// export type Sort = {
//   property: Fields[];
//   order?: 'asc' | 'desc';
// }[];

type Property = string[];

type LeafFilter<T> =
  | Equals<T>
  | In<T>
  | Range
  | Prefix<T>
  | Exists
  | ContainsAny<T>
  | ContainsAll<T>
  | Search;
type BoolFilter<T> = And<T> | Or<T> | Not<T>;

type And<T> = { and: AdvancedFilter<T>[] };
type Or<T> = { or: AdvancedFilter<T>[] };
type Not<T> = { not: AdvancedFilter<T> };

type Equals<T> = {
  equals: { property: Property; value: T[keyof T] };
};
type In<T> = { in: { property: Property; values: T[keyof T] } };
type Range = {
  range: {
    [operator in Operator]?: number;
  } & {
    property: Property;
  };
};
type Prefix<T> = { prefix: { property: Property; value: T[keyof T] } };
type Exists = { exists: { property: Property } };
type ContainsAny<T> = {
  containsAny: { property: Property; values: T[keyof T] };
};
type ContainsAll<T> = {
  containsAll: { property: Property; values: T[keyof T] };
};
type Search = { search: { property: Property; value: string } };

type Operator = 'gte' | 'gt' | 'lte' | 'lt';

type AdvancedFilterInput<
  T extends Record<string, unknown>,
  K extends keyof T
> = T[K] | (() => T[K] | undefined);

type AdvancedFilterValidate = boolean | (() => boolean);

export class AdvancedFilterBuilder<T extends Record<string, unknown>> {
  filters = [] as AdvancedFilter<T>[];

  private value() {
    return this.filters;
  }

  private getProperty<K extends keyof T>(key: K) {
    if (typeof key === 'string' || key instanceof String) {
      return key.split('|');
    }
    throw new Error('Key is not a string');
  }

  private getValue<K extends keyof T>(input?: AdvancedFilterInput<T, K>) {
    if (input instanceof Function) {
      return input();
    }

    return input;
  }

  private getValidity(validate?: AdvancedFilterValidate) {
    if (validate instanceof Function) {
      return validate();
    }

    return Boolean(validate);
  }

  build() {
    const filterValue = this.filters[0];

    if (isObjectEmpty(filterValue)) {
      return undefined;
    }

    return filterValue;
  }

  and(builder: AdvancedFilterBuilder<T>) {
    const build = builder.value();

    if (!isEmpty(build)) {
      this.filters = [...this.filters, { and: builder.value() }];
    }

    return this;
  }
  or(builder: AdvancedFilterBuilder<T>) {
    const build = builder.value();

    if (!isEmpty(build)) {
      this.filters = [...this.filters, { or: builder.value() }];
    }

    return this;
  }
  not(builder: AdvancedFilterBuilder<T>) {
    const build = builder.build();

    if (build !== undefined) {
      this.filters = [...this.filters, { not: build }];
    }

    return this;
  }

  /**
   * Matches items that contain the exact value in the provided property.
   * @example {"property":["type"],"value":"PDF"}
   */
  equals<K extends keyof T>(key: K, input?: AdvancedFilterInput<T, K>) {
    const value = this.getValue(input);

    if (value !== undefined) {
      const property = this.getProperty(key);

      this.filters = [
        ...this.filters,
        {
          equals: {
            property,
            value,
          },
        },
      ];
    }

    return this;
  }
  /**
   * Matches items that contain a specific prefix in the provided property.
   * @example {"property":["name"],"value":"Report"}
   */
  prefix<K extends keyof T>(key: K, input?: AdvancedFilterInput<T, K>) {
    const value = this.getValue(input);

    if (value !== undefined) {
      const property = this.getProperty(key);

      this.filters = [
        ...this.filters,
        {
          prefix: {
            property,
            value,
          },
        },
      ];
    }

    return this;
  }
  /**
   * Matches items where the property matches one of the given values
   * @example {"property":["author"],"values":["Etiam Eget","Praesent Vestibulum"]}
   */
  in<K extends keyof T>(key: K, input?: AdvancedFilterInput<T, K>) {
    const values = this.getValue(input);

    if (values !== undefined) {
      const property = this.getProperty(key);

      this.filters = [
        ...this.filters,
        {
          in: {
            property,
            values,
          },
        },
      ];
    }

    return this;
  }
  /**
   * Matches items where the property contains one or more of the given values
   * @example {"property":["assetIds"],"values":[51276,94287]}
   */
  containsAny<K extends keyof T>(key: K, input?: AdvancedFilterInput<T, K>) {
    const values = this.getValue(input);

    if (values !== undefined && !isEmpty(values)) {
      const property = this.getProperty(key);

      this.filters = [
        ...this.filters,
        {
          containsAny: {
            property,
            values,
          },
        },
      ];
    }

    return this;
  }
  /**
   * Matches items where the property contains all the given values
   * @example {"property":["assetIds"],"values":[51276,94287]}
   */
  containsAll<K extends keyof T>(key: K, input?: AdvancedFilterInput<T, K>) {
    const values = this.getValue(input);

    if (values !== undefined && !isEmpty(values)) {
      const property = this.getProperty(key);

      this.filters = [
        ...this.filters,
        {
          containsAll: {
            property,
            values,
          },
        },
      ];
    }

    return this;
  }
  search<K extends keyof T>(key: K, value?: string) {
    if (value !== undefined) {
      const property = this.getProperty(key);

      this.filters = [
        ...this.filters,
        {
          search: {
            property,
            value,
          },
        },
      ];
    }
    return this;
  }
  /**
   * Matches items that contain a value for the provided property.
   * @example {"property":["language"]}
   */
  exists<K extends keyof T>(key: K, validate: AdvancedFilterValidate = true) {
    const valid = this.getValidity(validate);

    if (valid) {
      const property = this.getProperty(key);

      this.filters = [
        ...this.filters,
        {
          exists: {
            property,
          },
        },
      ];
    }

    return this;
  }
  /**
   * Matches items that does not contain a value for the provided property.
   * @example {"property":["language"]}
   */
  notExists<K extends keyof T>(
    key: K,
    validate: AdvancedFilterValidate = true
  ) {
    const valid = this.getValidity(validate);

    if (valid) {
      const property = this.getProperty(key);

      this.filters = [
        ...this.filters,
        {
          not: {
            exists: {
              property,
            },
          },
        },
      ];
    }

    return this;
  }
  /**
   * Matches items that contain terms within the provided range.
   * Range must include both an upper and a lower bound. It is not allowed to specify both inclusive and exclusive
   * bounds (like `gte`, `gt`) together.
   * `gte`: Greater than or equal to.
   * `gt`: Greater than.
   * `lte`: Less than or equal to.
   * `lt`: Less than.
   *
   * @example {"property":["createdTime"],"gte":1609459200000,"lt":1640995200000}
   */
  range(
    key: string,
    values?: {
      gte?: number;
      gt?: number;
      lte?: number;
      lt?: number;
    }
  ) {
    if (!isObjectEmpty(values)) {
      const property = this.getProperty(key);

      this.filters = [
        ...this.filters,
        {
          range: {
            property,
            ...values,
          },
        },
      ];
    }

    return this;
  }
}
