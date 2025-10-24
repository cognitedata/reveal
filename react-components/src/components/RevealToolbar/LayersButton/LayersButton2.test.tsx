import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { PropsWithChildren, ReactElement } from 'react';
import { LayersButton } from './LayersButton2';
import type { LayersButtonProps } from './LayersButton2';
import { defaultLayersButtonDependencies, LayersButtonContext } from './LayersButton2.context';
import userEvent from '@testing-library/user-event';

import { createCadMock } from '#test-utils/fixtures/cadModel';

import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject
} from '../../../architecture';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';

describe(LayersButton.name, () => {
  const defaultProps = {
    layersState: {
      cadLayers: [{ revisionId: 456, applied: true, index: 0 }],
      pointCloudLayers: [{ revisionId: 123, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'site-id', applied: true }]
    },
    setLayersState: vi.fn()
  } as const satisfies LayersButtonProps;

  const defaultDependencies = getMocksByDefaultDependencies(defaultLayersButtonDependencies);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => {
    return (
      <LayersButtonContext.Provider value={defaultDependencies}>
        {children}
      </LayersButtonContext.Provider>
    );
  };

  beforeEach(() => {
    defaultDependencies.useModelsVisibilityState.mockReturnValue({
      cadModels: [new CadDomainObject(createCadMock())],
      pointClouds: [new PointCloudDomainObject(createPointCloudMock())],
      image360Collections: [new Image360CollectionDomainObject(createImage360ClassicMock())]
    });
    defaultDependencies.ModelLayerSelection.mockImplementation(({ label }) => <div>{label}</div>);
  });

  test('renders without crashing', () => {
    const { getByRole } = render(<LayersButton {...defaultProps} />, {
      wrapper
    });

    expect(
      getByRole('button', { name: 'Filter 3D resource layers' }).className.includes('cogs-button')
    ).toBe(true);
  });

  test('toggles LayersButton on click and off on second click', async () => {
    render(<LayersButton {...defaultProps} />, { wrapper });

    const button = screen.getByRole('button', { name: 'Filter 3D resource layers' });

    expect(button).not.toHaveClass('cogs-button--toggled');

    await userEvent.click(button);
    expect(button).toHaveClass('cogs-button--toggled');

    await userEvent.click(button);
    expect(button).not.toHaveClass('cogs-button--toggled');
  });

  test('Layers drop down should mount under the same parent as button', async () => {
    render(
      <div data-test-id="layers-button">
        <LayersButton {...defaultProps} />
      </div>,
      {
        wrapper
      }
    );

    await userEvent.click(screen.getByRole('button', { name: 'Filter 3D resource layers' }));

    expect(screen.getByText('CAD models').closest('[data-test-id="layers-button"]')).not.toBeNull();
  });
});
