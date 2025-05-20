import { beforeEach, describe, expect, test } from 'vitest';
import { BannerComponent } from './BannerComponent';
import { render, screen } from '@testing-library/react';
import { TestBannerCommand } from '#test-utils/architecture/commands/TestBannerCommand';
import { BannerStatus } from '../../architecture/base/commands/BaseBannerCommand';
import { RevealRenderTarget } from '../../architecture';
import { type PropsWithChildren, type ReactElement } from 'react';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { translate } from '../../architecture/base/utilities/translateUtils';

describe(BannerComponent.name, () => {
  let renderTargetMock: RevealRenderTarget;
  let wrapper: (props: PropsWithChildren) => ReactElement;

  beforeEach(() => {
    renderTargetMock = new RevealRenderTarget(viewerMock, sdkMock);

    wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ViewerContextProvider value={renderTargetMock}>{children}</ViewerContextProvider>
    );
  });

  test('should show the command text content', async () => {
    const textContent = 'some-test-string';

    const testCommand = new TestBannerCommand({ content: { untranslated: textContent } });
    render(<BannerComponent command={testCommand} t={translate} />, { wrapper });

    const element = await screen.findByText(textContent);

    expect(element).toBeDefined();
  });

  test('should have the right status', async () => {
    const status = BannerStatus.Critical;

    const testCommand = new TestBannerCommand({ status });
    render(<BannerComponent command={testCommand} t={translate} />, { wrapper });

    const bannerElement = await screen.findByRole('alert');
    expect([...bannerElement.classList]).toContain('cogs-lab-infobox-critical');
  });
});
