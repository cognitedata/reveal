export function isMacOs(): boolean {
  return window.navigator.platform.toLowerCase().startsWith('mac');
}
