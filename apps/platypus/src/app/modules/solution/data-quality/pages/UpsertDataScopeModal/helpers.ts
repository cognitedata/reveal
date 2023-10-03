import { FormikErrors } from 'formik';

export const filtersExample = `
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

export type DataScopeFormValues = {
  dataType: string;
  filters: string;
  name: string;
};

export const emptyFormValues: DataScopeFormValues = {
  dataType: '',
  filters: '',
  name: '',
};

/** Validate the fields used to upsert a data scope */
export const handleValidate = (
  values: DataScopeFormValues
): FormikErrors<DataScopeFormValues> => {
  const errors: FormikErrors<DataScopeFormValues> = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required!';
  }

  if (!values.dataType.trim()) {
    errors.dataType = 'Data type is required!';
  }

  if (!values.filters.trim()) {
    errors.filters = 'Filters are required!';
  }

  return errors;
};
