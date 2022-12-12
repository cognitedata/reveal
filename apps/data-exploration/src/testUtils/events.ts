import { fireEvent } from '@testing-library/react';

type FireKeyDownEventOptions = {
  el: HTMLElement;
  key: string;
  code: number;
  ctrlKey?: boolean;
};

const fireKeyDownEvent = ({
  el,
  key,
  code,
  ctrlKey = false,
}: FireKeyDownEventOptions) => {
  return fireEvent.keyDown(el, {
    key,
    code,
    keyCode: code,
    charCode: code,
    which: code,
    ctrlKey,
  });
};

export function pressEnter<T extends HTMLElement>(el: T) {
  return fireKeyDownEvent({ el, key: 'Enter', code: 13 });
}

export function pressEscape<T extends HTMLElement>(el: T) {
  return fireKeyDownEvent({ el, key: 'Escape', code: 27 });
}

export function pressCtrlF<T extends HTMLElement>(el: T) {
  return fireKeyDownEvent({ el, key: 'F', code: 70, ctrlKey: true });
}

export function pressTab<T extends HTMLElement>(el: T = document.body as T) {
  return fireKeyDownEvent({ el, code: 9, key: 'Tab' });
}

export function typeText<T extends HTMLElement>(el: T, value: string) {
  return fireEvent.change(el, { target: { value } });
}

export const clickElement = (el: HTMLElement) => {
  fireEvent.click(el);
  fireEvent.focus(el);
  el.focus();
};

export const hoverElement = (el: HTMLElement) => {
  return fireEvent.mouseOver(el);
};

export const dragEnter = (el: HTMLElement, data = {}) => {
  const event = new Event('dragenter', { bubbles: true });
  Object.assign(event, data);
  return fireEvent(el, event);
};

export const drop = (el: HTMLElement, data = {}) => {
  const event = new Event('drop', { bubbles: true });
  Object.assign(event, data);
  return fireEvent(el, event);
};
