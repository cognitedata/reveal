export default (show: boolean) => {
  if (window.Intercom) {
    if (show) {
      window.Intercom('show');
    } else {
      window.Intercom('hide');
    }
  }
};
