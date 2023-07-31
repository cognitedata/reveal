import { CommonProps, components, OptionTypeBase } from 'react-select';

import { SearchBarIconWrapper, SearchBarTextWrapper } from './elements';

export const SearchValueContainer: React.FC<
  React.PropsWithChildren<CommonProps<OptionTypeBase, boolean>>
> = ({ children, ...props }) => {
  const { ValueContainer } = components;

  return (
    ValueContainer && (
      <ValueContainer {...props}>
        <SearchBarIconWrapper type="Search" />
        <SearchBarTextWrapper>{children}</SearchBarTextWrapper>
      </ValueContainer>
    )
  );
};
