import styled from 'styled-components/macro';
import { useHistory, useParams } from 'react-router-dom';
import { Icon, Tooltip } from '@cognite/cogs.js';

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
          key={item.slug}
          onClick={() => onRoute(item.page, item.slug)}
          active={
            item.slug.startsWith(solutionPage) || (!index && !solutionPage)
          }
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
      <div>
        <StyledItem>
          <Icon type="Help" />
        </StyledItem>
      </div>
    </StyledSideBarMenu>
  );
};

const StyledSideBarMenu = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  width: 56px; // fit to the navbar's 56px + 1px of border
  padding: 0 1rem;
  border-right: solid 1px var(--cogs-greyscale-grey3);
`;

type StyledIconProps = {
  active?: boolean;
};

const StyledItem = styled.div<StyledIconProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3.5rem;
  margin: 1rem 0;
  cursor: pointer;
  border-radius: 5px;
  background-color: ${(props: StyledIconProps) =>
    props.active ? 'var(--cogs-midblue-7)' : 'transparent'};
  transition: all 350ms linear;

  * {
    width: 2.15rem;
    fill: ${(props: StyledIconProps) =>
      props.active ? 'var(--cogs-primary)' : 'var(--cogs-greyscale-grey7)'};
  }

  :hover {
    background-color: ${(props: StyledIconProps) =>
      props.active ? 'var(--cogs-midblue-7)' : 'var(--cogs-midblue-7)'};
  }
`;

const StyledSplitter = styled.div`
  border-top: solid 1px var(--cogs-greyscale-grey4);
  height: 4px;
  margin-top: 20px;
`;
