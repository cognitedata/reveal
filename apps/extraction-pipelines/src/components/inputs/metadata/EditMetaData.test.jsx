import render from 'utils/test/render';
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { EditMetaDataView } from 'components/inputs/metadata/EditMetaData';

function fillKeyValue(key, value) {
  fireEvent.change(screen.getAllByDisplayValue('')[0], {
    target: { value: key },
  });
  fireEvent.change(screen.getByDisplayValue(''), {
    target: { value },
  });
}

describe('Edit metadata tests', () => {
  const clickAddFields = () => {
    screen.getByTestId('add-fields-btn').click();
  };

  test('Component testing', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const initialMetadata = { weather: 'Sunny' };
    render(
      <EditMetaDataView
        initialMetadata={initialMetadata}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );
    fireEvent.change(screen.getByDisplayValue('Sunny'), {
      target: { value: 'Very rainy' },
    });
    clickAddFields();
    fillKeyValue('Wind speed', '14 m/s');
    clickAddFields();
    screen.getByTestId('confirm-btn').click();
    expect(onConfirm).toHaveBeenCalledWith({
      weather: 'Very rainy',
      windSpeed: '14 m/s',
    });
  });

  test.todo('Should handle user writing same metadata field name twice');

  test('Handle deleting row, and saving with no metadata-fields set', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <EditMetaDataView
        initialMetadata={{ weather: 'Sunny' }}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );
    screen.getByLabelText('Remove metadata row').click();
    screen.getByTestId('confirm-btn').click();
    expect(onConfirm).toHaveBeenCalledWith({});
  });

  test('Handle whitespaces in value & key gracefully', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <EditMetaDataView
        initialMetadata={{}}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );
    fillKeyValue(' temperature ', ' low ');
    screen.getByTestId('confirm-btn').click();
    expect(onConfirm).toHaveBeenCalledWith({ temperature: 'low' });
  });
});
