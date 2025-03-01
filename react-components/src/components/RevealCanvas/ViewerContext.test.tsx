/*!
 * Copyright 2025 Cognite AS
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { useRenderTarget, useReveal, ViewerContextProvider } from './ViewerContext';
import { type Cognite3DViewer, type DataSourceType } from '@cognite/reveal';
import { cleanup, render } from '@testing-library/react';
import { createRenderTargetMock } from '../../../tests/tests-utilities/fixtures/renderTarget';
import { type RevealRenderTarget } from '../../architecture';
import { type ReactElement } from 'react';

describe(ViewerContextProvider.name, () => {
  beforeEach(() => {
    window.renderTarget = undefined;
    window.viewer = undefined;
    window.renderTargets = undefined;
  });

  test('renders children', async () => {
    const TestComponent = (): ReactElement => {
      return <h1>Child component</h1>;
    };

    const result = render(
      <ViewerContextProvider value={null}>
        <TestComponent />
      </ViewerContextProvider>
    );

    const child = await result.findByText('Child component');
    expect(child).toBeDefined();
  });

  test('exposes the provided viewer and renderTarget', () => {
    const renderTargetMock = createRenderTargetMock();

    let viewerAssignedInComponent: Cognite3DViewer<DataSourceType> | undefined;
    let renderTargetAssignedInComponent: RevealRenderTarget | undefined;
    const TestComponent = (): ReactElement => {
      renderTargetAssignedInComponent = useRenderTarget();
      viewerAssignedInComponent = useReveal();
      return <></>;
    };

    render(
      <ViewerContextProvider value={renderTargetMock}>
        <TestComponent />
      </ViewerContextProvider>
    );

    expect(renderTargetAssignedInComponent).toBe(renderTargetMock);
    expect(viewerAssignedInComponent).toBe(renderTargetMock.viewer);
  });

  test('throws error if useRenderTarget is used outside provider', () => {
    const TestComponent = (): ReactElement => {
      useRenderTarget();
      return <></>;
    };

    expect(() => render(<TestComponent />)).toThrow();
  });

  test('mounts and unmounts renderTarget and viewer to/from window', () => {
    const renderTargetMock = createRenderTargetMock();

    expect(window.renderTarget).toBe(undefined);

    render(
      <ViewerContextProvider value={renderTargetMock}>
        <></>
      </ViewerContextProvider>
    );

    expect(window.renderTarget).toBe(renderTargetMock);
    expect(window.viewer).toBe(renderTargetMock.viewer);

    cleanup();

    expect(window.renderTarget).toBeUndefined();
    expect(window.viewer).toBeUndefined();
  });

  test('mounting second renderTarget still leaves earlier render target on window', () => {
    const renderTargetMock0 = createRenderTargetMock();
    const renderTargetMock1 = createRenderTargetMock();
    render(
      <ViewerContextProvider value={renderTargetMock0}>
        <></>
      </ViewerContextProvider>
    );
    render(
      <ViewerContextProvider value={renderTargetMock1}>
        <></>
      </ViewerContextProvider>
    );

    expect(window.renderTarget).toBe(renderTargetMock0);
  });

  test('mounting `null` renderTarget does not occupy viewer slot on window', () => {
    const renderTargetMock = createRenderTargetMock();
    render(
      <ViewerContextProvider value={null}>
        <></>
      </ViewerContextProvider>
    );
    expect(window.renderTarget).toBe(undefined);

    render(
      <ViewerContextProvider value={renderTargetMock}>
        <></>
      </ViewerContextProvider>
    );
    expect(window.renderTarget).toBe(renderTargetMock);
  });

  test('rerendering provider with new render target mounts new one to window', () => {
    const renderTargetMock0 = createRenderTargetMock();
    const renderTargetMock1 = createRenderTargetMock();

    const { rerender } = render(
      <ViewerContextProvider value={null}>
        <></>
      </ViewerContextProvider>
    );

    expect(window.renderTarget).toBe(undefined);
    expect(window.viewer).toBe(undefined);

    rerender(
      <ViewerContextProvider value={renderTargetMock0}>
        <></>
      </ViewerContextProvider>
    );

    expect(window.renderTarget).toBe(renderTargetMock0);
    expect(window.viewer).toBe(renderTargetMock0.viewer);

    rerender(
      <ViewerContextProvider value={renderTargetMock1}>
        <></>
      </ViewerContextProvider>
    );

    expect(window.renderTarget).toBe(renderTargetMock1);
    expect(window.viewer).toBe(renderTargetMock1.viewer);
  });

  test('creates and maintains list of active render targets on window', () => {
    const renderTargetMock0 = createRenderTargetMock();
    const renderTargetMock1 = createRenderTargetMock();

    expect(window.renderTargets).toBeUndefined();

    const { unmount: unmount0 } = render(
      <ViewerContextProvider value={renderTargetMock0}>
        <></>
      </ViewerContextProvider>
    );

    expect(window.renderTargets).toHaveLength(1);
    expect(window.renderTargets).toContain(renderTargetMock0);

    const { unmount: unmount1 } = render(
      <ViewerContextProvider value={renderTargetMock1}>
        <></>
      </ViewerContextProvider>
    );

    expect(window.renderTargets).toHaveLength(2);
    expect(window.renderTargets?.[0]).toBe(renderTargetMock0);
    expect(window.renderTargets?.[1]).toBe(renderTargetMock1);

    unmount0();

    expect(window.renderTargets).toHaveLength(1);
    expect(window.renderTargets?.[0]).toBe(renderTargetMock1);

    unmount1();

    expect(window.renderTargets).toEqual([]);
  });
});
