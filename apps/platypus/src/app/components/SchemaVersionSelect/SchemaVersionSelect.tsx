import { useEffect, useState } from 'react';
import { OptionType, Select } from '@cognite/cogs.js';

import useSelector from '@platypus-app/hooks/useSelector';
import { SolutionState } from '@platypus-app/redux/reducers/global/solutionReducer';

export const SchemaVersionSelect = ({
  onChange,
}: {
  onChange: (seletedValue: string) => void;
}) => {
  const { selectedSchema, schemas } = useSelector<SolutionState>(
    (state) => state.solution
  );

  const [versionOptions, setVersionOptions] = useState<OptionType<string>[]>(
    []
  );

  const formatVersionString = (schemaVersion?: string) => `V. ${schemaVersion}`;

  const [version, setVersion] = useState<OptionType<string>>({
    value: selectedSchema?.version,
    label: formatVersionString(selectedSchema?.version),
  });

  useEffect(() => {
    const versions = schemas.map((s) => {
      return {
        value: s.version,
        label: formatVersionString(s.version),
      };
    });
    setVersionOptions(versions);
  }, [schemas, selectedSchema]);

  return (
    <Select
      value={version}
      options={versionOptions}
      onChange={(newValue: { value: string; label: string }) => {
        setVersion({ value: newValue.value, label: newValue.label });
        onChange(newValue.value);
      }}
      closeMenuOnSelect
    />
  );
};
