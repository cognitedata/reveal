import capitalize from 'lodash/capitalize';

const mapCapitalizedValueToOption = (value: string) => ({
  label: capitalize(value),
  value,
});

export default mapCapitalizedValueToOption;
