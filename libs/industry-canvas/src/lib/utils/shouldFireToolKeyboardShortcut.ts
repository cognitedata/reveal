const shouldFireToolKeyboardShortcut = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return false;
  }

  const target = event.target as HTMLElement;
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.contentEditable === 'true'
  ) {
    return false;
  }

  return true;
};

export default shouldFireToolKeyboardShortcut;
