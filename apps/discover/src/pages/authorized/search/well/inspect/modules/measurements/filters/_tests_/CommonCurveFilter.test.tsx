import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { OptionType } from '@cognite/cogs.js';
import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { getMockPpfgsColumns } from '__test-utils/fixtures/measurements';
import { testRenderer } from '__test-utils/renderer';

import { CommonCurveFilter, Props } from '../CommonCurveFilter';
import { mapCurvesToOptions } from '../utils';

const TITLE = 'Test title';

describe('CommonCurveFilter tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRenderer(CommonCurveFilter, undefined, viewProps);

  it('Should display title and selected number of curves', async () => {
    const groupOptions: OptionType<DepthMeasurementColumn>[] = [
      {
        label: 'Curves',
        options: mapCurvesToOptions(getMockPpfgsColumns()),
      },
    ];
    const selectedNoOfCurves = [getMockPpfgsColumns()[0]].length;
    const totalCurves = getMockPpfgsColumns().length;
    const expectedSelectedText = `${selectedNoOfCurves} / ${totalCurves}`;
    await testInit({
      title: TITLE,
      selected: [getMockPpfgsColumns()[0]],
      options: groupOptions,
      onChange: jest.fn(),
      grouped: true,
    });
    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(screen.getByText(expectedSelectedText)).toBeInTheDocument();
  });

  it('Should call the callback with selected curves', async () => {
    const groupOptions: OptionType<DepthMeasurementColumn>[] = [
      {
        label: 'Curves',
        options: mapCurvesToOptions(getMockPpfgsColumns()),
      },
    ];
    const onChange = jest.fn();
    await testInit({
      title: TITLE,
      selected: [getMockPpfgsColumns()[0]],
      options: groupOptions,
      onChange,
      grouped: true,
    });

    await userEvent.click(screen.getByText(TITLE));
    await userEvent.click(
      screen.getByText(getMockPpfgsColumns()[1].columnExternalId)
    );
    expect(onChange).toBeCalledWith([
      getMockPpfgsColumns()[0],
      getMockPpfgsColumns()[1],
    ]);
  });
});
