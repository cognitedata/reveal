import { describe, expect, test, vi } from 'vitest';
import { PointsOfInterestSidePanel } from './PointsOfInterestSidePanel';
import { Mock } from 'moq.ts';
import { Changes, type CommandUpdateDelegate } from '../../../architecture';
import { PointsOfInterestTool } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultPointsOfInterestSidePanelDependencies,
  PointsOfInterestSidePanelContext
} from './PointsOfInterestSidePanel.context';

import { render } from '@testing-library/react';
import { type PropsWithChildren, type ReactElement, type FC } from 'react';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { createPointOfInterestMock } from '#test-utils/fixtures/pointsOfInterest/pointOfInterest';

describe(PointsOfInterestSidePanel.name, () => {
  const dependencies = getMocksByDefaultDependencies(defaultPointsOfInterestSidePanelDependencies);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <PointsOfInterestSidePanelContext.Provider value={dependencies}>
      {children}
    </PointsOfInterestSidePanelContext.Provider>
  );

  test('child component is rendered even if poi tool is not enabled', () => {
    const MockChildComponent = vi.fn<FC>();

    // Render with undefined PoI tool
    const { rerender } = render(
      <PointsOfInterestSidePanel>{<MockChildComponent />}</PointsOfInterestSidePanel>,
      { wrapper }
    );

    expect(MockChildComponent).toHaveBeenCalledTimes(1);

    dependencies.usePointsOfInterestTool.mockReturnValue(
      createMockPointsOfInterestTool({ enabled: false, checked: false })
    );

    rerender(<PointsOfInterestSidePanel>{<MockChildComponent />}</PointsOfInterestSidePanel>);

    expect(MockChildComponent).toHaveBeenCalledTimes(2);

    dependencies.usePointsOfInterestTool.mockReturnValue(
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

  const mockActivateEventListener = vi.fn<(listener: CommandUpdateDelegate) => void>();

  const poiToolMock = new Mock<PointsOfInterestTool<unknown>>()
    .setup((p) => p.isEnabled)
    .returns(enabled)
    .setup((p) => p.isChecked)
    .returns(checked)
    .setup((p) => p.addEventListener)
    .returns(mockActivateEventListener)
    .setup((p) => p.removeEventListener)
    .returns(() => {})
    .object();

  mockActivateEventListener.mockImplementation((listener) => {
    listener(poiToolMock, Changes.changedPart);
  });

  return poiToolMock;
}
