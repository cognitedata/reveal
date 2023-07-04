import { RuleSeverity } from '@data-quality/api/codegen';
import { FormikErrors } from 'formik';

import { OptionType } from '@cognite/cogs.js';

export const conditionsExample = `
{
  "and": [
    {
      "exists": {
        "name": true
      }
    },
    {
      "equals": {
        "left": "{name}",
        "right": "Pipe-1"
      }
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
  dataType: string;
  description: string;
  errorMessage: string;
  name: string;
  severity: RuleSeverity;
};

export const emptyFormValues: RuleFormValues = {
  conditions: '',
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
