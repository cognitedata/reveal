import * as Styled from './style';

type DataSourceHeaderProps = {
  label: string;
  disabled?: boolean;
  approved?: boolean;
};

export const DataSourceHeader = ({
  label,
  disabled,
  approved,
}: DataSourceHeaderProps) => (
  <Styled.Container>
    <Styled.IconContainer>
      <Styled.Icon
        checkmark={!disabled ? 1 : 0}
        approved={approved ? 1 : 0}
        type={disabled ? 'Info' : 'CheckmarkFilled'}
      />
    </Styled.IconContainer>
    <Styled.Label>{label}</Styled.Label>
  </Styled.Container>
);
