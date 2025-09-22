import { createButton } from '../CommandButton';
import { createCustomInputField } from '../CustomInputField';
import { createDivider } from '../DividerCreator';
import { createDropdownButton } from '../DropdownButton';
import { createFilterButton } from '../FilterButton';
import { createHelpButton } from '../HelpButton';
import { createInputField } from '../InputField';
import { createSegmentedButtons } from '../SegmentedButtons';
import { createSettingsButton } from '../SettingsButton';
import { ComponentFactory } from './ComponentFactory';

export function createComponentFactory(): ComponentFactory {
  const componentFactory = new ComponentFactory();
  installReactElements(componentFactory);
  return componentFactory;
}

function installReactElements(factory: ComponentFactory): void {
  factory.installElement(createCustomInputField);
  factory.installElement(createDivider);
  factory.installElement(createDropdownButton);
  factory.installElement(createFilterButton);
  factory.installElement(createHelpButton);
  factory.installElement(createInputField);
  factory.installElement(createSegmentedButtons);
  factory.installElement(createSettingsButton);
  factory.installElement(createButton, Number.MAX_SAFE_INTEGER); // Ensure this will be added last in the list of creators
}
