/**
 * SourceTable Header
 */

import { MouseEventHandler } from 'react';

import { ShowHideButton } from '@charts-app/components/ShowHideButton/ShowHideButton';
import { Modes } from '@charts-app/pages/types';
import { makeDefaultTranslations } from '@charts-app/utils/translations';

import { SourceItem, SourceName } from './elements';

interface Props {
  mode: Modes;
  onShowHideButtonClick?: MouseEventHandler<HTMLDivElement>;
  showHideIconState?: boolean;
  translations?: typeof defaultTranslation;
}

const defaultTranslation = makeDefaultTranslations(
  'Style',
  'Name',
  'Status',
  'Tag',
  'Description',
  'Min',
  'Max',
  'Mean',
  'Unit',
  'P&IDs',
  'Remove',
  'Info',
  'More'
);

const SourceTableHeader = ({
  mode,
  onShowHideButtonClick = () => {},
  showHideIconState = false,
  translations,
}: Props) => {
  const t = { ...defaultTranslation, ...translations };

  return (
    <thead>
      <tr>
        <th
          style={{ width: 50, minWidth: 50, paddingLeft: 0 }}
          className="downloadChartHide"
        >
          <SourceItem style={{ justifyContent: 'center' }}>
            <SourceName>{t.Style}</SourceName>
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
              {t.Name}
            </SourceName>
          </SourceItem>
        </th>
        {mode !== 'editor' && (
          <>
            <th style={{ width: 64 }} className="bordered col-status">
              <SourceItem center>
                <SourceName>{t.Status}</SourceName>
              </SourceItem>
            </th>
            <th style={{ width: 210 }} className="bordered">
              <SourceItem>
                <SourceName>{t.Tag}</SourceName>
              </SourceItem>
            </th>
            <th style={{ width: 250 }} className="bordered">
              <SourceItem>
                <SourceName>{t.Description}</SourceName>
              </SourceItem>
            </th>
          </>
        )}
        {mode === 'workspace' && (
          <>
            <th style={{ width: 60 }} className="bordered">
              <SourceItem>
                <SourceName>{t.Min}</SourceName>
              </SourceItem>
            </th>
            <th style={{ width: 60 }} className="bordered">
              <SourceItem>
                <SourceName>{t.Max}</SourceName>
              </SourceItem>
            </th>
            <th style={{ width: 60 }} className="bordered">
              <SourceItem>
                <SourceName>{t.Mean}</SourceName>
              </SourceItem>
            </th>
            <th style={{ width: 180, paddingRight: 8 }}>
              <SourceItem>
                <SourceName>{t.Unit}</SourceName>
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
                <SourceName>{t['P&IDs']}</SourceName>
              </SourceItem>
            </th>
            <th
              style={{ width: 50, paddingLeft: 0 }}
              className="downloadChartHide"
            >
              <SourceItem style={{ justifyContent: 'center' }}>
                <SourceName>{t.Remove}</SourceName>
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
                <SourceName>{t.Info}</SourceName>
              </SourceItem>
            </th>
            <th
              style={{ width: 50, paddingLeft: 0 }}
              className="downloadChartHide"
            >
              <SourceItem style={{ justifyContent: 'center' }}>
                <SourceName>{t.More}</SourceName>
              </SourceItem>
            </th>
          </>
        )}
      </tr>
    </thead>
  );
};

SourceTableHeader.translationKeys = Object.keys(defaultTranslation);
export { SourceTableHeader };
