export interface ErrorObj {
  code: number;
  message: string;
}
export interface SDKError {
  error: ErrorObj;
}

export interface ErrorVariations {
  error?: ErrorObj;
  code?: number;
  message?: string;
  status?: number;
  data?: ErrorObj;
}

export interface SDKErrorResponse {
  status: number;
  data: ErrorObj;
}

export interface SDKDataSetsError {
  errors: { status: number; message: string }[];
}
