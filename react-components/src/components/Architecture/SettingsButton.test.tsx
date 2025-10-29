import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SettingsButton } from './SettingsButton';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestSettingsCommand } from '#test-utils/architecture/commands/TestSettingsCommand';
import { TestButtonCommand } from '#test-utils/architecture/commands/TestButtonCommand';
import { findIconByNameInContainer } from '#test-utils/cogs/findIconByNameInContainer';
import assert from 'assert';
import { type PropsWithChildren, type ReactElement } from 'react';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { type BaseSettingsCommand, RevealRenderTarget } from '../../architecture';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { TestSectionCommand } from '#test-utils/architecture/commands/TestSectionCommand';
import { TestSliderCommand } from '#test-utils/architecture/commands/TestSliderCommand';
import { TestFilterCommand } from '#test-utils/architecture/commands/TestFilterCommand';
import { TestOptionsCommand } from '#test-utils/architecture/commands/TestOptionsCommand';
import { TestGroupCommand } from '#test-utils/architecture/commands/TestGroupCommand';
import { getButtonsInContainer } from '#test-utils/cogs/htmlTestUtils';

let wrapper: (props: PropsWithChildren) => ReactElement;

describe(SettingsButton.name, () => {
  let renderTargetMock: RevealRenderTarget;
  let settingsCommand: TestSettingsCommand;

  beforeEach(() => {
    renderTargetMock = new RevealRenderTarget(viewerMock, sdkMock);
    wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <ViewerContextProvider renderTarget={renderTargetMock}>{children}</ViewerContextProvider>
    );

    settingsCommand = new TestSettingsCommand();
  });

  test('opens settings on click in panel', async () => {
    const buttonCommand = new TestButtonCommand();
    settingsCommand.add(buttonCommand);

    const { container } = renderAndOpenSettingsPanel(settingsCommand);

    expect(findIconByNameInContainer(buttonCommand.icon, container)).not.toBeNull();
  });

  test('renders button child element that reacts on click', async () => {
    const onClick = vi.fn();

    const buttonCommand = new TestButtonCommand({ onClick });
    settingsCommand.add(buttonCommand);

    const { container } = renderAndOpenSettingsPanel(settingsCommand);

    const childButton = findIconByNameInContainer(buttonCommand.icon, container);
    assert(childButton !== null);

    fireEvent.click(childButton);

    expect(onClick).toBeCalled();
  });

  test('renders section header in panel', async () => {
    const sectionHeaderContent = 'section command header test';
    const sectionCommand = new TestSectionCommand(sectionHeaderContent);
    settingsCommand.add(sectionCommand);

    renderAndOpenSettingsPanel(settingsCommand);

    const element = await screen.findByText(sectionHeaderContent);

    expect(element).toBeDefined();
  });

  test('renders component with "isToggle" as toggle in panel', async () => {
    const toggleCommand = new TestButtonCommand({ isToggle: true });
    settingsCommand.add(toggleCommand);

    renderAndOpenSettingsPanel(settingsCommand);

    const element = await screen.findByRole('switch');

    expect(element).toBeDefined();
  });

  test('renders slider in panel', async () => {
    const sliderCommand = new TestSliderCommand();
    settingsCommand.add(sliderCommand);

    renderAndOpenSettingsPanel(settingsCommand);

    const sliderComponent = screen.getByRole('slider');

    expect(sliderComponent).toBeDefined();
  });

  test('renders filter button with label in panel', async () => {
    const filterCommand = new TestFilterCommand();
    const label = filterCommand.label;

    settingsCommand.add(filterCommand);

    const { container } = renderAndOpenSettingsPanel(settingsCommand);

    const divElements = container.querySelectorAll('div');
    const selectPanelElement = [...divElements].find((element) =>
      element.classList.contains('cogs-lab-select-panel')
    );

    const labelComponent = await screen.findByText(label);

    expect(selectPanelElement).toBeDefined();
    expect(labelComponent).toBeDefined();
  });

  test('renders options button with label in panel', async () => {
    const optionsCommand = new TestOptionsCommand();
    const label = optionsCommand.label;

    settingsCommand.add(optionsCommand);

    const { container } = renderAndOpenSettingsPanel(settingsCommand);

    const labelComponent = await screen.findByText(label);

    const buttonElements = getButtonsInContainer(container);
    const selectButtonElement = [...buttonElements].find((element) =>
      element.classList.contains('cogs-lab-select-toggle')
    );

    expect(selectButtonElement).toBeDefined();
    expect(labelComponent).toBeDefined();
  });

  test('renders group command as accordion in panel', async () => {
    const groupTitle = 'Test Group';
    const groupCommand = new TestGroupCommand({ untranslated: groupTitle });
    settingsCommand.add(groupCommand);

    renderAndOpenSettingsPanel(settingsCommand);

    const accordionElement = await screen.findByText(groupTitle);
    expect(accordionElement).toBeDefined();
  });

  test('renders multiple group commands as accordions in panel', async () => {
    const firstGroupTitle = 'First Group';
    const secondGroupTitle = 'Second Group';
    const thirdGroupTitle = 'Third Group';

    const firstGroupCommand = new TestGroupCommand({ untranslated: firstGroupTitle });
    const secondGroupCommand = new TestGroupCommand({ untranslated: secondGroupTitle });
    const thirdGroupCommand = new TestGroupCommand({ untranslated: thirdGroupTitle });

    settingsCommand.add(firstGroupCommand);
    settingsCommand.add(secondGroupCommand);
    settingsCommand.add(thirdGroupCommand);

    renderAndOpenSettingsPanel(settingsCommand);

    const firstGroupElement = await screen.findByText(firstGroupTitle);
    const secondGroupElement = await screen.findByText(secondGroupTitle);
    const thirdGroupElement = await screen.findByText(thirdGroupTitle);

    expect(firstGroupElement).toBeDefined();
    expect(secondGroupElement).toBeDefined();
    expect(thirdGroupElement).toBeDefined();
  });

  test('verifies that first two group commands are present in settings', async () => {
    const firstGroupTitle = 'First Necessary Group';
    const secondGroupTitle = 'Second Necessary Group';
    const thirdGroupTitle = 'Third Group';

    const firstGroupCommand = new TestGroupCommand({ untranslated: firstGroupTitle });
    const secondGroupCommand = new TestGroupCommand({ untranslated: secondGroupTitle });
    const thirdGroupCommand = new TestGroupCommand({ untranslated: thirdGroupTitle });

    settingsCommand.add(firstGroupCommand);
    settingsCommand.add(secondGroupCommand);
    settingsCommand.add(thirdGroupCommand);

    renderAndOpenSettingsPanel(settingsCommand);

    // Check that the first two groups are present
    const firstGroupElement = await screen.findByText(firstGroupTitle);
    const secondGroupElement = await screen.findByText(secondGroupTitle);

    expect(firstGroupElement).toBeDefined();
    expect(secondGroupElement).toBeDefined();

    // Verify they are the first two by checking their order in the DOM
    const allGroupElements = screen.getAllByText(/.*Group$/);
    expect(allGroupElements).toHaveLength(3);
    expect(allGroupElements[0].textContent).toBe(firstGroupTitle);
    expect(allGroupElements[1].textContent).toBe(secondGroupTitle);
  });
});

function renderAndOpenSettingsPanel(settingsCommand: BaseSettingsCommand): {
  container: HTMLElement;
} {
  const { container } = render(
    <SettingsButton inputCommand={settingsCommand} placement="right" />,
    { wrapper }
  );

  const settingsButtonIcon = findIconByNameInContainer(settingsCommand.icon, container);
  assert(settingsButtonIcon !== null);
  fireEvent.click(settingsButtonIcon);

  return { container };
}
