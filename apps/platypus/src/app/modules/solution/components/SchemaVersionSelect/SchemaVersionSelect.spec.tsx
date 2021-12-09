import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { BasicSchemaVersionSelect } from './SchemaVersionSelect.stories';

describe('SchemaVersionSelect', () => {
  it('Should render schema version select component', async () => {
    render(<BasicSchemaVersionSelect />);
    expect(screen.getByText('V. 3.2')).toBeInTheDocument();
  });

  it('Should click on the schema version select component and get a list of options', async () => {
    render(<BasicSchemaVersionSelect />);
    userEvent.click(screen.getByText('V. 3.2'));
    const optionsLabels = [
      'V. 3.2',
      'V. 3.1',
      'V. 3.0',
      'V. 2.1',
      'V. 2.0',
      'V. 1.2',
      'V. 1.1',
      'V. 1.0',
    ];
    optionsLabels.forEach((label, index) => {
      const items = screen.getAllByText(label);
      // The first element is located in the selector and dropdown menu
      if (index === 0) {
        expect(items.length).toBe(2);
      } else {
        expect(items.length).toBe(1);
      }
    });
  });
});
