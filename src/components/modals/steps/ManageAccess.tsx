import React from 'react';
import { Button } from '@cognite/cogs.js';
import { ManageAccessModalFooter } from 'components/modals/elements';

interface Props {
  handleSubmit: () => void;
  handleStepBack: () => void;
}

export const ManageAccess: React.FC<Props> = ({
  handleStepBack,
  handleSubmit,
}: Props) => {
  return (
    <>
      <div>Content</div>
      <ManageAccessModalFooter>
        <Button variant="ghost" onClick={handleStepBack}>
          Back
        </Button>
        <Button type="primary" onClick={handleSubmit}>
          Create
        </Button>
      </ManageAccessModalFooter>
    </>
  );
};
