import React, { useEffect, useState } from 'react';
import { Button, ButtonProps, Colors } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';

export type ButtonGroupProps = {
  children: React.ReactElement<ButtonProps>[];
  currentKey?: string;
  onButtonClicked?: (key: string) => void;
  style?: React.CSSProperties;
  variant?: 'ghost' | 'default';
};
type WrapperProps = { $variant: 'ghost' | 'default' };
export const ButtonGroup = ({
  children,
  currentKey: propsCurrentKey,
  onButtonClicked = () => {},
  style,
  variant = 'default',
}: ButtonGroupProps) => {
  const tabs = children.map(el => el.key) as string[];

  const [currentKey, setKey] = useState<typeof tabs[number]>(
    children[0].key as string
  );

  useEffect(() => {
    if (propsCurrentKey) {
      setKey(propsCurrentKey);
    }
  }, [propsCurrentKey]);

  return (
    <ButtonGroupWrapper $variant={variant} style={style}>
      {tabs.map((el, i) => {
        const key = el as typeof tabs[number];

        return React.cloneElement(children[i], {
          variant: 'ghost',
          type: key === currentKey ? 'primary' : 'secondary',
          onClick: () => {
            setKey(key);
            onButtonClicked(key);
          },
          key,
        } as ButtonProps);
      })}
    </ButtonGroupWrapper>
  );
};
ButtonGroup.Button = Button;

const ButtonGroupWrapper = styled.div<WrapperProps>(
  (props: WrapperProps) => css`
    display: inline-flex;
    width: auto;
    border-radius: 6px;
    padding: 4px;
    background: ${props.$variant === 'default'
      ? Colors['greyscale-grey3'].hex()
      : 'transparent'};

    .cogs-btn.cogs-btn-ghost.cogs-btn-primary {
      background: #fff;
    }

    && > * {
      flex: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  `
);
