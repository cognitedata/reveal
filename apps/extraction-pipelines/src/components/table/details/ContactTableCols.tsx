import { Cell, Column } from 'react-table';
import React from 'react';
import { Button, Detail } from '@cognite/cogs.js';
import EditableCell from 'components/inputs/EditableInput';
import { EditableHelpers } from './DetailsTable';
import { User } from '../../../model/User';
import { EditableHelpersContacts } from './ContactTable';
import {
  CancelSaveBtns,
  StyledButtonGroup,
} from '../../buttons/CancelSaveBtns';
import { DetailFieldNames } from '../../../utils/integrationUtils';

export const ContactBtnTestIds = {
  EDIT_BTN: 'edit-contact-btn-',
  REMOVE_BTN: 'remove-contact-btn-',
  CANCEL_BTN: 'cancel-contact-btn-',
  SAVE_BTN: 'save-contact-btn-',
};

const { EDIT_BTN, CANCEL_BTN, REMOVE_BTN, SAVE_BTN } = ContactBtnTestIds;
export type DetailsInputType = 'text' | 'textarea';
export type ContactAccessor = 'authors' | 'owner';
export interface ContactsTableCol {
  label: DetailFieldNames.CONTACT | DetailFieldNames.OWNER;
  accessor: ContactAccessor;
  name: User[keyof User];
  email: User[keyof User];
  indexInOriginal: number;
  original: User[];
  isEditable: boolean;
  isDeletable: boolean;
  isNewContact: boolean;
  inputType?: DetailsInputType;
}
export const contactTableCols: Column<ContactsTableCol>[] = [
  {
    id: 'label',
    accessor: 'label',
    Cell: ({ row }: Cell<ContactsTableCol>) => {
      return <Detail strong>{row.values.label}</Detail>;
    },
  },
  {
    id: 'name',
    accessor: 'name',
    Cell: (props: Cell<ContactsTableCol> & EditableHelpers) => {
      const { row, column, updateData } = props;
      return (
        <>
          {row.isExpanded ? (
            <>
              <EditableCell<ContactsTableCol>
                value={row.values.name}
                row={row}
                column={column}
                updateData={updateData}
                inputType={row.original.inputType}
                testId="name"
              />
            </>
          ) : (
            row.values.name
          )}
        </>
      );
    },
  },
  {
    id: 'email',
    accessor: 'email',
    Cell: (props: Cell<ContactsTableCol> & EditableHelpers) => {
      const { row, column, updateData } = props;
      return (
        <>
          {row.isExpanded ? (
            <>
              <EditableCell<ContactsTableCol>
                value={row.values.email}
                row={row}
                column={column}
                updateData={updateData}
                inputType={row.original.inputType}
                testId="email"
              />
            </>
          ) : (
            row.values.email
          )}
        </>
      );
    },
  },
  {
    id: 'edit',
    Cell: ({
      row,
      undoChange,
      saveChange,
      removeContact,
    }: Cell<ContactsTableCol> & EditableHelpersContacts) => {
      const onSave = () => {
        saveChange(row.index, row.original);
        row.toggleRowExpanded(false); // maybe wait with this until changes is api success
      };
      const onCancel = () => {
        undoChange(row.index);
        row.toggleRowExpanded(false);
      };

      const onClickRemove = () => {
        removeContact(row.index, row.original);
      };
      if (row.original.isEditable && !row.isExpanded) {
        // eslint-disable-next-line
        // todo alias expand?

        return (
          <StyledButtonGroup>
            {row.original.isDeletable && (
              <>
                <Button
                  type="secondary"
                  variant="outline"
                  onClick={onClickRemove}
                  data-testid={`${REMOVE_BTN}${row.index}`}
                >
                  Remove
                </Button>
              </>
            )}
            <Button
              type="primary"
              {...row.getToggleRowExpandedProps()}
              title="Toggle edit row"
              data-testid={`${EDIT_BTN}${row.index}`}
            >
              Edit
            </Button>
          </StyledButtonGroup>
        );
      }
      if (row.original.isEditable && row.isExpanded) {
        return (
          <CancelSaveBtns
            onCancel={onCancel}
            onSave={onSave}
            dateTestIdCancelBtn={`${CANCEL_BTN}${row.index}`}
            dateTestIdSaveBtn={`${SAVE_BTN}${row.index}`}
          />
        );
      }
      return null;
    },
  },
];
