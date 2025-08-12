import { createButton } from '../CommandButton';
import { createCustomInputField } from '../CustomInputField';
import { createDivider } from '../DividerCreator';
import { createDropdownButton } from '../DropdownButton';
import { createFilterButton } from '../FilterButton';
import { createInputField } from '../InputField';
import { createSegmentedButtons } from '../SegmentedButtons';
import { createSettingsButton } from '../SettingsButton';
import { installReactElement } from './ReactElementFactory';

export function installReactElements(): void {
  installReactElement(createCustomInputField);
  installReactElement(createDivider);
  installReactElement(createDropdownButton);
  installReactElement(createFilterButton);
  installReactElement(createInputField);
  installReactElement(createSegmentedButtons);
  installReactElement(createSettingsButton);
  installReactElement(createButton, Number.MAX_SAFE_INTEGER); // Ensure this will be added last in the list of creators
}
