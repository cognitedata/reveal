import React from 'react';
import { Button, Input } from '@cognite/cogs.js';
import { MultiStepModalFooter } from 'components/modals/elements';

interface Props {
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleCloseModal: () => void;
  handleSubmit: () => void;
  handleStepNext: () => void;
}

export const CreateSuite: React.FC<Props> = ({
  handleOnChange,
  handleCloseModal,
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
        placeholder="Name of suite"
        onChange={handleOnChange}
        fullWidth
      />
      <Input
        autoComplete="off"
        title="Description"
        name="description"
        variant="noBorder"
        placeholder="Description that clearly explains the purpose of the suite"
        onChange={handleOnChange}
        fullWidth
      />
      <MultiStepModalFooter>
        <Button variant="ghost" onClick={handleCloseModal}>
          Cancel
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
