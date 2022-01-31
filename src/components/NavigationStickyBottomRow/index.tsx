import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { Button } from '@cognite/cogs.js';
import Layers from 'utils/zindex';
import { WorkflowStep } from 'modules/workflows';
import { useSteps } from 'hooks';
import { Justify, NavOptions } from './types';

type Props = {
  step: WorkflowStep;
  justify?: Justify;
  prev?: NavOptions;
  next?: NavOptions;
  skip?: NavOptions;
  showSkipButton?: boolean;
};
export default function NavigationStickyBottomRow(props: Props) {
  const {
    step,
    justify = 'space-between',
    prev,
    next,
    skip,
    showSkipButton,
  } = props;

  const { goToNextStep, goToPrevStep } = useSteps(step);

  return (
    <StickyBottomRow justify={justify}>
      <Tooltip title={prev?.tooltip} placement="right" arrowPointAtCenter>
        <Button
          icon="ArrowLeft"
          type="secondary"
          onClick={() => (prev?.onClick ? prev.onClick() : goToPrevStep())}
          disabled={prev?.disabled}
        >
          {prev?.text ?? 'Back'}
        </Button>
      </Tooltip>
      <div>
        {showSkipButton && (
          <Tooltip title={skip?.tooltip} placement="left" arrowPointAtCenter>
            <Button
              size="large"
              type="ghost"
              onClick={() => (skip?.onClick ? skip.onClick() : goToNextStep())}
              disabled={skip?.disabled}
              style={{ marginRight: '8px' }}
            >
              {skip?.text ?? 'Skip'}
            </Button>
          </Tooltip>
        )}
        <Tooltip title={next?.tooltip} placement="left" arrowPointAtCenter>
          <Button
            size="large"
            type="primary"
            onClick={() => (next?.onClick ? next.onClick() : goToNextStep())}
            disabled={next?.disabled}
          >
            {next?.text ?? 'Next step'}
          </Button>
        </Tooltip>
      </div>
    </StickyBottomRow>
  );
}

const StickyBottomRow = styled.div<{ justify: Justify }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${(props) => props.justify};
  background: white;
  position: fixed;
  z-index: ${Layers.BOTTOM_ROW};
  width: 100%;
  bottom: 0;
  left: 0;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;
