import React, { Fragment } from 'react';

import isUndefined from 'lodash/isUndefined';
import { withThousandSeparator } from 'utils/number';

import { Dropdown, Menu } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import { MiddleEllipsis } from 'components/middle-ellipsis/MiddleEllipsis';
import { FlexGrow } from 'styles/layout';

import {
  Badge,
  BreadCrumbButton,
  BreadCrumbHeader,
  BreadCrumbItem,
  BreadCrumbMenu,
  DividerWrapper,
  Title,
  Wrapper,
} from '../elements';

import { BreadCrumbContent, BreadCrumbStats } from './types';

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
                <Title>
                  <MiddleEllipsis value={facet.name} fixedLength={18} />
                </Title>
                <FlexGrow />
                <Badge text={`${withThousandSeparator(facet.count)}`} />
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
            {index !== (content || []).length - 1 && (
              <DividerWrapper>
                <Menu.Divider />
              </DividerWrapper>
            )}
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
