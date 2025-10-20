export function getButtonsInContainer(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button'));
}

export function isEnable(element: HTMLElement): boolean {
  return !isDisable(element);
}

export function isDisable(element: HTMLElement): boolean {
  return element.getAttribute('aria-disabled') === 'true';
}

export function isSelected(element: HTMLElement): boolean {
  return element.getAttribute('aria-selected') === 'true';
}

export function getType(element: HTMLElement): string {
  return element.getAttribute('type') ?? '';
}

export function getLabel(element: HTMLElement): string {
  return element.getAttribute('aria-label') ?? '';
}

export function isToggled(element: HTMLButtonElement): boolean {
  return element.classList.contains('toggled');
}
