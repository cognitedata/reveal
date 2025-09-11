import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PointsOfInterestSidePanel } from './PointsOfInterestSidePanel';
import { Mock } from 'moq.ts';
import { PointsOfInterestDomainObject, type RevealRenderTarget } from '../../../architecture';
import { PointsOfInterestTool } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultPointsOfInterestSidePanelDependencies,
  PointsOfInteresSidePanelContext
} from './PointsOfInterestSidePanel.context';

import { render } from '@testing-library/react';
import { type PropsWithChildren, type ReactElement, type FC } from 'react';
import { PointsOfInterestProvider } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestProvider';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { PointsOfInterestStatus } from '../../../architecture/concrete/pointsOfInterest/types';
import { createPointOfInterestMock } from '#test-utils/fixtures/pointsOfInterest/pointOfInterest';

describe(PointsOfInterestSidePanel.name, () => {
  const dependencies = getMocksByDefaultDependencies(defaultPointsOfInterestSidePanelDependencies);

  const mockGetPointsOfInterestTool = vi.fn<() => PointsOfInterestTool<unknown> | undefined>(
    () => undefined
  );

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <PointsOfInteresSidePanelContext.Provider value={dependencies}>
      {children}
    </PointsOfInteresSidePanelContext.Provider>
  );

  test('child component is rendered even if poi tool is not enabled', () => {
    const MockChildComponent = vi.fn<FC>();

    // Render with undefined PoI tool
    const { rerender } = render(
      <PointsOfInterestSidePanel>{<MockChildComponent />}</PointsOfInterestSidePanel>,
      { wrapper }
    );

    expect(MockChildComponent).toHaveBeenCalledTimes(1);

    mockGetPointsOfInterestTool.mockReturnValue(
      createMockPointsOfInterestTool({ enabled: false, checked: false })
    );

    rerender(<PointsOfInterestSidePanel>{<MockChildComponent />}</PointsOfInterestSidePanel>);

    expect(MockChildComponent).toHaveBeenCalledTimes(2);

    mockGetPointsOfInterestTool.mockReturnValue(
      createMockPointsOfInterestTool({ enabled: true, checked: true })
    );

    rerender(<PointsOfInterestSidePanel>{<MockChildComponent />}</PointsOfInterestSidePanel>);

    expect(MockChildComponent).toHaveBeenCalledTimes(3);
  });

  test('panel is only open if tool is enabled and checked', () => {
    const combinations = [
      [false, false],
      [true, false],
      [false, true],
      [true, true]
    ];

    for (const [enabled, checked] of combinations) {
      dependencies.PoiList.mockClear();

      dependencies.usePointsOfInterestTool.mockReturnValue(
        createMockPointsOfInterestTool({ enabled, checked })
      );

      render(<PointsOfInterestSidePanel />, {
        wrapper
      });

      expect(dependencies.PoiList).toHaveBeenCalledTimes(enabled && checked ? 1 : 0);
    }
  });

  test('if a POI is not selected, the PoiList component should be displayed', () => {
    dependencies.usePointsOfInterestTool.mockReturnValue(
      createMockPointsOfInterestTool({ enabled: true, checked: true })
    );
    render(<PointsOfInterestSidePanel />, {
      wrapper
    });

    expect(dependencies.PoiList).toHaveBeenCalledWith({}, expect.anything());
  });

  test('if a POI is selected, the POIInfoPanelContent component should be displayed', () => {
    dependencies.usePointsOfInterestTool.mockReturnValue(
      createMockPointsOfInterestTool({ enabled: true, checked: true })
    );
    dependencies.useSelectedPoi.mockReturnValue(createPointOfInterestMock());

    render(<PointsOfInterestSidePanel />, {
      wrapper
    });

    expect(dependencies.PoiInfoPanelContent).toHaveBeenCalledWith({}, expect.anything());
  });
});

function createMockPointsOfInterestTool({
  enabled = false,
  checked = false
}: {
  enabled?: boolean;
  checked?: boolean;
}): PointsOfInterestTool<unknown> {
  const tool = new PointsOfInterestTool<unknown>();
  tool.attach(createRenderTargetMock());

  const poiToolMock = new Mock<PointsOfInterestTool<unknown>>()
    .setup((p) => p.isEnabled)
    .returns(enabled)
    .setup((p) => p.isChecked)
    .returns(checked)
    .setup((p) => p.addEventListener)
    .returns((f) => f())
    .setup((p) => p.removeEventListener)
    .returns(() => {})
    .object();

  return poiToolMock;
}
