import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import DepthColumn, { Props } from '../EventsV2/DepthColumn';

const casingViewProps = {
  scaleBlocks: [0, 100, 200, 300],
  unit: 'm',
};

describe('Depth Column', () => {
  const page = (viewProps?: Props) =>
    testRenderer(DepthColumn, undefined, viewProps);

  const defaultTestInit = async () => {
    return {
      ...page(casingViewProps as Props),
    };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should display unit`, async () => {
    await defaultTestInit();
    expect(await screen.findByText(casingViewProps.unit)).toBeInTheDocument();
  });

  it(`should display depth values`, async () => {
    await defaultTestInit();
    expect(
      await screen.findByText(`${casingViewProps.scaleBlocks[0]}`)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(`${casingViewProps.scaleBlocks[1]}.00`)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(`${casingViewProps.scaleBlocks[2]}.00`)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(`${casingViewProps.scaleBlocks[3]}.00`)
    ).toBeInTheDocument();
  });
});
