export interface SDKError {
  error: {
    code: number;
    message: string;
  };
}

export interface SDKDataSetsError {
  errors: { status: number; message: string }[];
}
