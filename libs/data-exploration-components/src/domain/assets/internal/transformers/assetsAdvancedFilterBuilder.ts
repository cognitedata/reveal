import { AdvancedFilterBuilder } from '../../../builders';

export class AssetsAdvancedFilterBuilder<T extends Record<string, unknown>> {
  private filters = new AdvancedFilterBuilder<T>();
  private nilFilters = new AdvancedFilterBuilder<T>();
  private searchQuery = new AdvancedFilterBuilder<T>();
  private searchQueryMetadataKeys = new AdvancedFilterBuilder<T>();

  setFilters(builder: AdvancedFilterBuilder<T>) {
    this.filters = builder;
    return this;
  }

  setNilFilters(builder: AdvancedFilterBuilder<T>) {
    this.nilFilters = builder;
    return this;
  }

  setSearchQuery(builder: AdvancedFilterBuilder<T>) {
    this.searchQuery = builder;
    return this;
  }

  setSearchQueryMetadataKeys(builder: AdvancedFilterBuilder<T>) {
    this.searchQueryMetadataKeys = builder;
    return this;
  }

  build() {
    const builder = new AdvancedFilterBuilder<T>()
      .or(new AdvancedFilterBuilder<T>().and(this.filters).and(this.nilFilters))
      .or(this.searchQuery)
      .or(this.searchQueryMetadataKeys);

    return new AdvancedFilterBuilder<T>().and(builder).build();
  }
}
