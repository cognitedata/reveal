/**
 * Used to determine query keys for react-query mutations
 */
export const QUERY_KEY = {
  MODELS: ['models'],
  REVISIONS: (args: { modelId: number; revisionId?: number }) => [
    'revisions',
    args,
  ],
};
