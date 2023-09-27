const isEditableElement = (element: HTMLElement): boolean => {
  const target = element;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.contentEditable === 'true'
  );
};

export default isEditableElement;
