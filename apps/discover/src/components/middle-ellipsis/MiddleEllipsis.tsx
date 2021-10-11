import { useCallback } from 'react';

import { DEFAULT_TOOLTIP_PLACEMENT } from 'components/buttons';
import { Tooltip } from 'components/tooltip';

import {
  MiddleEllipsisTooltipContainer,
  MiddleEllipsisWrapper,
  SpanFlex,
} from './element';
import { updateTextWithMiddleEllipsis } from './utils';

export const MiddleEllipsis: React.FC<{ children: React.ReactElement }> = (
  props
) => {
  const handleReferenceChange = useCallback(
    (node: HTMLElement) => {
      if (node) {
        window.addEventListener('resize', () => {
          setUpMiddleEllipse(node);
        });
        setUpMiddleEllipse(node);
      }
    },
    [props]
  );

  const setUpMiddleEllipse = (currentNode: HTMLElement) => {
    const { parentElement } = currentNode;
    const firstChildNode = currentNode.firstChild as HTMLElement;

    if (currentNode && firstChildNode && parentElement) {
      const IsCurrentNodeLarger =
        currentNode.offsetWidth > parentElement?.offsetWidth;

      updateTextWithMiddleEllipsis(
        IsCurrentNodeLarger ? parentElement : currentNode,
        firstChildNode
      );
    }
  };

  return (
    <MiddleEllipsisWrapper ref={handleReferenceChange}>
      {props.children}
    </MiddleEllipsisWrapper>
  );
};

export const getMiddleEllipsisWrapper = (value: string, showTooltip = true) => {
  const middleEllipsisComponent = (
    <MiddleEllipsis>
      <span title={value} data-testid="middle-ellipsis-text">
        {value}
      </span>
    </MiddleEllipsis>
  );

  if (showTooltip) {
    return (
      <MiddleEllipsisTooltipContainer>
        <Tooltip
          title={value}
          key={value}
          placement={DEFAULT_TOOLTIP_PLACEMENT}
        >
          <SpanFlex>{middleEllipsisComponent}</SpanFlex>
        </Tooltip>
      </MiddleEllipsisTooltipContainer>
    );
  }

  return middleEllipsisComponent;
};
