export interface BaseAPIResult {
  success?: string;
  updated?: boolean;
  error?: boolean;
}

export type GenericApiError = {
  error: boolean;
};
