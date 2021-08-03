import React, {
  createRef,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  ForwardRefRenderFunction,
} from 'react';
import forEach from 'lodash/forEach';
import { GridStack, GridStackWidget } from 'gridstack';
import { TilesContainer } from 'styles/common';
import { Board, Suite } from 'store/suites/types';
import { GridLayout } from 'store/layout/types';
import { useMetrics } from '@cognite/metrics';
import { BoardMenu } from 'components/menus';
import { Tile } from 'components/tiles';
import { saveGridWidgetItems } from 'store/layout/thunks';
import { useDispatch } from 'react-redux';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { RootDispatcher } from 'store/types';
import * as Sentry from '@sentry/browser';

type Props = {
  suite: Suite;
  boards: Board[];
  layout: GridLayout;
  editingLayout: boolean;
};
export type GridCallbacks = {
  saveGrid: () => void;
};

const SuiteOverviewGrid: ForwardRefRenderFunction<GridCallbacks, Props> = (
  { suite, boards, layout, editingLayout },
  ref
) => {
  const gridRef = useRef<GridStack>();
  const tileRefs = useRef<any>({});
  const metrics = useMetrics('SuiteOverview');
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();

  const { color } = suite;
  forEach(layout, (_val, key) => {
    if (tileRefs && !tileRefs.current[key]) {
      tileRefs.current[key] = createRef();
    }
  });

  useEffect(() => {
    editingLayout ? gridRef.current?.enable() : gridRef.current?.disable();
  }, [editingLayout]);

  useEffect(() => {
    if (!layout) {
      return;
    }
    if (!gridRef.current) {
      try {
        gridRef.current = GridStack.init({
          column: 4,
          disableDrag: !editingLayout,
          disableResize: !editingLayout,
        });
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    }
    const grid = gridRef.current;
    if (!grid) {
      return;
    }

    grid.batchUpdate();
    grid.removeAll(false);
    forEach(layout, (_item, key) => {
      tileRefs.current[key]?.current &&
        grid.makeWidget(tileRefs.current[key].current);
    });
    grid.commit();
  });

  useImperativeHandle(ref, () => ({
    saveGrid() {
      if (!gridRef.current) {
        return;
      }
      const gridLayout = gridRef.current.save(false) as GridStackWidget[];
      dispatch(saveGridWidgetItems(apiClient, gridLayout));
    },
  }));

  return (
    <TilesContainer className="grid-stack">
      {boards?.map((board: Board) => (
        <div
          key={board.key}
          ref={tileRefs.current[board.key]}
          className="grid-stack-item"
          gs-w={layout[board.key]?.w}
          gs-h={layout[board.key]?.h}
          gs-x={layout[board.key]?.x}
          gs-y={layout[board.key]?.y}
          gs-id={board.key}
        >
          <div className="grid-stack-item-content">
            <a
              href={board.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                metrics.track('Board_Click', {
                  boardKey: board.key,
                  board: board.title,
                  suiteKey: suite.key,
                  suite: suite.title,
                })
              }
            >
              <Tile
                dataItem={board}
                color={color}
                view="board"
                menu={<BoardMenu suiteItem={suite} boardItem={board} />}
              />
            </a>
          </div>
        </div>
      ))}
    </TilesContainer>
  );
};

export default React.memo(forwardRef(SuiteOverviewGrid));
