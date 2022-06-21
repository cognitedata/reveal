import styled from 'styled-components/macro';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Tooltip } from '@cognite/cogs.js';

type SideBarProps = {
  items: Array<SideBarItem>;
};

export type SideBarItem = {
  icon: JSX.Element;
  page: string;
  slug: string;
  tooltip?: string;
  splitter?: boolean;
};

export const SideBarMenu = ({ items }: SideBarProps) => {
  const { solutionId, version, solutionPage } = useParams<{
    solutionId: string;
    version: string;
    solutionPage: string;
  }>();

  const history = useHistory();

  const onRoute = (page: string, slug: string) => {
    history.push(`/data-models/${solutionId}/${version}/${page}/${slug}`);
  };

  const renderIcon = (item: SideBarItem, index: number) => {
    return (
      <>
        {item.splitter && <StyledSplitter />}
        <StyledItem
          type={
            item.slug.startsWith(solutionPage) || (!index && !solutionPage)
              ? 'secondary'
              : 'ghost'
          }
          toggled={
            item.slug.startsWith(solutionPage) || (!index && !solutionPage)
          }
          key={item.slug}
          onClick={() => onRoute(item.page, item.slug)}
        >
          {item.icon}
        </StyledItem>
      </>
    );
  };

  return (
    <StyledSideBarMenu>
      <div>
        {items.map((item, index) => {
          if (item.tooltip) {
            return (
              <Tooltip
                placement="right"
                content={item.tooltip}
                arrow={false}
                delay={250}
                key={item.slug}
              >
                {renderIcon(item, index)}
              </Tooltip>
            );
          }
          return renderIcon(item, index);
        })}
      </div>
    </StyledSideBarMenu>
  );
};

const StyledSideBarMenu = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  align-items: center !important;
  width: 56px; // fit to the navbar's 56px + 1px of border
  padding: 10px;
  border-right: solid 1px var(--cogs-greyscale-grey3);
`;

const StyledItem = styled(Button)`
  margin-bottom: 8px !important;
  width: 36px !important;
  height: 36px !important;
  padding: 10px !important;
`;

const StyledSplitter = styled.div`
  border-top: solid 1px var(--cogs-greyscale-grey4);
  height: 4px;
  margin-bottom: 8px;
`;
