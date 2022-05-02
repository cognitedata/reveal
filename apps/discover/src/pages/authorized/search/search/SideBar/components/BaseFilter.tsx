import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components/macro';

import { BlockExpander } from 'components/BlockExpander/BlockExpander';
import { HideButton } from 'components/Buttons';
import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { setCategoryPage, toggleFilterBar } from 'modules/sidebar/actions';
import { useFilterBarIsOpen } from 'modules/sidebar/selectors';
import { CategoryTypes, Modules } from 'modules/sidebar/types';
import { SidebarDocumentAppliedFilters } from 'pages/authorized/search/document/header/SidebarDocumentAppliedFilters';
import {
  HIDE_BUTTON_TEXT_KEY,
  EXPAND_FILTERS_TEXT,
} from 'pages/authorized/search/search/SideBar/constants';
import { SidebarWellAppliedFilters } from 'pages/authorized/search/well/filters/SidebarWellAppliedFilters';
import { FlexGrow, FlexColumn, sizes } from 'styles/layout';

import { BetaSymbol } from '../../../../elements';
import {
  CollapseContainer,
  FilterContainer,
  HideButtonContainer,
} from '../elements';

import { ForwardIcon } from './elements';
import { FilterActions } from './FilterActions';
import { FilterTitle } from './FilterTitle';
import { HeaderTitle } from './HeaderTitle';

const Container = styled.div`
  padding-bottom: 12px;
  height: 52px;
  white-space: nowrap;
  background-color: var(--cogs-greyscale-grey1);
  border-radius: 6px;
  user-select: none;
`;

const FilterTitleDiv = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: var(--cogs-greyscale-grey9);
  user-select: none;
  padding-left: 2px;
`;

const FilterTextDiv = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: ${sizes.normal};
  color: var(--cogs-greyscale-grey6);
  margin-top: ${sizes.small};
  user-select: none;
  padding-left: 2px;
`;

const CategoryWrapper = styled(FlexColumn)`
  width: 100%;
  padding: 12px 12px ${sizes.normal} 12px;
  border-radius: ${sizes.small};
  background-color: var(--cogs-greyscale-grey1);
  margin-bottom: ${sizes.small};
  cursor: pointer;

  &:hover .cogs-icon-ArrowRight {
    color: var(--cogs-midblue-3);
    margin-right: ${sizes.extraSmall};
    transition: margin-right var(--cogs-transition-time-fast);
  }
`;

interface CategoryHeaderProps {
  category: CategoryTypes;
  displayClear?: boolean;
  displayCategorySwitch?: boolean;
  displayBetaSymbol?: boolean;
  handleClearFilters?: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = React.memo(
  ({ category, ...rest }) => {
    if (category === 'landing') {
      return null;
    }

    return <FilterActions category={category} {...rest} />;
  }
);

interface CategorySubHeaderProps {
  title: string;
  displayBetaSymbol?: boolean;
}

const CategorySubHeader: React.FC<CategorySubHeaderProps> = React.memo(
  ({ title, displayBetaSymbol }) => {
    return (
      <FilterTitleDiv>
        {title}
        {displayBetaSymbol && <BetaSymbol data-testid="beta-symbol" />}
      </FilterTitleDiv>
    );
  }
);

export interface TitleProps {
  title: string;
  category: CategoryTypes;
  displayClear?: boolean;
  iconElement?: ReactNode;
  description?: string;
  displayBetaSymbol?: boolean;
  handleClearFilters?: () => void;
}
const FilterItemTitle: React.FC<TitleProps> = ({
  title,
  category,
  iconElement,
  description,
  displayBetaSymbol = false,
  ...rest
}) => {
  const metrics = useGlobalMetrics('search');
  const dispatch = useDispatch();
  const history = useHistory();

  const handleFilterClick = () => {
    dispatch(setCategoryPage(category));
    history.push(`${navigation.SEARCH}/${category}`);
    metrics.track(`click-open-${title.toLowerCase()}-filter-button`);
  };

  return (
    <CategoryWrapper onClick={handleFilterClick}>
      <Container>
        <FilterTitle title={title} iconElement={iconElement}>
          <CategoryHeader category={category} {...rest} displayClear />
          <FlexGrow />
          <ForwardIcon type="ArrowRight" />
        </FilterTitle>
      </Container>
      <CategorySubHeader title={title} displayBetaSymbol={displayBetaSymbol} />
      <FilterTextDiv>{description}</FilterTextDiv>
      {category === Modules.DOCUMENTS && <SidebarDocumentAppliedFilters />}
      {category === Modules.WELLS && <SidebarWellAppliedFilters />}
    </CategoryWrapper>
  );
};

type HeadTitleProps = Omit<TitleProps, 'icon'>;
const HeadTitle: React.FC<HeadTitleProps> = React.memo(
  ({ title, category, ...rest }) => {
    return (
      <HeaderTitle title={title}>
        <FilterTitle title={title} header>
          <CategoryHeader
            category={category}
            {...rest}
            displayCategorySwitch
            displayClear
          />
        </FilterTitle>
      </HeaderTitle>
    );
  }
);

interface IBaseFilter {
  FilterTitle: React.FC<TitleProps>;
  HeaderTitle: React.FC<HeadTitleProps>;
}
export const BaseFilter: React.FC & IBaseFilter = ({ children }) => {
  const { t } = useTranslation();

  const isOpen = useFilterBarIsOpen();
  const metrics = useGlobalMetrics('search');
  const dispatch = useDispatch();

  const handleSidebarExpandCollapse = () => {
    metrics.track(`click-${isOpen ? 'hide' : 'show'}-filter-bar-button`);
    dispatch(toggleFilterBar());
  };

  const renderToggleFilterBar = React.useMemo(() => {
    if (isOpen) {
      return (
        <HideButtonContainer>
          <HideButton
            text={t(HIDE_BUTTON_TEXT_KEY)}
            onClick={handleSidebarExpandCollapse}
            aria-label={t('Collapse the filter bar')}
            data-testid="hide-sidebar"
          />
        </HideButtonContainer>
      );
    }
    return (
      <BlockExpander
        text={t(EXPAND_FILTERS_TEXT)}
        onClick={handleSidebarExpandCollapse}
      />
    );
  }, [isOpen]);

  return (
    <FilterContainer>
      {isOpen && children}
      <CollapseContainer isOpen={isOpen}>
        {renderToggleFilterBar}
      </CollapseContainer>
    </FilterContainer>
  );
};

BaseFilter.FilterTitle = FilterItemTitle;
BaseFilter.HeaderTitle = HeadTitle;
