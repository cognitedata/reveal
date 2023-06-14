import { ScheduleSelector } from 'components/inputs/ScheduleSelector';
import { SupportedScheduleStrings } from 'components/extpipes/cols/Schedule';
import React from 'react';
import { render } from 'utils/test';
import { fireEvent, screen } from '@testing-library/react';

describe('ScheduleSelector', () => {
  test.skip('Interact with component', async () => {
    const onChange = jest.fn();
    const handleBlur = jest.fn();
    const schedule = SupportedScheduleStrings.CONTINUOUS;
    render(
      <ScheduleSelector
        handleOnBlur={handleBlur}
        schedule={schedule}
        onSelectChange={onChange}
      />
    );
    const scheduleSelect = screen.getByText(schedule);
    expect(scheduleSelect).toBeInTheDocument();
    fireEvent.click(scheduleSelect);
    fireEvent.keyDown(scheduleSelect, { key: 'Down', code: 'ArrowDown' });
    fireEvent.keyDown(scheduleSelect, { key: 'Down', code: 'ArrowDown' });
    fireEvent.keyDown(scheduleSelect, { key: 'Down', code: 'ArrowDown' });
    fireEvent.keyDown(scheduleSelect, { key: 'Enter', code: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(SupportedScheduleStrings.ON_TRIGGER)
    ).toBeInTheDocument();
  });
});
