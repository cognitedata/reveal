import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Paper } from '../Paper';

jest.mock('pages/authorized/menubar', () => {
  return {
    Topbar: () => {
      return <p>Mock Top Bar</p>;
    },
  };
});

const TEST_TEXT = 'test content';

const PageTestComponent = ({ ...rest }) => {
  return (
    <Paper {...rest}>
      <div>{TEST_TEXT}</div>
    </Paper>
  );
};

describe('Paper Tests', () => {
  const testInit = async (viewProps?: any) =>
    testRenderer(PageTestComponent, undefined, viewProps);
  it('should render component', async () => {
    await testInit();
    expect(screen.getByText(TEST_TEXT)).toBeInTheDocument();
  });
});
