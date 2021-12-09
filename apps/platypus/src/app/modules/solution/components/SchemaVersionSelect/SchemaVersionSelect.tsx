import { useEffect, useState } from 'react';
import { OptionType, Select } from '@cognite/cogs.js';

export const SchemaVersionSelect = ({
  selectedVersion,
  versions,
  onChange,
}: {
  selectedVersion: string | undefined;
  versions: string[];
  onChange: (seletedValue: string) => void;
}) => {
  const [versionOptions, setVersionOptions] = useState<OptionType<string>[]>(
    []
  );

  const formatVersionString = (schemaVersion?: string) => `V. ${schemaVersion}`;

  useEffect(() => {
    setVersionOptions(
      versions.map((v) => ({
        value: v,
        label: formatVersionString(v),
      }))
    );
  }, [versions]);

  return (
    <Select
      value={{
        value: selectedVersion,
        label: formatVersionString(selectedVersion),
      }}
      options={versionOptions}
      onChange={(newValue: { value: string; label: string }) => {
        onChange(newValue.value);
      }}
      closeMenuOnSelect
    />
  );
};
