import * as Styled from './style';

type BreadcrumbBarProps = {
  unitName: string;
  equipmentType?: string;
};

export const BreadcrumbBar = ({
  unitName,
  equipmentType,
}: BreadcrumbBarProps) => (
  <Styled.Container>
    <Styled.Crumb>P66 Berger</Styled.Crumb>
    <Styled.Crumb>{unitName}</Styled.Crumb>
    {equipmentType && <Styled.Crumb>{equipmentType}</Styled.Crumb>}
  </Styled.Container>
);
