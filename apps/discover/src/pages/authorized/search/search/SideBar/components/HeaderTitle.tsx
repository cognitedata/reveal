import React from 'react';
import { useDispatch } from 'react-redux';

import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Icon } from '@cognite/cogs.js';

import { BackButton } from 'components/Buttons';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { toggleFilterBar, setCategoryPage } from 'modules/sidebar/actions';
import { useFilterBarIsOpen } from 'modules/sidebar/selectors';
import { sizes, FlexAlignItems } from 'styles/layout';

import { OpenStatus } from '../types';

const BaseContainer = styled(FlexAlignItems)`
  width: 100%;
  padding-right: 8px;
  white-space: nowrap;
  justify-content: space-between;
  vertical-align: bottom;

  &:hover {
    h6 {
      transition: 250ms;
      color: var(--cogs-midblue-3);
    }
  }
`;

const TitleContainer = styled(BaseContainer)`
  padding: 8px;
  height: 100%;
  width: 100%;
  border-bottom: none;
`;

const Container = styled(FlexAlignItems)`
  height: 68px;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: ${layers.FILTER_HEADER};
  background-color: white;
  white-space: nowrap;
  border-bottom: ${({ isOpen }: OpenStatus) =>
    isOpen
      ? '1px solid var(--cogs-color-strokes-default)'
      : '1px solid transparent'};
  padding-left: ${sizes.normal};
  cursor: default;

  & > .cogs-icon {
    cursor: pointer;
    margin-right: ${sizes.small};
    min-width: 16px;
    color: var(--cogs-t4-color);
  }
`;

interface Props {
  landing?: boolean; // is landing page (/"category")
  title: string;
}
export const HeaderTitle: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  landing = false,
  title,
}) => {
  const isOpen = useFilterBarIsOpen();
  const metrics = useGlobalMetrics('search');
  const dispatch = useDispatch();

  const event = () => {
    metrics.track(`click-close-${title.toLowerCase()}-filter-button`);
    return landing
      ? dispatch(toggleFilterBar())
      : dispatch(setCategoryPage('landing'));
  };

  const renderBackButton = React.useMemo(() => {
    if (landing) {
      return <Icon type="Filter" onClick={event} />;
    }
    return <BackButton tooltipPlacement="bottom-end" onClick={event} />;
  }, [landing]);

  return (
    <Container isOpen={isOpen}>
      {renderBackButton}
      {isOpen && <TitleContainer>{children}</TitleContainer>}
    </Container>
  );
};
