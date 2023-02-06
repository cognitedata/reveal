export interface GraphQlDmlVersionDTO {
  space: string;
  externalId: string;
  version: string;
  name?: string;
  description?: string;
  graphQlDml?: string;
  createdTime?: string | number;
  lastUpdatedTime?: string | number;
}

export interface UpsertDataModelResult {
  errors: Error[] | null;
  result: GraphQlDmlVersionDTO;
}

type Error = {
  message: string;
  location: SourceLocationRange;
};
type SourceLocationRange = {
  start: SourceLocation;
  end: SourceLocation;
};

type SourceLocation = {
  line: number;
  column: number;
  offset?: number;
};
