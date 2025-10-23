import { CheckboxState } from '../../../src/architecture/base/utilities/types';

export function getButtonsInContainer(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button'));
}

export function getInputsInContainer(container: HTMLElement): HTMLInputElement[] {
  return Array.from(container.querySelectorAll('input'));
}

export function getIconsInContainer(container: HTMLElement): SVGSVGElement[] {
  return Array.from(container.querySelectorAll('svg'));
}

export function isEnabled(element: HTMLElement): boolean {
  return !isDisabled(element);
}

export function isDisabled(element: HTMLElement): boolean {
  return element.getAttribute('aria-disabled') === 'true';
}

export function isSelected(element: HTMLElement): boolean {
  return element.getAttribute('aria-selected') === 'true';
}

export function getType(element: HTMLElement): string | undefined {
  return element.getAttribute('type') ?? undefined;
}

export function hasStringInStyle(
  element: HTMLElement | SVGSVGElement,
  searchString: string
): boolean {
  const attribute = element.getAttribute('style');
  if (attribute === null) {
    return false;
  }
  return attribute.includes(searchString);
}

export function getLabel(element: HTMLElement): string {
  return element.getAttribute('aria-label') ?? '';
}

export function getIconName(element: SVGSVGElement): string {
  return element.getAttribute('aria-label') ?? '';
}

export function isToggled(element: HTMLButtonElement): boolean {
  return element.classList.contains('toggled');
}

export function getCheckboxState(element: HTMLInputElement): CheckboxState | undefined {
  const attribute = element.getAttribute('aria-checked');
  if (attribute === 'true') {
    return CheckboxState.All;
  } else if (attribute === 'false') {
    return CheckboxState.None;
  } else if (attribute === 'mixed') {
    return CheckboxState.Some;
  } else {
    return undefined;
  }
}
