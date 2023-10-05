import { DataModelValidationError } from '../../domain/data-model';

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
  | 'BREAKING_CHANGE'
  | 'DML_ERROR';
export class PlatypusError {
  message: string;
  code?: number;
  type: ErrorType;
  stack?: unknown;

  constructor(
    message: string,
    type: ErrorType,
    code?: number,
    stack?: unknown
  ) {
    this.message = message;
    this.type = type as ErrorType;
    if (code) this.code = code;

    if (stack) {
      this.stack = stack;
    }
  }

  static fromSdkError(err: SdkError): PlatypusError {
    const platypusErrorMsg = err.errors
      ? new PlatypusValidationError(
          err.message as string,
          'UNKNOWN',
          err.errors,
          err.status,
          err.stack
        )
      : new PlatypusError(
          err.message as string,
          'UNKNOWN',
          err.status,
          err.stack
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
        if (
          platypusErrorMsg instanceof PlatypusValidationError &&
          err.errors?.some((error: any) => error?.breakingChangeInfo)
        ) {
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

        // Checking for the case in v2 when the data model does not
        // have a published version yet
        // need to remove this when fully migrated to V3
        if (
          scopedMsg.includes(
            'Could not find api version for api with externalId = '
          ) &&
          scopedMsg.includes('and version = 1')
        ) {
          platypusErrorMsg.code = 409;
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
    const errorResponse = new PlatypusValidationError(
      'Your Data Model GraphQL schema contains errors.',
      'VALIDATION',
      errors,
      400
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

export class PlatypusValidationError extends PlatypusError {
  errors: ValidationError[];
  constructor(
    message: string,
    type: ErrorType,
    errors: ValidationError[],
    code?: number,
    stack?: unknown
  ) {
    super(message, type, code, stack);
    this.errors = errors;
  }
}

export type DmlError = {
  kind: string;
  message: string;
  hint: string;
  location: SourceLocationRange;
};

export type SourceLocationRange = {
  start: SourceLocation;
  end?: SourceLocation;
};

export type SourceLocation = {
  line: number;
  column: number;
  offset?: number;
};

export class PlatypusDmlError extends PlatypusError {
  errors: DmlError[];
  constructor(baseMessage: string, errors: DmlError[]) {
    super(baseMessage, 'DML_ERROR');
    this.errors = errors;
  }
}
