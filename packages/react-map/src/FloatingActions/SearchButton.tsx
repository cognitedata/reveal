import { BaseButtonProps, BaseButton } from './BaseButton';

export const SearchButton: React.FC<BaseButtonProps> = (props) => (
  <BaseButton
    type="primary"
    icon="Search"
    tooltip="Search"
    aria-label="Search"
    {...props}
  />
);
