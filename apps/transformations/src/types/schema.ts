export type ColumnSchema = {
  name: string;
  sqlType: string;
  nullable: boolean;
};

export type PreviewResults = {
  schema: ColumnSchema[];
  results: { [K: string]: string }[];
};
