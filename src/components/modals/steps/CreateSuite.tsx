import React from 'react';
import { Button, Input } from '@cognite/cogs.js';
import { MultiStepModalFooter } from 'components/modals/elements';

interface Props {
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleCloseModal: any;
  handleSubmit: () => void;
  handleStepNext: () => void;
  suiteValues: any;
  buttonNames: any;
  mode: any;
}

export const CreateSuite: React.FC<Props> = ({
  handleOnChange,
  handleCloseModal,
  handleSubmit,
  handleStepNext,
  suiteValues,
  buttonNames,
  mode,
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
      <MultiStepModalFooter>
        <Button variant="ghost" onClick={handleCloseModal}>
          Cancel
        </Button>
        <div>
          <Button type="secondary" onClick={handleStepNext}>
            {buttonNames[mode].goToBoards}
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            {buttonNames[mode].save}
          </Button>
        </div>
      </MultiStepModalFooter>
    </>
  );
};
