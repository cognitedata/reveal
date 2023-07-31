import * as React from 'react';

/** When the page is not scrolled, just loaded or chilling at the top, the
 *  position of the topbar is Static, so that it scrolls away with the page
 *  without grabbing any attention.
 *
 *  When the user surpasses the scrollThreshold it will switch to sticky mode,
 *  meaning that when you scroll up it will show and hide the topBar. You have
 *  to scroll the amount of pixels in scrollThreshold up or down to trigger
 *  this change.
 */

// The amount of pixels that needs to be scrolled before the change triggers
const scrollThreshold = 150;

// Some variables to keep track the user's scrolling behavior
let oldScrollPosition = 0;
let directionSwitchPosition = 0;
let oldScrollDirection = 'down';
let isTriggered = false;
let surpassedThresholdTriggered = false;

const scrollHandler = (
  event: React.UIEvent<HTMLElement>,
  setExpanded: (newValue: boolean) => void,
  setStaticPos: (newValue: boolean) => void
) => {
  const { scrollTop } = event.currentTarget;
  const scrollDirection = oldScrollPosition - scrollTop > 0 ? 'up' : 'down';
  const scrolledDistance = Math.abs(directionSwitchPosition - scrollTop);

  // If we're scrolling to the top of the page
  if (scrollTop <= 0 && scrollDirection === 'up') {
    // Expand the header at all times
    setExpanded(true);
    setStaticPos(true);
    return;
  }

  // If we're scrolling away from the top of the page
  if (
    !surpassedThresholdTriggered &&
    scrollTop > scrollThreshold &&
    scrollDirection === 'down'
  ) {
    // Expand the header at all times
    setExpanded(false);
    setStaticPos(true);

    // Make sure we only do this once when passing the threshold
    surpassedThresholdTriggered = true;
    return;
  }

  // Reset surpassedThresholdTriggered when we reach the top
  // section of the page again
  if (scrollTop < scrollThreshold) {
    surpassedThresholdTriggered = false;
  }

  // If the user changed the direction in which they're scrolling
  if (scrollDirection !== oldScrollDirection) {
    // Set a new threshold, change the direction and reset the isTriggered
    oldScrollDirection = scrollDirection;
    directionSwitchPosition = scrollTop;
    isTriggered = false;
    return;
  }

  // If the user is still scrolling in the same direction
  oldScrollPosition = scrollTop;

  // Trigger the change if we surpassed the threshold
  if (isTriggered === false && scrolledDistance > scrollThreshold) {
    setExpanded(scrollDirection === 'up');
    setStaticPos(false);
    isTriggered = true;
  }
};

export default scrollHandler;
