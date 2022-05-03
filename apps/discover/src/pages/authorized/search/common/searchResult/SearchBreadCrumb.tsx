import React, { Fragment } from 'react';

import { withThousandSeparator } from 'utils/number';

import { Dropdown, Menu, Flex } from '@cognite/cogs.js';

import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';
import { EMPTY_ARRAY } from 'constants/empty';
import { FlexGrow } from 'styles/layout';

import {
  BreadCrumbItem,
  BreadCrumbButton,
  BreadCrumbHeader,
  BreadCrumbMenu,
  DividerWrapper,
  Badge,
  Title,
} from './elements';
import { BreadCrumbStatInfo, BreadCrumbStats } from './types';

export interface Props {
  stats: BreadCrumbStats[];
}

const renderFacetAndCount = (facets: BreadCrumbStatInfo['content']) => {
  return (
    <>
      {(facets || EMPTY_ARRAY).map((facet) => {
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

const MenuContent = ({ content }: { content?: BreadCrumbStatInfo[] }) => (
  <BreadCrumbMenu>
    {(content || EMPTY_ARRAY).map((item, index) => (
      <Fragment key={item.name}>
        <BreadCrumbHeader>{item.name}</BreadCrumbHeader>
        {renderFacetAndCount(item.content)}
        {index !== (content || EMPTY_ARRAY).length - 1 && (
          <DividerWrapper>
            <Menu.Divider />
          </DividerWrapper>
        )}
      </Fragment>
    ))}
  </BreadCrumbMenu>
);

const getLabel = ({
  label,
  currentHits,
  totalResults,
  entityLabel,
}: BreadCrumbStats) => {
  const prefix = withThousandSeparator(currentHits);
  const results = totalResults
    ? ` / ${withThousandSeparator(totalResults)}`
    : '';
  const labelStart = label || 'Showing';
  const suffix = entityLabel ? ` ${entityLabel}` : '';

  return `${labelStart}: ${prefix}${results}${suffix}`;
};

export const SearchBreadcrumb: React.FC<Props> = React.memo(({ stats }) => {
  const renderDropDown = React.useMemo(
    () =>
      stats.map((stat) => {
        return (
          <Dropdown
            key={`${stat.currentHits}_${stat.totalResults}_${stat.label}`}
            content={<MenuContent content={stat.info} />}
            disabled={!stat.info}
          >
            <BreadCrumbButton
              data-testid="bread-crumb-info-button"
              icon={stat.info ? 'Info' : undefined}
              iconPlacement="right"
              aria-label="Info"
            >
              {getLabel(stat)}
            </BreadCrumbButton>
          </Dropdown>
        );
      }),
    [stats]
  );

  return (
    <Flex
      id="search-header-breadcrumb"
      data-testid="search-header-breadcrumb"
      direction="row"
      alignItems="center"
      gap={10}
    >
      {renderDropDown}
    </Flex>
  );
});
