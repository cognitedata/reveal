import { ButtonCreator } from '../CommandButton';
import { CustomInputFieldCreator } from '../CustomInputField';
import { DividerCreator } from '../DividerCreator';
import { DropdownButtonCreator } from '../DropdownButton';
import { FilterButtonCreator } from '../FilterButton';
import { InputFieldCreator } from '../InputField';
import { installReactElement } from './ReactElementFactory';
import { SegmentedButtonsCreator } from '../SegmentedButtons';
import { SettingsButtonCreator } from '../SettingsButton';

export function installReactElements(): void {
  installReactElement(new FilterButtonCreator());
  installReactElement(new SettingsButtonCreator());
  installReactElement(new DropdownButtonCreator());
  installReactElement(new SegmentedButtonsCreator());
  installReactElement(new InputFieldCreator());
  installReactElement(new CustomInputFieldCreator());
  installReactElement(new DividerCreator());
  installReactElement(new ButtonCreator(), Number.MAX_SAFE_INTEGER); // Ensure this will be added last in the list of creators
}
