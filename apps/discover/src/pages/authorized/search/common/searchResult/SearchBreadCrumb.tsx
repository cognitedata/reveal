import React, { Fragment } from 'react';

import isUndefined from 'lodash/isUndefined';
import styled from 'styled-components/macro';
import { withThousandSeparator } from 'utils/number';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import { GreyBadge } from 'components/badge';
import { FlexGrow, FlexRow } from 'styles/layout';

import { BreadCrumbContent, BreadCrumbStats } from './types';

const Wrapper = styled(FlexRow)``;

const BreadCrumbButton = styled(Button)`
  background-color: #ebf2fc;
  color: #357ae2;
  font-weight: 400;
`;

const BreadCrumbMenu = styled(Menu)`
  max-height: 60vh;
  overflow-y: scroll;
`;

const BreadCrumbHeader = styled(Menu.Header)`
  font-weight: 500;
  line-height: 20px;
  font-size: 12px;
`;

const BreadCrumbItem = styled(Menu.Item)`
  cursor: default !important;
  &:hover {
    background-color: transparent !important;
  }
`;

export interface Props {
  stats: BreadCrumbStats;
  content?: BreadCrumbContent[];
}
export const SearchBreadcrumb: React.FC<Props> = React.memo(
  ({ content, stats }) => {
    const { t } = useTranslation();

    const renderFacetAndCount = (facets: BreadCrumbContent['content']) => {
      return (
        <>
          {(facets || []).map((facet) => {
            return (
              <BreadCrumbItem key={facet.name}>
                {facet.name}
                <FlexGrow />
                <GreyBadge text={`${withThousandSeparator(facet.count)}`} />
              </BreadCrumbItem>
            );
          })}
        </>
      );
    };

    const MenuContent = (
      <BreadCrumbMenu>
        {(content || []).map((item, index) => (
          <Fragment key={item.name}>
            <BreadCrumbHeader>{item.name}</BreadCrumbHeader>
            {renderFacetAndCount(item.content)}
            {index !== (content || []).length - 1 && <Menu.Divider />}
          </Fragment>
        ))}
      </BreadCrumbMenu>
    );

    const renderDropDown = React.useMemo(
      () => (
        <Dropdown content={MenuContent} disabled={!content}>
          <BreadCrumbButton
            icon={content ? 'Info' : undefined}
            iconPlacement="right"
            aria-label="Info"
          >
            {t('Showing')}: {withThousandSeparator(stats.currentHits)}
            {isUndefined(stats.totalResults)
              ? ` ${t('files')}`
              : ` / ${withThousandSeparator(stats.totalResults)}`}
          </BreadCrumbButton>
        </Dropdown>
      ),
      [stats]
    );

    return (
      <Wrapper
        id="search-header-breadcrumb"
        data-testid="search-header-breadcrumb"
      >
        {renderDropDown}
      </Wrapper>
    );
  }
);
