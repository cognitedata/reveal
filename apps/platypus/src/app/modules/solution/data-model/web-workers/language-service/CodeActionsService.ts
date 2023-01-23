/* eslint-disable no-useless-escape */
import {
  DataModelTypeDefs,
  DataModelTypeDefsField,
  DataModelTypeDefsFieldType,
} from '@platypus/platypus-core';
import {
  CodeActionEdit,
  CodeActionEditItem,
  CodeActionsOptions,
  CodeEditorRange,
  DiagnosticItem,
  EditorCodeAction,
} from './types';

export class CodeActionsService {
  getCodeActions(
    graphQlCode: string,
    range: CodeEditorRange,
    diagnostics: DiagnosticItem[],
    options: CodeActionsOptions,
    dataModelTypeDefs: DataModelTypeDefs | null
  ) {
    const missingInterfaceFieldsDiagnostics: DiagnosticItem[] = [];

    const codeActions = diagnostics
      .map((error) => {
        if (this.isMissingInterfaceField(error.message)) {
          missingInterfaceFieldsDiagnostics.push(error);
        }
        return this.getCodeAction(error, options, dataModelTypeDefs);
      })
      .filter((item) => item);

    if (missingInterfaceFieldsDiagnostics.length > 0) {
      const missingInterfaceFieldsAction = this.handleMissingInterfaceFields(
        missingInterfaceFieldsDiagnostics,
        dataModelTypeDefs
      );

      codeActions.push(missingInterfaceFieldsAction);
    }

    return codeActions;
  }

  private mapMarkerDataToCodeAction(
    title: string,
    edits: CodeActionEditItem[],
    errorMarker: DiagnosticItem
  ): EditorCodeAction {
    return {
      title: title, // Name of quickfix
      diagnostics: [errorMarker],
      kind: 'quickfix',
      edit: {
        edits: edits.map((edit) => ({ edit })),
      },
      isPreferred: true,
    };
  }

  private getMissingInterfaceInfo(message: string) {
    const missing = message
      .replace('Interface field', '')
      .match(/[a-zA-Z.]+/)?.[0]
      .split('.');

    if (!missing) {
      return { interfaceName: '', fieldName: '' };
    }

    return { interfaceName: missing[0], fieldName: missing[1] };
  }

  private getGraphQlTypeFromTypeDefs(type: DataModelTypeDefsFieldType) {
    const graphQlType = `${type.name}`;
    if (type.list && type.nonNull) {
      return `[${graphQlType}!]!`;
    }
    if (type.list) {
      return `[${graphQlType}]`;
    }
    if (type.nonNull) {
      return `${graphQlType}!`;
    }
    return graphQlType;
  }

  private handleMissingInterfaceFields(
    errorMarkers: DiagnosticItem[],
    dataModelTypeDefs: DataModelTypeDefs | null
  ) {
    const { interfaceName } = this.getMissingInterfaceInfo(
      errorMarkers[0].message
    );
    // get the interface
    const interfaceDef = dataModelTypeDefs?.types.find(
      (type) => type.name === interfaceName
    );
    // get the missing fields
    const missingFields: DataModelTypeDefsField[] = [];
    errorMarkers.forEach((error) => {
      const { fieldName } = this.getMissingInterfaceInfo(error.message);
      const missingField = interfaceDef?.fields.find(
        (field) => field.name === fieldName
      );
      if (missingField) {
        missingFields.push(missingField);
      }
    });

    // get edit range
    const editRange = {
      startLineNumber: errorMarkers[0].startLineNumber + 1,
      startColumn: 0,
      endLineNumber: errorMarkers[0].endLineNumber + 1,
      endColumn: 0,
    };

    return this.mapMarkerDataToCodeAction(
      `Implement all missing fields from interface "${interfaceName}"`,
      [
        {
          range: editRange as CodeEditorRange,
          text: `#region added remaining fields from ${interfaceName}\n\t${missingFields
            .map(
              (missingField) =>
                `${missingField.name}: ${this.getGraphQlTypeFromTypeDefs(
                  missingField.type
                )}`
            )
            .join('\n\t')}\n#endregion\n`,
        },
      ],
      errorMarkers[0]
    );
  }

  private handleMissingInterfaceField(
    errorMarker: DiagnosticItem,
    dataModelTypeDefs: DataModelTypeDefs | null
  ) {
    const { interfaceName, fieldName } = this.getMissingInterfaceInfo(
      errorMarker.message
    );

    const interfaceDef = dataModelTypeDefs?.types.find(
      (type) => type.name === interfaceName
    );

    const missingFieldType = interfaceDef?.fields.find(
      (field) => field.name === fieldName
    )?.type;

    if (!missingFieldType) {
      return null;
    }

    // we need to append this type at the end of the document
    const editRange = {
      startLineNumber: errorMarker.startLineNumber + 1,
      startColumn: 0,
      endLineNumber: errorMarker.endLineNumber + 1,
      endColumn: 0,
    };

    return this.mapMarkerDataToCodeAction(
      `Implement ${interfaceName}.${fieldName} field`,
      [
        {
          range: editRange as CodeEditorRange,
          text: `\t${fieldName}: ${this.getGraphQlTypeFromTypeDefs(
            missingFieldType
          )}\n`,
        },
      ],
      errorMarker
    );
  }

  private handleMissingType(
    errorMarker: DiagnosticItem,
    options: CodeActionsOptions
  ) {
    const missingType = errorMarker.message
      .replace(/^Unknown type \"/gm, '')
      .replace(/\".$/gim, '')
      .trim();

    if (!missingType) {
      return null;
    }

    // we need to append this type at the end of the document
    const editRange = {
      startLineNumber: options.lineCount,
      startColumn: options.lastLineLength,
      endLineNumber: options.lineCount,
      endColumn: options.lastLineLength,
    };

    return this.mapMarkerDataToCodeAction(
      'Create missing type',
      [
        {
          range: editRange as CodeEditorRange,
          text: `\n\ntype ${missingType} {\n  _autogeneratedField: String \n}\n`, // text to replace with
        },
      ],
      errorMarker
    );
  }

  private isUnknownTypePredicate(errorMessage: string): boolean {
    const regex = /^Unknown type \"/gm;
    return regex.test(errorMessage);
  }

  private isMissingInterfaceField(errorMessage: string): boolean {
    const prefix = /^Interface field/;
    const suffix = /does not provide it.$/;

    return prefix.test(errorMessage) && suffix.test(errorMessage);
  }

  private getCodeAction(
    error: DiagnosticItem,
    options: CodeActionsOptions,
    dataModelTypeDefs: DataModelTypeDefs | null
  ) {
    if (this.isUnknownTypePredicate(error.message)) {
      return this.handleMissingType(error, options);
    }
    if (this.isMissingInterfaceField(error.message)) {
      return this.handleMissingInterfaceField(error, dataModelTypeDefs);
    }
    return null;
  }
}
