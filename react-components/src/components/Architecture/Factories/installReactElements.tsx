import { ButtonCreator } from '../CommandButton';
import { CustomInputFieldCreator } from '../CustomInputField';
import { DividerCreator } from '../DividerCreator';
import { DropdownButtonCreator } from '../DropdownButton';
import { FilterButtonCreator } from '../FilterButton';
import { InputFieldCreator } from '../InputField';
import { installReactElement, installFallbackReactElement } from './ReactElementFactory';
import { SegmentedButtonsCreator } from '../SegmentedButtons';
import { SettingsButtonCreator } from '../SettingsButtonCreator';

export function installReactElements(): void {
  installReactElement(new FilterButtonCreator());
  installReactElement(new SettingsButtonCreator());
  installReactElement(new DropdownButtonCreator());
  installReactElement(new SegmentedButtonsCreator());
  installReactElement(new InputFieldCreator());
  installReactElement(new CustomInputFieldCreator());
  installReactElement(new DividerCreator());
  installFallbackReactElement(new ButtonCreator());
}
