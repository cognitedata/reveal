/** Get the id of the default fallback ruleset. */
export const getDefaultRulesetId = (dataSourceId?: string) =>
  `${dataSourceId}_default`;

/** Make a query key that will be used to fetch all the entities for the given target. */
export const getQueryKey = (
  entities: string,
  target: string,
  dataSourceId?: string
) => [dataSourceId, target, entities];
