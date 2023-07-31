import { CogniteError } from '@cognite/sdk';

import { HTTP_STATUS_MESSAGES } from './constants';

export type PossibleError = Error | CogniteError;

export interface SafeError {
  message: string;
  status: HttpStatus;
  errors: {
    message: string;
    status: number;
  }[];
}

export type HttpStatus = keyof typeof HTTP_STATUS_MESSAGES;
