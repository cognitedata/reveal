import { DataModelTypeDefs, DataModelValidationError } from '../../types';

import {
  ValidateDataModelBreakingChangeInfoDTO,
  ValidateDataModelDTO,
} from '../../dto';

interface ErrorTypeInfo {
  typeName: string;
  fieldName: string;
}

export class DataModelValidationErrorDataMapper {
  deserialize(
    validationError: ValidateDataModelDTO,
    typeDefs: DataModelTypeDefs
  ): DataModelValidationError {
    // Mixer API does not return errors in same format
    // Also Line numbers does not match ours
    // What we are doing here is finding the correct line number in AST
    const locations = [];

    const typeFieldNames = this.getTypeAndFieldNames(validationError);

    const dataModelValidationError: DataModelValidationError = {
      ...(validationError as any),
    } as DataModelValidationError;

    const typeDef = typeDefs.types.find(
      (typeDef) => typeDef.name === typeFieldNames.typeName
    );
    const fieldDef = typeDef?.fields?.find(
      (field) => field.name === typeFieldNames.fieldName
    );

    // Assign Type and Field names
    dataModelValidationError.typeName = typeDef?.name;
    dataModelValidationError.fieldName = fieldDef?.name;

    // Find correct positions
    locations.push({
      line:
        (fieldDef ? fieldDef?.location?.line : typeDef?.location?.line) || 1,
      column:
        (fieldDef ? fieldDef?.location?.column : typeDef?.location?.column) ||
        1,
    });

    if (locations.length) {
      dataModelValidationError.locations = locations;
    }

    return dataModelValidationError;
  }

  private getTypeAndFieldNames(
    validationError: ValidateDataModelDTO
  ): ErrorTypeInfo {
    const response = {
      typeName: '',
      fieldName: '',
    } as ErrorTypeInfo;

    // If breaking changes info is provided, get types info from there
    if (
      validationError.extensions?.breakingChangeInfo ||
      validationError.breakingChangeInfo
    ) {
      const breakingChangeInfo = (validationError.extensions
        ?.breakingChangeInfo ||
        validationError.breakingChangeInfo) as ValidateDataModelBreakingChangeInfoDTO;

      response.typeName = breakingChangeInfo.typeName;
      response.fieldName = breakingChangeInfo.fieldName;

      validationError.extensions = Object.assign(
        validationError.extensions || {},
        {
          breakingChangeInfo,
        }
      );
    } else {
      // go hard way, the type and field should be in the error message
      // Usually they should be marked in the text, try to extract them
      const colonMarkedTypeFieldNamesPattern = /:\s\w+\.\w+/gm;
      const quotationMarkedTypeFieldNamesPattern = /"\w+\.\w+/gm;
      const genericTypeFieldNamesPattern = /\w+\.\w+/gm;

      let typeFieldNameString = validationError.message.match(
        colonMarkedTypeFieldNamesPattern
      );

      if (!typeFieldNameString?.length) {
        typeFieldNameString = validationError.message.match(
          quotationMarkedTypeFieldNamesPattern
        );
      }
      if (!typeFieldNameString?.length) {
        typeFieldNameString = validationError.message.match(
          genericTypeFieldNamesPattern
        );
      }

      if (typeFieldNameString?.length) {
        const nameParts = typeFieldNameString[0].split('.');
        response.typeName = nameParts[0].replace(': ', '').replace('"', '');
        response.fieldName = nameParts[1];
      }
    }

    return response;
  }
}
