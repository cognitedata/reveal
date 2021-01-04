export type LoadingStatusType = 'IDLE' | 'LOADING' | 'SUCCESS' | 'FAILED';
export type LoadingStatus = {
  status: LoadingStatusType;
  error?: Error;
};
