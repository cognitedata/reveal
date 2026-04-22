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

  test('refAndUpdate adds overlay to container', () => {
    const wc = new WaitCursor(container);
    wc.refAndUpdate();
    expect(hasOverlay()).toBe(true);
  });

  test('derefAndUpdate after single refAndUpdate removes overlay', () => {
    const wc = new WaitCursor(container);
    wc.refAndUpdate();
    wc.derefAndUpdate();
    expect(hasOverlay()).toBe(false);
  });

  test('multiple refAndUpdate calls create only one overlay', () => {
    const wc = new WaitCursor(container);
    wc.refAndUpdate();
    wc.refAndUpdate();
    wc.refAndUpdate();
    expect(overlayCount()).toBe(1);
  });

  test('overlay persists until all refAndUpdate calls are matched by derefAndUpdate', () => {
    const wc = new WaitCursor(container);
    wc.refAndUpdate();
    wc.refAndUpdate();
    wc.derefAndUpdate();
    expect(hasOverlay()).toBe(true);
    wc.derefAndUpdate();
    expect(hasOverlay()).toBe(false);
  });

  test('extra derefAndUpdate calls below zero do not throw or leave inconsistent state', () => {
    const wc = new WaitCursor(container);
    wc.derefAndUpdate();
    wc.derefAndUpdate();
    expect(hasOverlay()).toBe(false);
    wc.refAndUpdate();
    expect(hasOverlay()).toBe(true);
    wc.derefAndUpdate();
    expect(hasOverlay()).toBe(false);
  });

  test('overlay has correct styles', () => {
    const wc = new WaitCursor(container);
    wc.refAndUpdate();
    const overlay = container.children[0] as HTMLElement;
    expect(overlay.style.position).toBe('absolute');
    expect(overlay.style.cursor).toBe('wait');
    expect(overlay.style.zIndex).toBe('99999');
  });

  test('dispose removes overlay and resets state', () => {
    const wc = new WaitCursor(container);
    wc.refAndUpdate();
    wc.refAndUpdate();
    wc.dispose();
    expect(hasOverlay()).toBe(false);
    wc.refAndUpdate();
    expect(hasOverlay()).toBe(true);
    wc.derefAndUpdate();
    expect(hasOverlay()).toBe(false);
  });

  test('dispose when no overlay is a no-op', () => {
    const wc = new WaitCursor(container);
    expect(() => wc.dispose()).not.toThrow();
    expect(hasOverlay()).toBe(false);
  });
});
