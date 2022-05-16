import { useMemo, useState } from 'react';
import {
  Collapse,
  CollapsePanelProps,
  Graphic,
  Tooltip,
} from '@cognite/cogs.js';

import { CollapseHeader } from './collapse-header';
import {
  StampGrid,
  StampToolCollapseIcon,
  StampToolHeaderTitle,
  StampToolItem,
  StampToolNoResultWrapper,
  StampToolPopUpWrapper,
  StampToolSearchInput,
} from './elements';
import { StampGroup } from './types';

type StampToolPopupProps = {
  activeStampUrl: string;
  onSelectStamp: (nextStampURL: string) => void;
  stampGroups: StampGroup[];
};

const getExpandIcon = ({ isActive }: CollapsePanelProps) => {
  return (
    <StampToolCollapseIcon type="ChevronDownLarge" $isActive={!!isActive} />
  );
};

export const StampToolPopup = ({
  activeStampUrl,
  onSelectStamp,
  stampGroups,
}: StampToolPopupProps) => {
  const [search, setSearch] = useState('');
  const [activeStampGroup, setActiveStampGroup] = useState('0');

  const filteredStampGroups = useMemo(
    () =>
      search
        ? stampGroups
            .map((stampGroup) => ({
              ...stampGroup,
              stamps: stampGroup.stamps.filter((stamp) =>
                stamp.name.toLowerCase().includes(search.toLowerCase())
              ),
            }))
            .filter((stampGroup) => stampGroup.stamps.length)
        : stampGroups,
    [search, stampGroups]
  );

  return (
    <StampToolPopUpWrapper>
      <StampToolHeaderTitle level={6} color="grey">
        Diagramming
      </StampToolHeaderTitle>

      <StampToolSearchInput
        value={search}
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
        }}
        variant="default"
        icon="Search"
        placeholder="Search"
        iconPlacement="right"
        fullWidth
      />

      <Collapse
        accordion
        onChange={(selectedStampGroup) =>
          setActiveStampGroup(selectedStampGroup)
        }
        activeKey={activeStampGroup}
        expandIcon={getExpandIcon}
        className="workspace-collapse"
      >
        {filteredStampGroups.length ? (
          filteredStampGroups.map(
            (stampGroup, index) =>
              stampGroup.stamps.length > 0 && (
                <Collapse.Panel
                  header={
                    <CollapseHeader
                      title={stampGroup.name}
                      stampCount={stampGroup.stamps.length}
                      showStampCount={!!search}
                    />
                  }
                  key={stampGroup.name}
                  isActive={index === 0}
                  className="workspace-stamp-collapse"
                  headerClass="workspace-stamp-collapse_header"
                >
                  <StampGrid>
                    {stampGroup.stamps.map((stamp) => (
                      <Tooltip key={stamp.name} content={stamp.name}>
                        <StampToolItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStamp(stamp.url);
                          }}
                          onMouseUp={(e) => {
                            e.stopPropagation();
                          }}
                          className={
                            activeStampUrl === stamp.url ? 'active' : ''
                          }
                        >
                          <img
                            src={stamp.url}
                            alt={stamp.name}
                            loading="lazy"
                          />
                        </StampToolItem>
                      </Tooltip>
                    ))}
                  </StampGrid>
                </Collapse.Panel>
              )
          )
        ) : (
          <StampToolNoResultWrapper>
            <Graphic type="Search" />
            <p>No search result for &quot;{search}&quot;</p>
          </StampToolNoResultWrapper>
        )}
      </Collapse>
    </StampToolPopUpWrapper>
  );
};
