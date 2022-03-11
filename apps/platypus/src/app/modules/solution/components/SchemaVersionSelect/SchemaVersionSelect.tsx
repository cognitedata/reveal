import { Select } from '@cognite/cogs.js';
import { StyledVersionContainer } from './elements';
import { SCHEMA_VERSION_LABEL } from '@platypus-app/utils/config';

export const SchemaVersionSelect = ({
  selectedVersion,
  versions,
  onChange,
}: {
  selectedVersion: string | undefined;
  versions: string[];
  onChange: (seletedValue: string) => void;
}) => {
  const versionOptions = versions.map((v) => ({
    value: v,
    label: SCHEMA_VERSION_LABEL(v),
  }));

  return (
    <StyledVersionContainer data-cy="schema-version-select">
      <Select
        value={{
          value: selectedVersion,
          label: SCHEMA_VERSION_LABEL(selectedVersion),
        }}
        options={versionOptions}
        onChange={(newValue: { value: string; label: string }) => {
          onChange(newValue.value);
        }}
        closeMenuOnSelect
      />
    </StyledVersionContainer>
  );
};
