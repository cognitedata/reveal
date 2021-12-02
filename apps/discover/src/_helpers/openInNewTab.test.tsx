import { screen, fireEvent } from '@testing-library/react';

import { Button } from '@cognite/cogs.js';

import { testRenderer } from '__test-utils/renderer';
import { openInNewTab } from '_helpers/openInNewTab';

const childTestString = 'Some child';

const ExternalLinkTestComponent = ({ links }: { links: string[] }) => {
  return (
    <Button onClick={(event) => openInNewTab(event, links)}>
      {childTestString}
    </Button>
  );
};

describe('ExternalLink', () => {
  const Page = (viewProps?: any) =>
    testRenderer(ExternalLinkTestComponent, undefined, viewProps);

  it("should display it's children", () => {
    Page({ links: ['test1'] });
    expect(screen.getByText(childTestString)).toBeInTheDocument();
  });

  it('should call window.open once', () => {
    Page({ links: ['test1'] });

    const linkButton = screen.getByText(childTestString);
    global.open = jest.fn();

    fireEvent.click(linkButton);

    expect(window.open).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledTimes(1);
  });

  it('should call window.open twice', () => {
    Page({
      links: ['test1', 'test2'],
    });

    const linkButton = screen.getByText(childTestString);
    global.open = jest.fn();

    fireEvent.click(linkButton);

    expect(window.open).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledTimes(2);
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
