import React, { useEffect, useState } from 'react';

import classNames from 'classnames';
import styled from 'styled-components/macro';

import type { ButtonProps } from '@cognite/cogs.js';
import { Button, Tooltip } from '@cognite/cogs.js';

export type SegmentedControlButtonProps = ButtonProps & {
  tooltipContent?: string;
  tooltipPlacement?: 'bottom' | 'top';
};

export interface SegmentedControlProps {
  children: React.ReactElement<SegmentedControlButtonProps>[];
  className?: string;
  currentKey?: string;
  fullWidth?: boolean;
  onButtonClicked?: (key: string) => void;
  style?: React.CSSProperties;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'small';
  disabled?: boolean;
  error?: string;
}

export function SegmentedControl({
  children,
  className,
  currentKey: propsCurrentKey,
  onButtonClicked,
  style,
  variant = 'default',
  size = 'default',
  fullWidth = false,
  disabled = false,
  error,
}: SegmentedControlProps) {
  const tabs = children.map((el) => el.key) as string[];

  const [currentKey, setKey] = useState<typeof tabs[number]>(
    propsCurrentKey ?? (children[0].key as string)
  );

  useEffect(() => {
    if (propsCurrentKey) {
      setKey(propsCurrentKey);
    }
  }, [propsCurrentKey]);

  const extendedClassName = classNames(
    'cogs-segmented-control',
    variant,
    { 'full-width': fullWidth },
    className
  );

  return (
    <SegmentedControlContainer
      className={classNames({ error }, extendedClassName)}
      style={style}
    >
      {tabs.map((el, i) => {
        const key = el;

        return (
          <span
            className={classNames({ elevated: key === currentKey })}
            key={key}
          >
            <Tooltip
              content={children[i].props.title}
              disabled={!children[i].props.title}
            >
              {React.cloneElement(children[i], {
                className: classNames(
                  'cogs-segmented-control-btn',
                  children[i].props.className
                ),
                variant: key === currentKey ? 'inverted' : 'default',
                type: key === currentKey ? 'primary' : 'ghost',
                size,
                disabled,
                onClick: () => {
                  setKey(key);
                  if (onButtonClicked) {
                    onButtonClicked(key);
                  }
                },
                key,
              })}
            </Tooltip>
          </span>
        );
      })}
    </SegmentedControlContainer>
  );
}

const SegmentedControlContainer = styled.div`
  &.error {
    border: 2px solid var(--cogs-danger) !important;
  }
`;

SegmentedControl.Button = ({
  tooltipContent,
  children,
  tooltipPlacement = 'bottom',
  ...rest
}: SegmentedControlButtonProps) => {
  if (tooltipContent) {
    return (
      <Tooltip content={tooltipContent} placement={tooltipPlacement}>
        <SegmentedControlButtonElement {...rest}>
          {children}
        </SegmentedControlButtonElement>
      </Tooltip>
    );
  }
  return (
    <SegmentedControlButtonElement {...rest}>
      {children}
    </SegmentedControlButtonElement>
  );
};

const SegmentedControlButtonElement = styled(Button)`
  &[disabled].cogs-btn-primary {
    background: var(--cogs-white);
  }
`;
