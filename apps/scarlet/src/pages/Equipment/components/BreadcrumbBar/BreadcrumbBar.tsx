import * as Styled from './style';

type BreadcrumbBarProps = {
  unitId: string;
  equipmentType?: string;
};

export const BreadcrumbBar = ({
  unitId,
  equipmentType,
}: BreadcrumbBarProps) => (
  <Styled.Container>
    <Styled.Crumb>P66 Berger</Styled.Crumb>
    <Styled.Crumb>{unitId}</Styled.Crumb>
    {equipmentType && <Styled.Crumb>{equipmentType}</Styled.Crumb>}
  </Styled.Container>
);
