export interface SDKDataSetsError {
  errors: { status: number; message: string }[];
}

export interface DataSetError {
  errors: {
    missing: { id: number }[];
    code: number;
    message: string;
  }[];
}
