export default () => {
  if (window.Intercom) {
    window.Intercom('shutdown');
  }
};
