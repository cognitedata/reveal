/**
 * Error Sidebar
 */

import { memo } from 'react';

import {
  Sidebar,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
  ContentOverflowWrapper,
  ContentContainer,
  LoadingRow,
} from '@charts-app/components/Common/SidebarElements';
import { StyleButton } from '@charts-app/components/StyleButton/StyleButton';
import { useTranslations } from '@charts-app/hooks/translations';
import { WorkflowState } from '@charts-app/models/calculation-results/types';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { v4 as uuidv4 } from 'uuid';

import { Button, Infobox, Tooltip } from '@cognite/cogs.js';

type Props = {
  visible: boolean;
  onClose: () => void;
  calculationResult: WorkflowState | undefined;
  workflowColor: string;
};

const defaultTranslation = makeDefaultTranslations(
  'Calculation status',
  "This is an empty calculation and it hasn't run yet.",
  'Info',
  'Error',
  'Warning',
  'Hide'
);

const ErrorSidebar = memo(
  ({ visible, onClose, calculationResult, workflowColor }: Props) => {
    const t = {
      ...defaultTranslation,
      ...useTranslations(Object.keys(defaultTranslation), 'ErrorSidebar').t,
    };

    return (
      <Sidebar visible={visible}>
        <TopContainer>
          <TopContainerTitle>
            <StyleButton
              icon="Function"
              styleColor={workflowColor}
              label="Workflow Function"
              style={{ marginRight: '0.5rem' }}
            />
            {t['Calculation status']}
          </TopContainerTitle>
          <TopContainerAside>
            <Tooltip content={t.Hide}>
              <Button
                icon="Close"
                type="ghost"
                onClick={onClose}
                aria-label="Close"
              />
            </Tooltip>
          </TopContainerAside>
        </TopContainer>
        <ContentOverflowWrapper>
          <ContentContainer>
            {calculationResult &&
              'status' in calculationResult &&
              calculationResult.loading && <LoadingRow />}
            {calculationResult && !calculationResult.loading ? (
              <>
                {!calculationResult.status && (
                  <Infobox title={t.Info} style={{ marginBottom: '1rem' }}>
                    {t["This is an empty calculation and it hasn't run yet."]}
                  </Infobox>
                )}
                {calculationResult.error && (
                  <Infobox
                    type="danger"
                    title={t.Error}
                    style={{ marginBottom: '1rem' }}
                  >
                    {calculationResult.error}
                  </Infobox>
                )}

                {calculationResult.warnings &&
                  calculationResult.warnings.map((warning) => (
                    <Infobox
                      type="warning"
                      title={t.Warning}
                      key={uuidv4()}
                      style={{ marginBottom: '1rem' }}
                    >
                      {warning}
                    </Infobox>
                  ))}
              </>
            ) : (
              ''
            )}
          </ContentContainer>
        </ContentOverflowWrapper>
      </Sidebar>
    );
  }
);

export default ErrorSidebar;
