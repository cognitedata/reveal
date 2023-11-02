import { FieldValue, Operator, ValueType } from '@fdx/shared/types/filters';
import { isObjectEmpty } from '@fdx/shared/utils/object';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

type Resource = Record<string, any>;

type Property = string[];

type LeafFilterSingle<T> = {
  property: Property;
  value: Required<T>;
};
type LeafFilterMultiple<T> = {
  property: Property;
  values: Required<T>;
};
type LeafFilterProperty = { property: Property };

type RangeOperator = 'gte' | 'gt' | 'lte' | 'lt';
type RangeValue<T> = NonEmpty<Record<RangeOperator, T>>;
type LeafFilterRange<T> = RangeValue<T> & {
  property: Property;
};

type BoolFilter<T extends Resource, K extends DeepKeyOf<T>> =
  | { and: ACDMFilter<T, K>[] }
  | { or: ACDMFilter<T, K>[] }
  | { not: ACDMFilter<T, K> };

type LeafFilter<T extends Resource, K extends DeepKeyOf<T>> =
  | { prefix: LeafFilterSingle<DeepValueOf<T, K>> }
  | { in: LeafFilterMultiple<DeepValueOf<T, K>> }
  | { equals: LeafFilterSingle<DeepValueOf<T, K>> }
  | { exists: LeafFilterProperty }
  | { containsAny: LeafFilterMultiple<DeepValueOf<T, K>> }
  | { containsAll: LeafFilterMultiple<DeepValueOf<T, K>> }
  | { inAssetSubtree: LeafFilterMultiple<DeepValueOf<T, K>> }
  | { search: LeafFilterSingle<string> }
  | { range: LeafFilterRange<DeepValueOf<T, K>> };

type ACDMFilter<T extends Resource, K extends DeepKeyOf<T>> =
  | BoolFilter<T, K>
  | LeafFilter<T, K>;

type ACDMFilterInput<T extends Resource, K extends DeepKeyOf<T>> =
  | DeepValueOf<T, K>
  | (() => DeepValueOf<T, K> | undefined);

class BaseACDMFilterBuilder<T extends Resource> {
  protected filters: ACDMFilter<T, DeepKeyOf<T>>[] = [];

  private value() {
    return this.filters;
  }

  private getProperty<K extends DeepKeyOf<T>>(key: K) {
    return String(key).split('.');
  }

  private getValue<K extends DeepKeyOf<T>>(input?: ACDMFilterInput<T, K>) {
    if (input instanceof Function) {
      return input();
    }
    return input;
  }

  build() {
    const filterValue = head(this.filters);

    if (isObjectEmpty(filterValue)) {
      return undefined;
    }

    return filterValue;
  }

  and(builder: BaseACDMFilterBuilder<T>) {
    const build = builder.value();

    if (!isEmpty(build)) {
      this.filters = [...this.filters, { and: build }];
    }

    return this;
  }

  or(builder: BaseACDMFilterBuilder<T>) {
    const build = builder.value();

    if (!isEmpty(build)) {
      this.filters = [...this.filters, { or: build }];
    }

    return this;
  }

  not(builder: BaseACDMFilterBuilder<T>) {
    const build = builder.build();

    if (!isUndefined(build)) {
      this.filters = [...this.filters, { not: build }];
    }

    return this;
  }

  prefix<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    const value = this.getValue(input);

