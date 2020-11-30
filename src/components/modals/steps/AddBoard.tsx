import React from 'react';
import { Button, Input, Select } from '@cognite/cogs.js';
import {
  SelectLabel,
  SelectContainer,
  MultiStepModalFooter,
} from 'components/modals/elements';

interface Props {
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  handleStepNext: () => void;
  handleStepBack: () => void;
}

export const AddBoard: React.FC<Props> = ({
  handleOnChange,
  handleStepBack,
  handleSubmit,
  handleStepNext,
}: Props) => {
  return (
    <>
      <Input
        autoComplete="off"
        title="Title"
        name="title"
        variant="noBorder"
        placeholder="Title"
        onChange={handleOnChange}
        fullWidth
      />
      <SelectContainer>
        <SelectLabel>Select type</SelectLabel>
        <Select theme="grey" placeholder="Select type" />
      </SelectContainer>
      <Input
        autoComplete="off"
        title="URL"
        name="url"
        variant="noBorder"
        placeholder="URL"
        onChange={handleOnChange}
        fullWidth
      />
      <Input
        autoComplete="off"
        title="Iframe snapshot"
        name="embedTag"
        variant="noBorder"
        placeholder="Tag"
        onChange={handleOnChange}
        fullWidth
      />
      <MultiStepModalFooter>
        <Button variant="ghost" onClick={handleStepBack}>
          Back
        </Button>
        <div>
          <Button type="secondary" onClick={handleStepNext}>
            Next
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            Create
          </Button>
        </div>
      </MultiStepModalFooter>
    </>
  );
};
