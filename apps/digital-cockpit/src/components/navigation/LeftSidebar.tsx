import React, { useCallback, useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { A, Icon, Overline } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { getRootSuites } from 'store/suites/selectors';
import { Suite } from 'store/suites/types';
import { useMetrics } from 'utils/metrics';
import { ApplicationItem } from 'store/config/types';
import useCogniteApplications from 'hooks/useCogniteApplications';
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isAdmin } from 'store/groups/selectors';
import { changeAndSaveSuitesOrder } from 'store/suites/thunks';
import { ApiClientContext } from 'providers/ApiClientProvider';

import { handleHideSidebar } from './utils';
import {
  TitleContainer,
  ItemsContainer,
  CollapseButton,
  SidebarContainer,
} from './elements';
import ApplicationNavigationItem from './ApplicationNavigationItem';
import SuiteNavigationItem from './SuiteNavigationItem';

type SuiteItemProps = {
  item: Suite;
  handleClick: () => void;
  isOpen?: boolean;
};
const SortableSuiteNavigationItem: React.FC<SuiteItemProps> = ({
  item,
  handleClick,
  isOpen,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.key });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as { transform: string; transition: string };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <NavLink to={`/suites/${item.key}`} key={item.key} onClick={handleClick}>
        <SuiteNavigationItem dataItem={item} isOpen={isOpen} />
      </NavLink>
    </div>
  );
};

const LeftSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const apiClient = useContext(ApiClientContext);
  const suites = useSelector(getRootSuites);
  const { activeApplications: applications } = useCogniteApplications();
  const metrics = useMetrics('LeftSidebar');
  const admin = useSelector(isAdmin);

  const sideBarState = JSON.parse(
    localStorage.getItem('sideBarState') || 'true' // TODO(DTC-215) store in state
  );
  const [isOpen, setOpen] = useState(sideBarState);
  const [suitesOrder, setSuitesOrder] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('sideBarState', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    suites && setSuitesOrder(suites.map(({ key }) => key));
  }, [suites]);

  const dndSensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent): void => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = suitesOrder.indexOf(active.id);
        const newIndex = suitesOrder.indexOf(over.id);
        const newSuitesOrder = arrayMove(suitesOrder, oldIndex, newIndex);
        suites &&
          dispatch(changeAndSaveSuitesOrder(apiClient, suites, newSuitesOrder));
      }
    },
    [suites, suitesOrder]
  );

  if (!suites || suites.length === 0) {
    // No suites? Lets remove this sidebar until we add some.
    return null;
  }

  const renderApplicationItem = (item: ApplicationItem) => (
    <A
      href={item.url}
      key={item.key}
      target="_blank"
      onClick={() =>
        metrics.track('Application_Click', {
          key: item.key,
          application: item.title,
        })
      }
    >
      <ApplicationNavigationItem item={item} isOpen={isOpen} />
    </A>
  );

  const renderNavigationItems = (items: Suite[], admin: boolean) => {
    const handleSuiteItemClick = (item: Suite) => () =>
      metrics.track('Suite_Click', {
        suiteKey: item.key,
        suite: item.title,
      });

    if (admin) {
      return (
        <DndContext onDragEnd={handleDragEnd} sensors={dndSensors}>
          <SortableContext
            items={suitesOrder}
            strategy={verticalListSortingStrategy}
          >
            {items?.map((item) => (
              <SortableSuiteNavigationItem
                key={item.key}
                item={item}
                handleClick={handleSuiteItemClick(item)}
                isOpen={isOpen}
              />
            ))}
          </SortableContext>
        </DndContext>
      );
    }
    return items?.map((item) => (
      <NavLink
        to={`/suites/${item.key}`}
        key={item.key}
        onClick={handleSuiteItemClick(item)}
      >
        <SuiteNavigationItem dataItem={item} isOpen={isOpen} />
      </NavLink>
    ));
  };

  return (
    <SidebarContainer open={isOpen}>
      <CollapseButton
        className="collapse-button"
        open={isOpen}
        onClick={() => handleHideSidebar(isOpen, setOpen, metrics)}
        role="button"
      >
        <Icon
          type={isOpen ? 'ChevronLeftLarge' : 'ChevronRightLarge'}
          style={{ width: 12 }}
        />
      </CollapseButton>
      <ItemsContainer>
        <NavLink
          to="/explore"
          key="explorer"
          onClick={() => {
            metrics.track('Navigated to Explorer', {
              key: 'explorer',
              application: 'explorer',
            });
          }}
        >
          <ApplicationNavigationItem
            item={{
              iconKey: 'Cognite',
              key: 'Explorer',
              title: 'Explorer',
              url: '/explore',
            }}
            isOpen={isOpen}
          />
        </NavLink>
      </ItemsContainer>
      {!!applications.length && (
        <>
          <TitleContainer>
            <Overline level={2}>{isOpen ? 'Applications' : 'Apps'}</Overline>
          </TitleContainer>
          <ItemsContainer>
            {applications.map((item) => renderApplicationItem(item))}
          </ItemsContainer>
        </>
      )}
      <TitleContainer>
        <Overline level={2}>Suites</Overline>
      </TitleContainer>
      <ItemsContainer>{renderNavigationItems(suites, admin)}</ItemsContainer>
    </SidebarContainer>
  );
};

export default LeftSidebar;