    if (!isUndefined(value)) {
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

  in<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    const values = this.getValue(input);

    if (!isUndefined(values) && !isEmpty(values)) {
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

  equals<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    const value = this.getValue(input);

    if (!isUndefined(value)) {
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

  exists<K extends DeepKeyOf<T>>(key: K) {
    const property = this.getProperty(key);

    this.filters = [
      ...this.filters,
      {
        exists: {
          property,
        },
      },
    ];

    return this;
  }

  notExists<K extends DeepKeyOf<T>>(key: K) {
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

    return this;
  }

  containsAny<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    const values = this.getValue(input);

    if (!isUndefined(values) && !isEmpty(values)) {
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

  containsAll<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    const values = this.getValue(input);

    if (!isUndefined(values) && !isEmpty(values)) {
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

  inAssetSubtree<K extends DeepKeyOf<T>>(
    key: K,
    input?: ACDMFilterInput<T, K>
  ) {
    const values = this.getValue(input);

    if (!isUndefined(values) && !isEmpty(values)) {
      const property = this.getProperty(key);

      this.filters = [
        ...this.filters,
        {
          inAssetSubtree: {
            property,
            values,
          },
        },
      ];
    }

    return this;
  }

  search<K extends DeepKeyOf<T>>(key: K, value?: string) {
    if (!isUndefined(value) && !isEmpty(value)) {
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

  range<K extends DeepKeyOf<T>>(key: K, value?: RangeValue<T[K]>) {
    if (!isUndefined(value)) {
      const property = this.getProperty(key);

      this.filters = [
        ...this.filters,
        {
          range: {
            property,
            ...value,
          },
        },
      ];
    }

    return this;
  }
}

type BuilderFn<T extends Resource, V = ValueType> = (
  key: DeepKeyOf<T>,
  value: V
) => ACDMFilterBuilder<T>;

export type ACDMAdvancedFilter<T extends Resource> = ACDMFilter<
  T,
  DeepKeyOf<T>
>;

export class ACDMFilterBuilder<
  T extends Resource
> extends BaseACDMFilterBuilder<T> {
  private actions: Record<Operator, BuilderFn<T, any>> = {
    [Operator.STARTS_WITH]: this.startsWith,
    [Operator.NOT_STARTS_WITH]: this.notStartsWith,
    [Operator.CONTAINS]: this.contains,
    [Operator.NOT_CONTAINS]: this.notContains,
    [Operator.BETWEEN]: this.between,
    [Operator.NOT_BETWEEN]: this.notBetween,
    [Operator.GREATER_THAN]: this.greaterThan,
    [Operator.LESS_THAN]: this.lessThan,
    [Operator.EQUALS]: this.equals,
    [Operator.NOT_EQUALS]: this.notEquals,
    [Operator.BEFORE]: this.before,
    [Operator.NOT_BEFORE]: this.notBefore,
    [Operator.AFTER]: this.after,
    [Operator.NOT_AFTER]: this.notAfter,
    [Operator.ON]: this.on,
    [Operator.NOT_ON]: this.notOn,
    [Operator.IS_TRUE]: this.isTrue,
    [Operator.IS_FALSE]: this.isFalse,
    [Operator.IS_SET]: this.isSet,
    [Operator.IS_NOT_SET]: this.isNotSet,
  };

  private getBuilder(operator: Operator): BuilderFn<T> {
    const action = this.actions[operator];
    return action.bind(this);
  }

  private getFieldValue(input?: FieldValue | (() => FieldValue | undefined)) {
    if (input instanceof Function) {
      return input();
    }
    return input;
  }

  construct<K extends DeepKeyOf<T>>(
    key: K,
    input?: FieldValue | (() => FieldValue | undefined)
  ) {
    const fieldValue = this.getFieldValue(input);

    if (!isUndefined(fieldValue)) {
      const { operator, value } = fieldValue;
      const builder = this.getBuilder(operator);
      builder(key, value);
    }

    return this;
  }

  startsWith<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    return this.prefix(key, input);
  }

  notStartsWith<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    return this.not(new ACDMFilterBuilder<T>().startsWith(key, input));
  }

  contains<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    return this.in(key, input);
  }

  notContains<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    return this.not(new ACDMFilterBuilder<T>().contains(key, input));
  }

  between<K extends DeepKeyOf<T>>(key: K, value: [T[K], T[K]]) {
    const [gte, lte] = value;
    return this.range(key, { gte, lte });
  }

  notBetween<K extends DeepKeyOf<T>>(key: K, value: [T[K], T[K]]) {
    return this.not(new ACDMFilterBuilder<T>().between(key, value));
  }

  greaterThan<K extends DeepKeyOf<T>>(key: K, value: T[K]) {
    return this.range(key, { gt: value });
  }

  lessThan<K extends DeepKeyOf<T>>(key: K, value: T[K]) {
    return this.range(key, { lt: value });
  }

  notEquals<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    return this.not(new ACDMFilterBuilder<T>().equals(key, input));
  }

  before<K extends DeepKeyOf<T>>(key: K, value: T[K]) {
    return this.range(key, { lt: value });
  }

  notBefore<K extends DeepKeyOf<T>>(key: K, value: T[K]) {
    return this.not(new ACDMFilterBuilder<T>().before(key, value));
  }

  after<K extends DeepKeyOf<T>>(key: K, value: T[K]) {
    return this.range(key, { gt: value });
  }

  notAfter<K extends DeepKeyOf<T>>(key: K, value: T[K]) {
    return this.not(new ACDMFilterBuilder<T>().after(key, value));
  }

  on<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    return this.equals(key, input);
  }

  notOn<K extends DeepKeyOf<T>>(key: K, input?: ACDMFilterInput<T, K>) {
    return this.not(new ACDMFilterBuilder<T>().on(key, input));
  }

  isTrue<K extends DeepKeyOf<T>>(key: K) {
    return this.equals(key, true as ACDMFilterInput<T, K>);
  }

  isFalse<K extends DeepKeyOf<T>>(key: K) {
    return this.equals(key, false as ACDMFilterInput<T, K>);
  }

  isSet<K extends DeepKeyOf<T>>(key: K) {
    return this.exists(key);
  }

  isNotSet<K extends DeepKeyOf<T>>(key: K) {
    return this.notExists(key);
  }
}
