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
  installReactElement(FilterButtonCreator);
  installReactElement(SettingsButtonCreator);
  installReactElement(DropdownButtonCreator);
  installReactElement(SegmentedButtonsCreator);
  installReactElement(InputFieldCreator);
  installReactElement(CustomInputFieldCreator);
  installReactElement(DividerCreator);
  installFallbackReactElement(ButtonCreator);
}
