import { StringInput, StringInputProps } from '@data-exploration/components';

export const ExternalIdFilter = (props: StringInputProps) => {
  return <StringInput label="External ID" {...props} />;
};
