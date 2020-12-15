import React, { FunctionComponent } from 'react';
import { Button } from '@cognite/cogs.js';
import { ContactBtnTestIds } from 'components/form/ContactsView';

interface OwnProps {
  index: number;
  isEdit: boolean;
  onRemoveClick: () => void;
  onEditClick: () => void;
}

type Props = OwnProps;

const RemoveEditBtns: FunctionComponent<Props> = ({
  index,
  isEdit,
  onEditClick,
  onRemoveClick,
}: OwnProps) => {
  return (
    <>
      <Button
        variant="outline"
        className="edit-form-btn"
        onClick={onRemoveClick}
        data-testid={`${ContactBtnTestIds.REMOVE_BTN}${index}`}
      >
        Remove
      </Button>
      <Button
        onClick={onEditClick}
        type="primary"
        className="edit-form-btn btn-margin-right"
        title="Toggle edit row"
        aria-label="Edit btn should have label"
        aria-expanded={isEdit}
        aria-controls="name email"
        data-testid={`${ContactBtnTestIds.EDIT_BTN}${index}`}
      >
        Edit
      </Button>
    </>
  );
};

export default RemoveEditBtns;
