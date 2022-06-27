import { Flex } from '@cognite/cogs.js';
import { KBarResults, useMatches, ActionId, ActionImpl } from 'kbar';
import React from 'react';

import { GroupName, ResultItemWrapper, StyledKDB } from './elements';

interface ResultItemParam {
  action: ActionImpl;
  active: boolean;
  currentRootActionId: ActionId;
}

const ResultItem = React.forwardRef(
  (
    { action, active, currentRootActionId }: ResultItemParam,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const ancestors = React.useMemo(() => {
      if (!currentRootActionId) return action.ancestors;
      const index = action.ancestors.findIndex(
        (ancestor) => ancestor.id === currentRootActionId
      );
      // +1 removes the currentRootAction; e.g.
      // if we are on the "Set theme" parent action,
      // the UI should not display "Set theme… > Dark"
      // but rather just "Dark"
      return action.ancestors.slice(index + 1);
    }, [action.ancestors, currentRootActionId]);

    return (
      <ResultItemWrapper active={active} ref={ref}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            fontSize: 14,
          }}
        >
          {action.icon && action.icon}
          <Flex direction="column">
            <div>
              {ancestors.length > 0 &&
                ancestors.map((ancestor) => (
                  <React.Fragment key={ancestor.id}>
                    <span
                      style={{
                        opacity: 0.5,
                        marginRight: 8,
                      }}
                    >
                      {ancestor.name}
                    </span>
                    <span
                      style={{
                        marginRight: 8,
                      }}
                    >
                      &rsaquo;
                    </span>
                  </React.Fragment>
                ))}
              <span>{action.name}</span>
            </div>
            {action.subtitle && (
              <span style={{ fontSize: 12 }}>{action.subtitle}</span>
            )}
          </Flex>
        </div>
        {action.shortcut?.length ? (
          <div
            aria-hidden
            style={{ display: 'grid', gridAutoFlow: 'column', gap: '4px' }}
          >
            {action.shortcut.map((sc) => (
              <StyledKDB key={sc}>{sc}</StyledKDB>
            ))}
          </div>
        ) : null}
      </ResultItemWrapper>
    );
  }
);

const handleLabel = ({ item, active, rootActionId }: any) =>
  typeof item === 'string' ? (
    <GroupName>{item}</GroupName>
  ) : (
    <ResultItem
      action={item as ActionImpl}
      active={active as boolean}
      currentRootActionId={rootActionId as string}
    />
  );

export const RenderResults = () => {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={(rest) => handleLabel({ ...rest, rootActionId })}
    />
  );
};
