import isEditableElement from './isEditableElement';

const shouldFireToolKeyboardShortcut = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return false;
  }

  const target = event.target as HTMLElement;
  return !isEditableElement(target);
};

export default shouldFireToolKeyboardShortcut;
