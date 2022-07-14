import { DataModelValidationError } from '@platypus-core/domain/data-model';

export interface ValidationError {
  status: number;
  message: string;
  errorMessage?: string;
  missing?: Record<string, string>[];
  locations?: { line: number; column: number }[];
  extensions?: {
    breakingChangeInfo?: {
      typeOfChange:
        | 'TYPE_REMOVED'
        | 'FIELD_REMOVED'
        | 'FIELD_TYPE_CHANGED'
        | 'CONSTRAINT_CHANGED';
      typeName: string;
      fieldName: string;
      previousValue: string;
      currentValue: string;
    };
  };
}
export interface SdkError {
  status: number;
  message: string;
  errorMessage?: string;
  missing?: Record<string, string>[];
  duplicated?: Record<string, string>[];
  statuses?: number[];
  errors: ValidationError[];
  failed: Record<string, string>[];
  stack?: unknown;
}

export type ErrorType =
  | 'UNKNOWN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'SERVER_ERROR'
  | 'NOT_AUTHORIZED'
  | 'NOT_AUTHENTICATED'
  | 'BREAKING_CHANGE';
export class PlatypusError {
  message: string;
  code?: number;
  type: ErrorType;
  stack?: unknown;
  errors?: ValidationError[];

  constructor(
    message: string,
    type: ErrorType,
    code?: number,
    stack?: unknown,
    errors?: ValidationError[]
  ) {
    this.message = message;
    this.type = type as ErrorType;
    if (code) this.code = code;

    if (stack) {
      this.stack = stack;
    }

    if (errors) {
      this.errors = errors;
    }
  }

  static fromSdkError(err: SdkError): PlatypusError {
    const platypusErrorMsg = new PlatypusError(
      err.message as string,
      'UNKNOWN',
      err.status,
      err.stack,
      err.errors || []
    );

    const scopedMsg =
      err.errors && err.errors.length === 1
        ? err.errors[0].errorMessage
          ? err.errors[0].errorMessage
          : err.errors[0].message
        : err.message;

    switch (err.status) {
      case 400: {
        // Handle breaking changes for templates API
        if (err.errorMessage && err.errorMessage.includes('breaking changes')) {
          platypusErrorMsg.message = err.errorMessage;
          platypusErrorMsg.type = 'BREAKING_CHANGE';
          break;
        }
        // Handle breaking changes for mixer API
        if (err.errors?.some((error) => error.extensions?.breakingChangeInfo)) {
          const breakingChangeList = err.errors
            .map((error) => `* ${error.message}`)
            .join('\n');
          platypusErrorMsg.message = `Breaking change(s): \n\n${breakingChangeList}`;
          platypusErrorMsg.type = 'BREAKING_CHANGE';
          break;
        }

        // Handle breaking changes for mixer API
        if (err.errors?.some((error: any) => error?.breakingChangeInfo)) {
          platypusErrorMsg.errors = err.errors.map((err) => {
            return {
              ...err,
              extensions: {
                breakingChangeInfo: (err as any).breakingChangeInfo,
              },
            };
          });
          const breakingChangeList = err.errors
            .map((error) => `* ${error.message}`)
            .join('\n');
          platypusErrorMsg.message = `Breaking change(s): \n\n${breakingChangeList}`;
          platypusErrorMsg.type = 'BREAKING_CHANGE';
          break;
        }

        if (err.missing) {
          platypusErrorMsg.message = scopedMsg;
          platypusErrorMsg.type = 'NOT_FOUND';
          break;
        }
        platypusErrorMsg.message = err.errorMessage
          ? err.errorMessage
          : scopedMsg;
        platypusErrorMsg.type = 'VALIDATION';
        break;
      }
      case 401: {
        platypusErrorMsg.message = scopedMsg;
        platypusErrorMsg.type = 'NOT_AUTHENTICATED';
        break;
      }
      case 403: {
        platypusErrorMsg.message = scopedMsg;
        platypusErrorMsg.type = 'NOT_AUTHORIZED';
        break;
      }
      case 404: {
        platypusErrorMsg.message = scopedMsg;
        platypusErrorMsg.type = 'NOT_FOUND';
        break;
      }
      case 409: {
        platypusErrorMsg.message = scopedMsg;
        platypusErrorMsg.type = 'VALIDATION';
        break;
      }
      case 500: {
        platypusErrorMsg.message = scopedMsg;
        platypusErrorMsg.type = 'SERVER_ERROR';
        break;
      }
      default: {
        platypusErrorMsg.message = err.message;
        platypusErrorMsg.type = 'UNKNOWN';
        break;
      }
    }

    return platypusErrorMsg;
  }

  static fromDataModelValidationError(
    errors: DataModelValidationError[]
  ): PlatypusError {
    const errorResponse = new PlatypusError(
      'Your Data Model GraphQL schema contains errors.',
      'VALIDATION',
      400,
      null,
      errors
    );
    if (errors?.some((error) => error.extensions?.breakingChangeInfo)) {
      errorResponse.type = 'BREAKING_CHANGE';
      const breakingChangeList = errorResponse
        .errors!.map((error) => `* ${error.message}`)
        .join('\n');
      errorResponse.message = `Breaking change(s): \n\n${breakingChangeList}`;
    }

    return errorResponse;
  }

  toString(): string {
    return this.message;
  }
}
