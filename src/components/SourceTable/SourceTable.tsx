/**
 * Source Table
 */

import { Chart } from 'models/chart/types';
import SourceRows from 'pages/ChartView/SourceRows';
import { Modes } from 'pages/types';
import { ComponentProps } from 'react';
import { Table } from './elements';
import { SourceTableHeader } from './SourceTableHeader';

type Props = {
  mode: Modes;
  chart: Chart;
  setChart: any;
  provided?: any;
  headerTranslations: ComponentProps<typeof SourceTableHeader>['translations'];
  onShowHideButtonClick: ComponentProps<
    typeof SourceTableHeader
  >['onShowHideButtonClick'];
  isEveryRowHidden: boolean;
  selectedSourceId: ComponentProps<typeof SourceRows>['selectedSourceId'];
  openNodeEditor: ComponentProps<typeof SourceRows>['openNodeEditor'];
  onRowClick: ComponentProps<typeof SourceRows>['onRowClick'];
  onInfoClick: ComponentProps<typeof SourceRows>['onInfoClick'];
  onThresholdClick: ComponentProps<typeof SourceRows>['onThresholdClick'];
};

const SourceTable = ({
  mode,
  chart,
  setChart,
  provided,
  isEveryRowHidden,
  headerTranslations,
  selectedSourceId,
  openNodeEditor,
  onRowClick,
  onInfoClick,
  onThresholdClick,
  onShowHideButtonClick,
}: Props) => {
  return (
    <Table ref={provided?.innerRef || null}>
      <SourceTableHeader
        mode={mode}
        onShowHideButtonClick={onShowHideButtonClick}
        showHideIconState={!isEveryRowHidden}
        translations={headerTranslations}
      />
      <tbody>
        <SourceRows
          draggable
          chart={chart}
          updateChart={setChart}
          mode={mode}
          selectedSourceId={selectedSourceId}
          openNodeEditor={openNodeEditor}
          onRowClick={onRowClick}
          onInfoClick={onInfoClick}
          onThresholdClick={onThresholdClick}
        />
        {provided && provided.placeholder}
      </tbody>
    </Table>
  );
};

export default SourceTable;
