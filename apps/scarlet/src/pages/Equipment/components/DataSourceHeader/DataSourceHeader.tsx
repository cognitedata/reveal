/* eslint-disable no-nested-ternary */
import { Detection, DetectionState, DetectionType } from 'types';
import { getDetectionSourceLabel } from 'utils';

import * as Styled from './style';

type DataSourceHeaderProps = {
  label?: string;
  detection?: Detection;
  isDiscrepancy?: boolean;
};

export const DataSourceHeader = ({
  label,
  detection,
  isDiscrepancy,
}: DataSourceHeaderProps) => (
  <Styled.Container>
    <Styled.IconContainer>
      <DataSourceIcon detection={detection} isDiscrepancy={isDiscrepancy} />
    </Styled.IconContainer>
    <Styled.Label>{label ?? getDetectionSourceLabel(detection)}</Styled.Label>
  </Styled.Container>
);

type DataSourceIconProps = {
  detection?: Detection;
  isDiscrepancy?: boolean;
};

const DataSourceIcon = ({ detection, isDiscrepancy }: DataSourceIconProps) => {
  if (!detection)
    return <Styled.Icon state={Styled.IconState.CRITICAL} type="Info" />;

  if (detection?.isPrimary)
    return (
      <Styled.PrimaryTag className="cogs-micro strong">
        Primary
      </Styled.PrimaryTag>
    );

  if (detection.type === DetectionType.PCMS) {
    return (
      <Styled.Icon
        type={isDiscrepancy ? 'WarningTriangle' : 'Info'}
        state={
          isDiscrepancy ? Styled.IconState.CRITICAL : Styled.IconState.NEUTRAL
        }
      />
    );
  }

  return (
    <Styled.Icon
      type="CheckmarkFilled"
      state={
        detection.state === DetectionState.APPROVED
          ? Styled.IconState.APPROVED
          : Styled.IconState.PENDING
      }
    />
  );
};
