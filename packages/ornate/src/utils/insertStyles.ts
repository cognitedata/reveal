// Copyright (c) Ben Drucker <bvdrucker@gmail.com> (bendrucker.me)

const cache: { [key: string]: HTMLStyleElement } = {};

function insertStyles(styles: string, options: { id: string }) {
  const id = (options && options.id) || styles;

  // eslint-disable-next-line no-multi-assign
  const element = (cache[id] = cache[id] || createStyle(id));

  if ('textContent' in element) {
    element.textContent = styles;
  } else {
    (element as any).styleSheet.cssText = styles;
  }
}

function createStyle(id: string) {
  let element = document.getElementById(id);

  if (element) return element;

  element = document.createElement('style');
  element.setAttribute('type', 'text/css');

  document.head.appendChild(element);

  return element;
}

export default insertStyles;
