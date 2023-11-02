import { FieldValue, Operator, ValueType } from '@fdx/shared/types/filters';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

type Property = string;

type BoolFilter =
  | { and: FDMFilter[] }
  | { or: FDMFilter[] }
  | { not: FDMFilter };

type LeafFilter =
  | { prefix: string }
  | { in: string[] }
  | { gte: RangeValue }
  | { gt: RangeValue }
  | { lte: RangeValue }
  | { lt: RangeValue }
  | { eq: PrimitiveValue }
  | { isNull: boolean };

type FDMFilter = BoolFilter | Record<Property, LeafFilter>;

type PrimitiveValue = string | number | boolean | Date;

type RangeValue = number | Date;
type RangeOperator = 'gte' | 'gt' | 'lte' | 'lt';
type RangeFilter<T> = NonEmpty<Record<RangeOperator, T>>;

type FDMFilterInput<T> = T | (() => T | undefined);

class BaseFDMFilterBuilder {
  protected filters: FDMFilter[] = [];

  private addFilter(property: Property, filter: LeafFilter) {
    this.filters = [
      ...this.filters,
      {
        [property]: filter,
      },
    ];
  }

  private getValue<T>(input?: FDMFilterInput<T>) {
    if (input instanceof Function) {
      return input();
    }
    return input;
  }

  build() {
    if (isEmpty(this.filters)) {
      return undefined;
    }

    if (this.filters.length === 1) {
      return this.filters[0];
    }

    return this.filters;
  }

  and(builder: BaseFDMFilterBuilder) {
    const build = builder.build();

    if (!isUndefined(build)) {
      this.filters = [
        ...this.filters,
        {
          and: isArray(build) ? build : [build],
        },
      ];
    }

    return this;
  }

  or(builder: BaseFDMFilterBuilder) {
    const build = builder.build();

    if (!isUndefined(build)) {
      this.filters = [
        ...this.filters,
        {
          or: isArray(build) ? build : [build],
        },
      ];
    }

    return this;
  }

  not(builder: BaseFDMFilterBuilder) {
    const build = builder.build();

    if (isUndefined(build)) {
      return this;
    }

    if (!isArray(build)) {
      this.filters = [...this.filters, { not: build }];
    }

    if (isArray(build)) {
      this.filters = [
        ...this.filters,
        {
          and: build.map((item) => ({ not: item })),
        },
      ];
    }

    return this;
  }

  prefix(property: Property, input?: FDMFilterInput<string>) {
    const value = this.getValue(input);

    if (!isUndefined(value)) {
      this.addFilter(property, {
        prefix: value,
      });
    }

    return this;
  }

  in(property: Property, input?: FDMFilterInput<string[]>) {
    const values = this.getValue(input);

    if (!isUndefined(values) && !isEmpty(values)) {
      this.addFilter(property, {
        in: values,
      });
    }

    return this;
  }

  range(property: Property, value?: RangeFilter<RangeValue>) {
    if (!isUndefined(value)) {
      this.addFilter(property, value);
    }

    return this;
  }

  equals(property: Property, input?: FDMFilterInput<PrimitiveValue>) {
    const value = this.getValue(input);

    if (!isUndefined(value)) {
      this.addFilter(property, {
        eq: value,
      });
    }

    return this;
  }

  exists(property: Property) {
    this.addFilter(property, {
      isNull: false,
    });

    return this;
  }

  notExists(property: Property) {
    this.addFilter(property, {
      isNull: true,
    });

    return this;
  }
}

type BuilderFn<V = ValueType> = (
  property: Property,
  value: V
) => FDMFilterBuilder;

export class FDMFilterBuilder extends BaseFDMFilterBuilder {
  private builders: Record<Operator, BuilderFn<any>> = {
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

  private getBuilderByOperator(operator: Operator) {
    return this.builders[operator] as BuilderFn;
  }

  construct(field: string, fieldValue: FieldValue) {
    const { operator, value } = fieldValue;
    const builder = this.getBuilderByOperator(operator);

    builder(field, value);

    return this;
  }

  startsWith(property: Property, value: string) {
    return this.prefix(property, value);
  }

  notStartsWith(property: Property, value: string) {
    return this.not(new FDMFilterBuilder().startsWith(property, value));
  }

  contains(property: Property, value: string[]) {
    return this.in(property, value);
  }

  notContains(property: Property, value: string[]) {
    return this.not(new FDMFilterBuilder().contains(property, value));
  }

  between(property: Property, value: [RangeValue, RangeValue]) {
    const [gte, lte] = value;
    return this.range(property, { gte, lte });
  }

  notBetween(property: Property, value: [RangeValue, RangeValue]) {
    return this.not(new FDMFilterBuilder().between(property, value));
  }

  greaterThan(property: Property, value: number) {
    return this.range(property, { gt: value });
  }

  lessThan(property: Property, value: number) {
    return this.range(property, { lt: value });
  }

  notEquals(property: Property, value: PrimitiveValue) {
    return this.not(new FDMFilterBuilder().equals(property, value));
  }

  before(property: Property, value: Date) {
    return this.range(property, { lt: value });
  }

  notBefore(property: Property, value: Date) {
    return this.not(new FDMFilterBuilder().before(property, value));
  }

  after(property: Property, value: Date) {
    return this.range(property, { gt: value });
  }

  notAfter(property: Property, value: Date) {
    return this.not(new FDMFilterBuilder().after(property, value));
  }

  on(property: Property, value: Date) {
    return this.equals(property, value);
  }

  notOn(property: Property, value: Date) {
    return this.not(new FDMFilterBuilder().on(property, value));
  }

  isTrue(property: Property) {
    return this.equals(property, true);
  }

  isFalse(property: Property) {
    return this.equals(property, false);
  }

  isSet(property: Property) {
    return this.exists(property);
  }

  isNotSet(property: Property) {
    return this.notExists(property);
  }
}
