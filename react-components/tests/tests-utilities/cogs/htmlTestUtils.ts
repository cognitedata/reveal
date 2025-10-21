export function getButtonsInContainer(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button'));
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

export function getLabel(element: HTMLElement): string {
  return element.getAttribute('aria-label') ?? '';
}

export function isToggled(element: HTMLButtonElement): boolean {
  return element.classList.contains('toggled');
}
