import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { renderWithReactHookForm } from '../../../utils/test/render';
import { RegisterMetaData } from './RegisterMetaData';
import {
  ADD_ROW,
  METADATA_CONTENT_LABEL,
  METADATA_DESCRIPTION_LABEL,
  REMOVE_ROW,
} from '../../../utils/constants';

const { getByText } = screen;
describe('RegisterMetaData', () => {
  test('Add and remove rows', () => {
    renderWithReactHookForm(<RegisterMetaData />, { defaultValues: {} });
    const addRow = getByText(ADD_ROW);
    fireEvent.click(addRow);
    const content1 = screen.getByLabelText(`${METADATA_CONTENT_LABEL} 0`);
    const description1 = screen.getByLabelText(
      `${METADATA_DESCRIPTION_LABEL} 0`
    );
    expect(content1).toBeInTheDocument();
    expect(description1).toBeInTheDocument();
    fireEvent.click(addRow);
    expect(screen.getAllByRole('row').length).toEqual(3);
    fireEvent.click(screen.getByLabelText(`${REMOVE_ROW} 1`));
    expect(screen.getAllByRole('row').length).toEqual(2);
  });
});
