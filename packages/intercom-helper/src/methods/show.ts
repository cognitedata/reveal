export default (show: boolean): void => {
  if (window.Intercom) {
    if (show) {
      window.Intercom('show');
    } else {
      window.Intercom('hide');
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn('Intercom not setup properly.');
  }
};
