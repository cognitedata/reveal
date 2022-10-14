import {
  DocumentFilter,
  DocumentFilterRangeValue,
  DocumentFilterValue,
  DocumentFilterValueList,
} from '@cognite/sdk';
import { isObjectEmpty } from 'app/utils/compare';

// type Property = [string, string?, string?]
type Property = string[];

export class AdvancedFilterBuilder {
  filters = [] as DocumentFilter[];

  private value() {
    return this.filters;
  }
  build() {
    if (isObjectEmpty(this.filters[0])) return undefined;

    return this.filters[0];
  }

  and(builder: AdvancedFilterBuilder) {
    this.filters = [...this.filters, { and: builder.value() }];
    return this;
  }
  or(builder: AdvancedFilterBuilder) {
    this.filters = [...this.filters, { or: builder.value() }];
    return this;
  }
  not(builder: AdvancedFilterBuilder) {
    const build = builder.build();

    if (build !== undefined) {
      this.filters = [...this.filters, { not: build }];
    }

    return this;
  }

  equals(property: string[], value: DocumentFilterValue) {
    this.filters = [
      ...this.filters,
      {
        equals: {
          property,
          value,
        },
      },
    ];

    return this;
  }
  prefix(property: Property, value: DocumentFilterValue) {
    this.filters = [
      ...this.filters,
      {
        prefix: {
          property,
          value,
        },
      },
    ];

    return this;
  }
  in(property: Property, values: DocumentFilterValueList) {
    this.filters = [
      ...this.filters,
      {
        in: {
          property,
          values,
        },
      },
    ];

    return this;
  }
  containsAny(property: Property, values: DocumentFilterValueList) {
    this.filters = [
      ...this.filters,
      {
        containsAny: {
          property,
          values,
        },
      },
    ];

    return this;
  }
  containsAll(property: Property, values: DocumentFilterValueList) {
    this.filters = [
      ...this.filters,
      {
        containsAll: {
          property,
          values,
        },
      },
    ];

    return this;
  }
  exists(property: Property) {
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
  range(
    property: Property,
    values: {
      gte?: DocumentFilterRangeValue;
      gt?: DocumentFilterRangeValue;
      lte?: DocumentFilterRangeValue;
      lt?: DocumentFilterRangeValue;
    }
  ) {
    this.filters = [
      ...this.filters,
      {
        range: {
          property,
          ...values,
        },
      },
    ];

    return this;
  }
}
