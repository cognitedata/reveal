import { useContext } from 'react';

import { RenderWhenOnScreen } from '@charts-app/components/RenderWhenOnScreen/RenderWhenOnScreen';
import {
  getTranslationsForComponent,
  makeDefaultTranslations,
  translationKeys,
} from '@charts-app/utils/translations';
import { Skeleton } from 'antd';

import {
  A,
  Detail,
  formatDate,
  formatDateTime,
  Title,
  Tooltip,
} from '@cognite/cogs.js';

import ChartListDropdown from '../ChartListDropdown/ChartListDropdown';
import { ChartListContext } from '../context';
import formatOwner from '../formatOwner';
import { ChartListProps } from '../types';

const defaultTranslations = makeDefaultTranslations(
  'Preview',
  'Name',
  'Owner',
  'Updated',
  'Actions',
  "Your search didn't return any results",
  'Create a new chart to get started',
  'You can also check out public charts in the left menu.',
  ...translationKeys(ChartListDropdown.defaultTranslations)
);

interface Props extends ChartListProps {
  translations?: typeof defaultTranslations;
}

function ChartListTable({
  loading,
  list,
  readOnly = false,
  onChartClick,
  onChartDeleteClick,
  onChartDuplicateClick,
  emptyState,
  translations,
}: Props) {
  /**
   * Use context to enable dependency injection / mocking (containers, hooks, etc..)
   */
  const { PreviewPlotContainer } = useContext(ChartListContext);

  const t = { ...defaultTranslations, ...translations };
  const LoadingRow = () => (
    <tr>
      <td>
        <Skeleton.Image style={{ height: 80, width: 86 }} />
      </td>
      <td>
        <Skeleton.Button size="small" active />
      </td>
      <td>
        <Skeleton.Button size="small" active />
      </td>
      <td>
        <Skeleton.Button size="small" active />
      </td>
      <td>
        <Skeleton.Button size="small" active />
      </td>
    </tr>
  );
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table
        className="cogs-table"
        style={{
          display: 'table',
          width: '100%',
          borderCollapse: 'collapse',
          borderSpacing: 0,
        }}
      >
        <thead>
          <tr>
            <th style={{ width: 120, minWidth: 120 }}>{t.Preview}</th>
            <th style={{ minWidth: 200 }}>{t.Name}</th>
            <th style={{ minWidth: 120 }}>{t.Owner}</th>
            <th style={{ width: 150, minWidth: 150 }}>{t.Updated}</th>
            <th style={{ width: 50, minWidth: 50 }}>{t.Actions}</th>
          </tr>
        </thead>
        <tbody>
          {!loading && list.length === 0 && (
            <tr>
              <td colSpan={5}>
                {emptyState || t["Your search didn't return any results"]}
              </td>
            </tr>
          )}
          {loading
            ? Array.from(Array(6).keys()).map((e) => <LoadingRow key={e} />)
            : list.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div
                      // todo(DEGR-2397) check accessibility with cogs team
                      onClick={() => onChartClick(row.id)}
                      style={{
                        height: 80,
                        border: '1px solid var(--cogs-greyscale-grey2)',
                      }}
                    >
                      <RenderWhenOnScreen
                        containerStyles={{
                          height: 80,
                          border: '1px solid var(--cogs-greyscale-grey2)',
                        }}
                        loaderComponent={
                          <Skeleton.Image style={{ height: 80, width: 86 }} />
                        }
                      >
                        <PreviewPlotContainer chart={row.firebaseChart} />
                      </RenderWhenOnScreen>
                    </div>
                  </td>
                  <td>
                    <A onClick={() => onChartClick(row.id)}>
                      <Title level={4}>{row.name}</Title>
                    </A>
                  </td>
                  <td style={{ textTransform: 'uppercase' }}>
                    <A onClick={() => onChartClick(row.id)}>
                      <Detail strong>{formatOwner(row.owner)}</Detail>
                    </A>
                  </td>
                  <td>
                    <Tooltip
                      content={formatDateTime(
                        new Date(row.updatedAt).getTime()
                      )}
                    >
                      <>{formatDate(new Date(row.updatedAt).getTime(), true)}</>
                    </Tooltip>
                  </td>
                  <td>
                    <ChartListDropdown
                      name={row.name}
                      readOnly={readOnly}
                      onDuplicateClick={() => onChartDuplicateClick(row.id)}
                      onDeleteClick={() => onChartDeleteClick(row.id)}
                      translations={getTranslationsForComponent(
                        t,
                        ChartListDropdown
                      )}
                    />
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

ChartListTable.defaultTranslations = defaultTranslations;
ChartListTable.translationKeys = translationKeys(defaultTranslations);
ChartListTable.translationNamespace = 'ChartListTable';

export default ChartListTable;
