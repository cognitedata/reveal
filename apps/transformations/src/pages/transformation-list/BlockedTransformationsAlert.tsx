import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { useTranslation } from '@transformations/common';
import { TransformationRead } from '@transformations/types';
import { createInternalLink } from '@transformations/utils';
import { Alert } from 'antd';

import { Body, Button, Colors, Icon } from '@cognite/cogs.js';

type BlockedTransformationsAlertProps = {
  blockedTransformations: TransformationRead[];
  onClick: () => void;
};

const BlockedTransformationsAlert = ({
  blockedTransformations,
  onClick,
}: BlockedTransformationsAlertProps): JSX.Element => {
  const { t } = useTranslation();
  const transformationsCount = blockedTransformations.length;
  const hasMultipleTransformations = transformationsCount > 1;
  const firstTransformation = blockedTransformations?.[0] || {};

  return (
    <StyledAlert
      type="error"
      message={
        <StyledAlertContent>
          <StyledWarningIcon />
          <Body level={2}>
            <strong>
              {!hasMultipleTransformations
                ? firstTransformation?.name
                : t('many-transformations', {
                    count: transformationsCount,
                  })}
            </strong>{' '}
            {t('has-5-consecutive-fails-and-will-no-longer-run', {
              count: transformationsCount,
            })}
          </Body>
          <TroubleshootAction
            hasMultipleTransformations={hasMultipleTransformations}
            transformation={firstTransformation}
            onClick={onClick}
          />
        </StyledAlertContent>
      }
    />
  );
};

export default BlockedTransformationsAlert;

type TroubleshootActionProps = {
  transformation?: TransformationRead;
  hasMultipleTransformations: boolean;
  onClick: () => void;
};

const TroubleshootAction = ({
  transformation,
  hasMultipleTransformations,
  onClick,
}: TroubleshootActionProps) => {
  const { t } = useTranslation();
  if (hasMultipleTransformations) {
    return (
      <StyledActionButton onClick={onClick}>{t('view-all')}</StyledActionButton>
    );
  }

  return (
    <StyledActionLink to={createInternalLink(transformation?.id)}>
      {t('troubleshoot')}
    </StyledActionLink>
  );
};

const StyledWarningIcon = styled(Icon).attrs({
  type: 'WarningFilled',
})`
  color: ${Colors['text-icon--status-critical']};
  flex-shrink: 0;
`;

const StyledAlert = styled(Alert)`
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 18px;
`;

const StyledAlertContent = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 11px;
`;

const buttonCss = css`
  display: inline-flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  margin-left: auto;
  transition: background-color 300ms ease;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  height: auto;

  && {
    padding: 4px 8px;
  }

  &:hover {
    background-color: rgba(34, 42, 83, 0.06);
    transition: background-color 300ms ease;
  }

  > i {
    margin-left: 8px;
  }
`;

const StyledActionButton = styled((props) => (
  <Button type="ghost" {...props}>
    {props.children}
    <Icon type="ArrowRight" />
  </Button>
))`
  ${buttonCss};
`;

const StyledActionLink = styled((props) => (
  <Link as={Button} type="ghost" {...props}>
    {props.children}
    <Icon type="ArrowRight" />
  </Link>
))`
  ${buttonCss};
  display: inline-flex;
`;
