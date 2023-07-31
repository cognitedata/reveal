import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Page, Props } from '../Page';

jest.mock('pages/authorized/menubar', () => {
  return {
    Topbar: () => {
      return <p>Mock Top Bar</p>;
    },
  };
});

const TEST_TEXT = 'test content';

const PageTestComponent = (props: Props) => {
  return (
    <Page {...props}>
      <div>{TEST_TEXT}</div>
    </Page>
  );
};

describe('Page Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRenderer(PageTestComponent, undefined, viewProps);
  it('should render header', async () => {
    await testInit({
      scrollPage: true,
      hideTopbar: true,
    });
    expect(screen.getByText(TEST_TEXT)).toBeInTheDocument();
  });
});
