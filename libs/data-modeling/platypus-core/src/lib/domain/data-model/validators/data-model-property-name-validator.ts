import {
  ValidationRule,
  ValidatorResult,
} from '../../../boundaries/validation';

export class DataModelPropertyNameValidator extends ValidationRule {
  validate(field: string, value: string | null): ValidatorResult {
    const reservedPropertyNames = [
      'space',
      'externalId',
      'createdTime',
      'lastUpdatedTime',
      'deletedTime',
      'extensions',
    ];

    if (value && reservedPropertyNames.includes(value)) {
      return {
        valid: false,
        errors: {
          [field]:
            this.validationMessage ||
            `${value} is a reserved keyword and can not be used as a field name.`,
        },
      } as ValidatorResult;
    }

    if (value && value.startsWith('_')) {
      return {
        valid: false,
        errors: {
          [field]:
            this.validationMessage ||
            `${value} is not a valid field name. Field names cannot start with "_".`,
        },
      } as ValidatorResult;
    }

    return { valid: true, errors: {} };
  }
}
