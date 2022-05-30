const eventName = 'beforeunload';

const listener = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  // eslint-disable-next-line no-return-assign, no-param-reassign
  return (event.returnValue =
    'You have unsaved changes, are you sure you want to exit?');
};

export const enableExitWarning = () => {
  window.addEventListener(eventName, listener, { capture: true });
};

export const disableExitWarning = () => {
  window.removeEventListener(eventName, listener, { capture: true });
};
