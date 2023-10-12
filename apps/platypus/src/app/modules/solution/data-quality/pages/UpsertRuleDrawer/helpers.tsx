import { FormikErrors } from 'formik';

import { OptionType } from '@cognite/cogs.js';

import { RuleSeverity } from '../../api/codegen';

export const conditionsExample = `
{
  "and": [
    {
      "exists": ["{name}"]
    },
    {
      "equals": ["{name}", "John Doe"]
    }
  ]
}`;

export const RuleSeverityOptions: OptionType<RuleSeverity>[] = [
  {
    label: 'Critical',
    value: 'Critical',
  },
  {
    label: 'High',
    value: 'High',
  },
  {
    label: 'Medium',
    value: 'Medium',
  },
  {
    label: 'Low',
    value: 'Low',
  },
];

export type RuleFormValues = {
  conditions: string;
  dataScopeId?: string;
  dataType: string;
  description: string;
  errorMessage: string;
  name: string;
  severity: RuleSeverity;
};

export const emptyFormValues: RuleFormValues = {
  conditions: '',
  dataScopeId: undefined,
  dataType: '',
  description: '',
  errorMessage: '',
  name: '',
  severity: 'Critical',
};

/** Validate the fields used to upsert a rule */
export const handleValidate = (
  values: RuleFormValues
): FormikErrors<RuleFormValues> => {
  const errors: FormikErrors<RuleFormValues> = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required!';
  }

  if (!values.dataType.trim()) {
    errors.dataType = 'Data type is required!';
  }

  if (!values.conditions.trim()) {
    errors.conditions = 'Conditions are required!';
  }

  return errors;
};
