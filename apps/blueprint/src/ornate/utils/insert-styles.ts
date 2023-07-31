// Copyright (c) Ben Drucker <bvdrucker@gmail.com> (bendrucker.me)

const cache: { [key: string]: HTMLStyleElement } = {};

export const insertStyles = (styles: string, options: { id: string }) => {
  const id = (options && options.id) || styles;

  const element = cache[id] || createStyle(id);

  if ('textContent' in element) {
    element.textContent = styles;
  } else {
    (element as any).styleSheet.cssText = styles;
  }
};

export const createStyle = (id: string) => {
  let element = document.getElementById(id);

  if (element) return element;

  element = document.createElement('style');
  element.setAttribute('type', 'text/css');

  document.head.appendChild(element);

  return element;
};

export default insertStyles;
