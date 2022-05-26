export type GenericApiError = {
  error: boolean;
};

export interface BaseAPIResult {
  success?: string;
  updated?: boolean;
  error?: boolean;
}
