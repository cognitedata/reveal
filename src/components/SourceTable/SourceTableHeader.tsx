/**
 * SourceTable Header
 */

import { ShowHideButton } from 'components/ShowHideButton/ShowHideButton';
import { SourceItem, SourceName } from 'pages/ChartView/elements';
import { Modes } from 'pages/types';
import { MouseEventHandler } from 'react';

export interface SourceTableHeaderProps {
  mode: Modes;
  onShowHideButtonClick?: MouseEventHandler<HTMLDivElement>;
  showHideIconState?: boolean;
}

export const SourceTableHeader = ({
  mode,
  onShowHideButtonClick = () => {},
  showHideIconState = false,
}: SourceTableHeaderProps) => {
  return (
    <thead>
      <tr>
        <th
          style={{ width: 50, minWidth: 50, paddingLeft: 0 }}
          className="downloadChartHide"
        >
          <SourceItem style={{ justifyContent: 'center' }}>
            <SourceName>Style</SourceName>
          </SourceItem>
        </th>
        <th>
          <SourceItem>
            <SourceName>
              {mode !== 'file' && (
                <ShowHideButton
                  enabled={showHideIconState}
                  onClick={onShowHideButtonClick}
                />
              )}
              Name
            </SourceName>
          </SourceItem>
        </th>
        {mode !== 'editor' && (
          <>
            <th style={{ width: 210 }} className="bordered">
              <SourceItem>
                <SourceName>Tag</SourceName>
              </SourceItem>
            </th>
            <th style={{ width: 250 }} className="bordered">
              <SourceItem>
                <SourceName>Description</SourceName>
              </SourceItem>
            </th>
          </>
        )}
        {mode === 'workspace' && (
          <>
            <th style={{ width: 60 }} className="bordered">
              <SourceItem>
                <SourceName>Min</SourceName>
              </SourceItem>
            </th>
            <th style={{ width: 60 }} className="bordered">
              <SourceItem>
                <SourceName>Max</SourceName>
              </SourceItem>
            </th>
            <th style={{ width: 60 }} className="bordered">
              <SourceItem>
                <SourceName>Mean</SourceName>
              </SourceItem>
            </th>
            <th style={{ width: 180, paddingRight: 8 }}>
              <SourceItem>
                <SourceName>Unit</SourceName>
              </SourceItem>
            </th>
          </>
        )}
        {mode !== 'editor' && (
          <>
            <th
              style={{ width: 50, paddingLeft: 0 }}
              className="downloadChartHide"
            >
              <SourceItem style={{ justifyContent: 'center' }}>
                <SourceName>P&amp;IDs</SourceName>
              </SourceItem>
            </th>
            <th
              style={{ width: 50, paddingLeft: 0 }}
              className="downloadChartHide"
            >
              <SourceItem style={{ justifyContent: 'center' }}>
                <SourceName>Remove</SourceName>
              </SourceItem>
            </th>
          </>
        )}
        {mode === 'workspace' && (
          <>
            <th
              style={{ width: 50, paddingLeft: 0 }}
              className="downloadChartHide"
            >
              <SourceItem style={{ justifyContent: 'center' }}>
                <SourceName>Info</SourceName>
              </SourceItem>
            </th>
            <th
              style={{ width: 50, paddingLeft: 0 }}
              className="downloadChartHide"
            >
              <SourceItem style={{ justifyContent: 'center' }}>
                <SourceName>More</SourceName>
              </SourceItem>
            </th>
          </>
        )}
      </tr>
    </thead>
  );
};
