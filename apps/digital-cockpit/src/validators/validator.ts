import forEach from 'lodash/forEach';
import set from 'lodash/set';
import isFunction from 'lodash/isFunction';
import { FormikErrors } from 'formik';
import { ValidationRules, Validator } from './types';

const validateValue = (
  value: any,
  rules: ValidationRules
): string | undefined => {
  let error: string | undefined;
  const rule = rules;
  if (!rule) return;

  if (rule.validate && isFunction(rule.validate) && value) {
    error = rule.validate(value);
  }
  if (rule.pattern && value) {
    if (!new RegExp(rule.pattern.value).exec(value as string)) {
      error = rule.pattern.message || 'invalid field';
    }
  }
  if (rule.required) {
    if (!value?.trim()) {
      error = rule.required.message || 'required field';
    }
  }
  return error; // eslint-disable-line consistent-return
};

export type ValidationErrors = { [key: string]: string | undefined };

export function validateValues(
  values = {},
  rules: Validator,
  customErrors: ValidationErrors = {}
) {
  const errors = {} as FormikErrors<typeof values>;
  forEach(values, (val: any, name) => {
    const rule = rules[name];
    if (!rule) return;
    const validationError = customErrors[name] || validateValue(val, rule);
    validationError && set(errors, name, validationError);
  });
  return errors;
}
