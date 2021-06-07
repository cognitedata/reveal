export default (): void => {
  if (window.Intercom) {
    window.Intercom('shutdown');
  }
};
