import { beforeEach, describe, expect, test } from 'vitest';
import { type ButtonProp, RevealButtons } from './RevealButtons';
import { type PropsWithChildren, type ReactElement } from 'react';
import { sdkMock } from '../../../tests/tests-utilities/fixtures/sdk';
import { viewerMock } from '../../../tests/tests-utilities/fixtures/viewer';
import { RevealRenderTarget } from '../../architecture';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { render } from '@testing-library/react';
import { ComponentFactoryContextProvider } from '../RevealCanvas/ComponentFactoryContext';

describe(RevealButtons.name, () => {
  let wrapper: (props: PropsWithChildren) => ReactElement;

  beforeEach(() => {
    const renderTarget = new RevealRenderTarget(viewerMock, sdkMock);
    wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ComponentFactoryContextProvider>
        <ViewerContextProvider renderTarget={renderTarget}>{children}</ViewerContextProvider>
      </ComponentFactoryContextProvider>
    );
  });

  test('should create buttons', () => {
    const props: ButtonProp = { toolbarPlacement: 'left' };

    // Take those who are not dependent of any objects in the viewer
    renderMe(<RevealButtons.Clip {...props} />);
    renderMe(<RevealButtons.FitView {...props} />);
    renderMe(<RevealButtons.Help {...props} />);
    renderMe(<RevealButtons.KeyboardSpeed {...props} />);
    renderMe(<RevealButtons.Measurement {...props} />);
    renderMe(<RevealButtons.NavigationTool {...props} />);
    renderMe(<RevealButtons.SetAxisVisible {...props} />);
    renderMe(<RevealButtons.SetFirstPersonMode {...props} />);
    renderMe(<RevealButtons.SetOrbitMode {...props} />);
    renderMe(<RevealButtons.SetOrbitOrFirstPersonMode {...props} />);
    renderMe(<RevealButtons.Settings {...props} />);
    renderMe(<RevealButtons.Share {...props} />);
    renderMe(<RevealButtons.Undo {...props} />);
  });

  function renderMe(element: ReactElement): void {
    const { container } = render(element, { wrapper });
    expect(container).toBeDefined();
    expect(container.childElementCount).toBe(1);
  }
});
