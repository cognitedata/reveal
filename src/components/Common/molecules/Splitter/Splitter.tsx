import React from 'react';
import SplitPane from 'react-split';
import styled, { css } from 'styled-components';
import { Colors } from '@cognite/cogs.js';

export type SplitterProps = {
  minSize?: number[];
  hide?: number[];
  flex?: number[];
  sizes?: number[];
  children: React.ReactNode | React.ReactNode[];
  style?: React.CSSProperties;
};
const defaultMinSize: number[] = [360, 360];
const defaultHide: number[] = [];
const defaultFlex: number[] = [];

export const Splitter = ({
  hide = defaultHide,
  flex = defaultFlex,
  children,
  minSize = defaultMinSize,
  style = {},
  sizes,
}: SplitterProps) => {
  return (
    <SplitterWrapper
      style={style}
      minSize={minSize}
      sizes={sizes}
      expandToMin
      gutterSize={10}
      gutterAlign="center"
      dragInterval={1}
      cursor="col-resize"
      onDragEnd={() => {
        window.dispatchEvent(new Event('resize'));
      }}
      hide={hide
        .map(el => {
          return el * 2 + 1;
        })
        .concat(
          hide.map(el => {
            if (el === 0) {
              return 2;
            }
            return el * 2;
          })
        )}
      lock={hide.map(el => {
        if (el === 0) {
          return 2;
        }
        return el * 2;
      })}
      flex={flex.map(el => {
        return el * 2 + 1;
      })}
    >
      {children}
    </SplitterWrapper>
  );
};

const hideCss = (i: number) => {
  return `
      && > div:nth-child(${i}) {
        display: none;
      }
    `;
};
const flexCss = (i: number) => {
  return `
      && > div:nth-child(${i}) {
        flex: 1;
      }
    `;
};
const lockCss = (i: number) => {
  return `
      && > div:nth-child(${i}) {
        pointer-events: none;
        background-color: inherit;
      }
    `;
};
type WrapperProps = { hide: number[]; lock: number[]; flex: number[] };
const SplitterWrapper = styled(SplitPane)<WrapperProps>(
  (props: WrapperProps) => css`
    flex: 1;
    min-height: 200px;
    width: 100%;
    overflow-y:auto;
    position: relative;
    display: flex;

    button.cogs-menu-item {
      color: ${Colors.black.hex()};
    }

    .rp-stage {
      display: flex;
      position: relative;
      height: 100%;
      flex: 1;
      overflow: hidden;
    }

    .gutter {
      cursor: col-resize;
      transition: 0.3s all;
      background-color: rgba(0, 0, 0, 0.1);
    }
    .gutter:hover {
      background-color: ${Colors['midblue-7'].hex()};
    }

    ${props.hide.map(i => hideCss(i)).join('')}
    ${props.lock.map(i => lockCss(i)).join('')}
    ${props.flex.map(i => flexCss(i)).join('')}
  `
);
