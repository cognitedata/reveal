import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import { MarkerSeverity } from 'monaco-editor';
import {
  ValidateSchemaError,
  ValidationError,
  ValidationMarker,
} from './types';

export const validateGraphQlSchemaString = (textToValidate: string) => {
  const graphqlUtils = new GraphQlUtilsService();

  let markers = [] as ValidationMarker[];
  try {
    graphqlUtils.clear();
    graphqlUtils.parseSchema(textToValidate);
    markers = [];
  } catch (err) {
    const validationError = err as ValidateSchemaError;
    if (validationError.message && validationError.locations) {
      markers = validationError.locations.map((loc: ValidationError) => ({
        severity: MarkerSeverity.Error,
        startLineNumber: loc.line,
        startColumn: 1,
        endLineNumber: loc.line,
        endColumn: loc.column,
        message: validationError.message,
      }));
    }
  }

  return markers;
};
