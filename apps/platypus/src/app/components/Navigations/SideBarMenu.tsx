import { useParams, useLocation } from 'react-router-dom';

import { useNavigate } from '@platypus-app/flags/useNavigate';
import uniqueId from 'lodash/uniqueId';

import { Icon, IconType, Tooltip } from '@cognite/cogs.js';

import * as S from './elements';

export type SideBarItem = {
  icon: IconType;
  slug: string;
  disabled?: boolean;
  tooltip?: string;
  splitter?: boolean;
};

type SideBarProps = {
  items: Array<SideBarItem>;
};

export const SideBarMenu = ({ items }: SideBarProps) => {
  const { dataModelExternalId, version, space } = useParams<{
    dataModelExternalId: string;
    version: string;
    space: string;
  }>();

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const baseNavigationRoute = `/${space}/${dataModelExternalId}/${version}`;

  const getNextRoute = (slug: string) => {
    return `${baseNavigationRoute}/${slug}`;
  };

  const onRoute = (slug: string) => {
    navigate(getNextRoute(slug));
  };

  const renderIcon = (item: SideBarItem) => {
    const isActive =
      pathname.endsWith(getNextRoute(item.slug)) ||
      (pathname.endsWith(baseNavigationRoute) && !item.slug);
    return (
      <>
        {item.splitter && <S.Splitter />}
        <S.SideBarItem
          type={isActive ? 'secondary' : 'ghost'}
          toggled={isActive}
          key={item.slug}
          disabled={item.disabled}
          onClick={() => onRoute(item.slug)}
        >
          <Icon type={item.icon} />
        </S.SideBarItem>
      </>
    );
  };

  return (
    <S.SideBarMenu>
      <div>
        {items.map((item) => {
          if (item.tooltip) {
            return (
              <Tooltip
                placement="right"
                content={item.tooltip}
                arrow={false}
                delay={250}
                key={`${item.slug}-${uniqueId()}`}
              >
                {renderIcon(item)}
              </Tooltip>
            );
          }
          return renderIcon(item);
        })}
      </div>
    </S.SideBarMenu>
  );
};
