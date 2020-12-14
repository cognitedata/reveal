import React from 'react';
import { Input } from '@cognite/cogs.js';
import { Suite } from 'store/suites/types';

interface Props {
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  suiteValues: Suite;
}

export const SuiteForm: React.FC<Props> = ({
  handleOnChange,
  suiteValues,
}: Props) => {
  return (
    <>
      <Input
        autoComplete="off"
        title="Title"
        name="title"
        value={suiteValues.title}
        variant="noBorder"
        placeholder="Name of suite"
        onChange={handleOnChange}
        fullWidth
      />
      <Input
        autoComplete="off"
        title="Description"
        name="description"
        value={suiteValues.description}
        variant="noBorder"
        placeholder="Description that clearly explains the purpose of the suite"
        onChange={handleOnChange}
        fullWidth
      />
    </>
  );
};
