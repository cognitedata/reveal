/*!
 * Copyright 2026 Cognite AS
 */

import { WaitCursor } from './WaitCursor';

describe(WaitCursor.name, () => {
  let container: HTMLDivElement;

  const overlayCount = () => container.children.length;
  const hasOverlay = () => overlayCount() === 1;

  beforeEach(() => {
    container = document.createElement('div');
  });

  test('show adds overlay to container', () => {
    const wc = new WaitCursor(container);
    wc.show();
    expect(hasOverlay()).toBe(true);
  });

  test('hide after single show removes overlay', () => {
    const wc = new WaitCursor(container);
    wc.show();
    wc.hide();
    expect(hasOverlay()).toBe(false);
  });

  test('multiple show calls create only one overlay', () => {
    const wc = new WaitCursor(container);
    wc.show();
    wc.show();
    wc.show();
    expect(overlayCount()).toBe(1);
  });

  test('overlay persists until all show calls are matched by hide', () => {
    const wc = new WaitCursor(container);
    wc.show();
    wc.show();
    wc.hide();
    expect(hasOverlay()).toBe(true);
    wc.hide();
    expect(hasOverlay()).toBe(false);
  });

  test('extra hide calls below zero do not throw or leave inconsistent state', () => {
    const wc = new WaitCursor(container);
    wc.hide();
    wc.hide();
    expect(hasOverlay()).toBe(false);
    wc.show();
    expect(hasOverlay()).toBe(true);
    wc.hide();
    expect(hasOverlay()).toBe(false);
  });

  test('overlay has correct styles', () => {
    const wc = new WaitCursor(container);
    wc.show();
    const overlay = container.children[0] as HTMLElement;
    expect(overlay.style.position).toBe('absolute');
    expect(overlay.style.cursor).toBe('wait');
    expect(overlay.style.zIndex).toBe('99999');
  });

  test('dispose removes overlay and resets state', () => {
    const wc = new WaitCursor(container);
    wc.show();
    wc.show();
    wc.dispose();
    expect(hasOverlay()).toBe(false);
    wc.show();
    expect(hasOverlay()).toBe(true);
    wc.hide();
    expect(hasOverlay()).toBe(false);
  });

  test('dispose when no overlay is a no-op', () => {
    const wc = new WaitCursor(container);
    expect(() => wc.dispose()).not.toThrow();
    expect(hasOverlay()).toBe(false);
  });
});
