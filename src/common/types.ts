export type PropertyAggregate = {
  count?: number;
  values: { property: string[] }[];
};

export type PropertyAggregateResponse = {
  items: PropertyAggregate[];
};
