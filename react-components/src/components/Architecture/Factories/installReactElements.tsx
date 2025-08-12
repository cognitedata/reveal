import { DropdownButtonCreator } from '../DropdownButton';
import { ButtonCreator } from '../CommandButton';
import { SettingsButtonCreator } from '../SettingsButton';
import { FilterButtonCreator } from '../FilterButton';
import { SegmentedButtonsCreator } from '../SegmentedButtons';
import { InputFieldCreator } from '../InputField';
import { CustomInputFieldCreator } from '../CustomInputField';
import { installReactElement, installFallbackReactElement } from './ReactElementFactory';
import { DividerCreator } from '../DividerCreator';

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
