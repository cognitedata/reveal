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

export interface DataModelVersionFilter {
  externalId?: {
    eq?: string;
    in?: string[];
  };
  //Todo https://github.com/cognitedata/schema-service/pull/567/files
}

export interface DataModelVersionSort {
  createdTime: 'ASCENDING' | 'DESCENDING';
}

export interface UpsertDataModelResult {
  errors: Error[];
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
