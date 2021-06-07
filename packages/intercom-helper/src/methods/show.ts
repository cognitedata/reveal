export default (show: boolean): void => {
  if (window.Intercom) {
    if (show) {
      window.Intercom('show');
    } else {
      window.Intercom('hide');
    }
  }
};
