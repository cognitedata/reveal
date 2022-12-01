import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icon, IconType, Tooltip } from '@cognite/cogs.js';
import * as S from './elements';

export type SideBarItem = {
  icon: IconType;
  slug: string;
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

  const baseNavigationRoute = `/data-models/${space}/${dataModelExternalId}/${version}`;

  const getNextRoute = (slug: string) => {
    return `${baseNavigationRoute}/data/${slug}`;
  };

  const onRoute = (slug: string) => {
    navigate(getNextRoute(slug));
  };

  const renderIcon = (item: SideBarItem) => {
    return (
      <>
        {item.splitter && <S.Splitter />}
        <S.SideBarItem
          type={
            pathname === getNextRoute(item.slug) ||
            (pathname === baseNavigationRoute && !item.slug)
              ? 'secondary'
              : 'ghost'
          }
          toggled={
            pathname === getNextRoute(item.slug) ||
            (pathname === baseNavigationRoute && !item.slug)
          }
          key={item.slug}
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
        {items.map((item, index) => {
          if (item.tooltip) {
            return (
              <Tooltip
                placement="right"
                content={item.tooltip}
                arrow={false}
                delay={250}
                key={`${item.slug}-${index}`}
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
