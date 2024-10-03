/*!
 * Copyright 2024 Cognite AS
 */

export function isMacOs(): boolean {
  return window.navigator.platform.toLowerCase().startsWith('mac');
}
