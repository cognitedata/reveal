import noop from 'lodash/noop';

import scrollHandler from '../scrollHandler';

const onSetExpanded = jest.fn();
const onSetStatic = jest.fn();

// Returns (part of) a scroll event
const getScrollEvent = (scrollPos: number) =>
  ({
    currentTarget: {
      scrollTop: scrollPos,
    },
  } as React.UIEvent<HTMLElement>);

// Mock a user scrolling to a certain position
const mockScrollToPosition = (scrollPos: number) =>
  scrollHandler(getScrollEvent(scrollPos), onSetExpanded, onSetStatic);

// Mock scrolling without triggering jest functions
const mockScrollToPositionWithoutJestFn = (scrollPos: number) =>
  scrollHandler(getScrollEvent(scrollPos), noop, noop);

// Needed because the scrollHandler needs 3 triggers to recognize
// scroll direction and positions
const scrollFromTo = (from: number, to: number) => {
  mockScrollToPositionWithoutJestFn(from);
  mockScrollToPositionWithoutJestFn((from + to) / 2);
  mockScrollToPosition(to);
};

describe('scrollHandler', () => {
  it('collapses when scrolling down', async () => {
    // Scroll from the top down
    scrollFromTo(0, 400);

    // The topbar should be collapsed and not static
    expect(onSetExpanded).toHaveBeenCalledWith(false);
    expect(onSetStatic).toHaveBeenCalledWith(false);
  });

  it('expands when scrolling up', async () => {
    // Scroll a bit up
    scrollFromTo(800, 400);

    // The topbar should be expanded and not static
    expect(onSetExpanded).toHaveBeenCalledWith(true);
    expect(onSetStatic).toHaveBeenCalledWith(false);
  });

  it('static when reaching the top', async () => {
    // Scroll all the way to the top
    scrollFromTo(400, 0);

    // The topBar should be expanded and static
    expect(onSetExpanded).toHaveBeenCalledWith(true);
    expect(onSetStatic).toHaveBeenCalledWith(true);
  });
});
