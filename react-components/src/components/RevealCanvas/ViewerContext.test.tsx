/*!
 * Copyright 2025 Cognite AS
 */
import { describe, test, expect } from 'vitest';
import { useRenderTarget, useReveal, ViewerContextProvider } from './ViewerContext';
import { type Cognite3DViewer, type DataSourceType } from '@cognite/reveal';
import { cleanup, render } from '@testing-library/react';
import { createRenderTargetMock } from '../../../tests/tests-utilities/fixtures/renderTarget';
import { type RevealRenderTarget } from '../../architecture';
import { type ReactElement } from 'react';

describe(ViewerContextProvider.name, () => {
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
    render(
      <ViewerContextProvider value={renderTargetMock}>
        <></>
      </ViewerContextProvider>
    );

    expect((window as any).renderTarget).toBe(renderTargetMock);
    expect((window as any).viewer).toBe(renderTargetMock.viewer);

    cleanup();

    expect((window as any).renderTarget).toBeUndefined();
    expect((window as any).viewer).toBeUndefined();
  });
});
