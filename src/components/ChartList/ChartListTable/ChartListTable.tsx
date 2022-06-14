import { Skeleton } from 'antd';
import {
  getTranslationsFromComponent,
  makeDefaultTranslations,
  translationKeys,
} from 'utils/translations';
import {
  A,
  Detail,
  formatDate,
  formatDateTime,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import PlotlyChart from 'components/PlotlyChart/PlotlyChart';
import { ChartListProps } from '../types';
import ChartListDropdown from '../ChartListDropdown/ChartListDropdown';
import formatOwner from '../formatOwner';

const defaultTranslations = makeDefaultTranslations(
  'Preview',
  'Name',
  'Owner',
  'Updated',
  'Actions',
  "You search didn't return any results",
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
  translations,
}: Props) {
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
              <td colSpan={5} style={{ textAlign: 'center' }}>
                <Title level={4}>
                  {t["You search didn't return any results"]}
                </Title>
              </td>
            </tr>
          )}
          {loading
            ? Array.from(Array(6).keys()).map((e) => <LoadingRow key={e} />)
            : list.map((row) => (
                <tr key={row.id}>
                  <td>
                    <A onClick={() => onChartClick(row.id)}>
                      <div
                        style={{
                          height: 80,
                          border: '1px solid var(--cogs-greyscale-grey2)',
                        }}
                      >
                        {row.loadingPlot ? (
                          <Skeleton.Image style={{ height: 80, width: 86 }} />
                        ) : (
                          <PlotlyChart {...row.plotlyProps} />
                        )}
                      </div>
                    </A>
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
                      translations={getTranslationsFromComponent(
                        t,
                        ChartListDropdown.defaultTranslations
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
ChartListTable.translationNamespace = 'ChartListTable';

export default ChartListTable;
