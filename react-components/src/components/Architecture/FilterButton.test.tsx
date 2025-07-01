import { beforeEach, describe, expect, test } from 'vitest';
import { FilterButton } from './FilterButton';
import { fireEvent, render, screen } from '@testing-library/react';
import { type PropsWithChildren, type ReactElement } from 'react';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { RevealRenderTarget } from '../../architecture';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { TestFilterCommand } from '#test-utils/architecture/commands/TestFilterCommand';
import { findIconByNameInContainer } from '#test-utils/cogs/findIconByNameInContainer';
import assert from 'assert';
import { expectAwaitToFail } from '#test-utils/expect/expectAwaitToThrow';
import { translate } from '../../architecture/base/utilities/translateUtils';

describe(FilterButton.name, () => {
  let renderTargetMock: RevealRenderTarget;
  let filterCommand: TestFilterCommand;
  let wrapper: (props: PropsWithChildren) => ReactElement;

  beforeEach(() => {
    renderTargetMock = new RevealRenderTarget(viewerMock, sdkMock);

    filterCommand = new TestFilterCommand();
    filterCommand.attach(renderTargetMock);

    wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ViewerContextProvider value={renderTargetMock}>{children}</ViewerContextProvider>
    );
  });

  test('should render with correct icon and no text by default', async () => {
    const { container } = render(<FilterButton inputCommand={filterCommand} placement="right" />, {
      wrapper
    });

    const icon = findIconByNameInContainer(filterCommand.icon, container);

    expect(icon).toBeDefined();

    await expectAwaitToFail(async () => await screen.findByText(translate(filterCommand.tooltip)));
  });

  test('should render button with icon and name from component when used in settings', async () => {
    const { container } = render(
      <FilterButton inputCommand={filterCommand} placement="right" usedInSettings={true} />,
      {
        wrapper
      }
    );

    const element = await screen.findByText(translate(filterCommand.tooltip));

    const icon = findIconByNameInContainer(filterCommand.icon, container);

    expect(icon).toBeDefined();
    expect(element).toBeDefined();
  });

  test('show render list items after click, hide on second click', async () => {
    const { container } = render(<FilterButton inputCommand={filterCommand} placement="right" />, {
      wrapper
    });

    const child = filterCommand.listChildren()[0];
    const childLabel = child.label;

    await expectAwaitToFail(async () => await screen.findByText(childLabel));

    const element = findIconByNameInContainer(filterCommand.icon, container);
    assert(element !== null);

    fireEvent.click(element);

    const childElement = await screen.findByText(childLabel);

    expect(childElement).toBeDefined();

    fireEvent.click(element);

    await expectAwaitToFail(async () => await screen.findByText(childLabel));
  });

  test('should only render list items after click, also in settings version', async () => {
    const element = (
      <FilterButton inputCommand={filterCommand} placement="right" usedInSettings={true} />
    );

    render(element, {
      wrapper
    });

    const child = filterCommand.listChildren()[1];
    const childLabel = child.label;

    await expectAwaitToFail(async () => await screen.findByText(childLabel));
  });
});
