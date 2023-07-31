import { screen, fireEvent } from '@testing-library/react';
import { openInNewTab } from 'utils/openInNewTab';

import { Button } from '@cognite/cogs.js';

import { testRenderer } from '__test-utils/renderer';

const childTestString = 'Some child';

const ExternalLinkTestComponent = ({ links }: { links: string[] }) => {
  return (
    <Button onClick={(event) => openInNewTab(event, links)}>
      {childTestString}
    </Button>
  );
};

describe('ExternalLink', () => {
  const origConsole = global.console;

  beforeAll(() => {
    // @ts-expect-error - missing other keys
    global.console = { warn: jest.fn(), log: console.log };
  });

  afterAll(() => {
    global.console = origConsole;
  });

  const Page = (viewProps?: any) =>
    testRenderer(ExternalLinkTestComponent, undefined, viewProps);

  it("should display it's children", () => {
    Page({ links: ['https://test1.com'] });
    expect(screen.getByText(childTestString)).toBeInTheDocument();
  });

  it('should call window.open once', () => {
    Page({ links: ['https://test1.com'] });

    const linkButton = screen.getByText(childTestString);
    global.open = jest.fn();

    fireEvent.click(linkButton);

    expect(window.open).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledTimes(1);
  });

  it('should call window.open twice', () => {
    Page({
      links: ['https://test1.com', 'https://test2.com'],
    });

    const linkButton = screen.getByText(childTestString);
    global.open = jest.fn();

    fireEvent.click(linkButton);

    expect(window.open).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledTimes(2);
  });

  it('should not open a new page on "unsafe" url and send a warning in console', () => {
    const url = 'very-unsafe-url';
    Page({
      links: [url],
    });

    const linkButton = screen.getByText(childTestString);
    global.open = jest.fn();

    fireEvent.click(linkButton);

    expect(window.open).not.toHaveBeenCalled();
    expect(console.warn).toBeCalledWith(`Tried to open an unsafe url: ${url}`);
  });

  it('should not call window.open when links is empty', () => {
    Page({
      links: [],
    });

    const linkButton = screen.getByText(childTestString);
    global.open = jest.fn();

    fireEvent.click(linkButton);

    expect(window.open).not.toHaveBeenCalled();
  });
});
