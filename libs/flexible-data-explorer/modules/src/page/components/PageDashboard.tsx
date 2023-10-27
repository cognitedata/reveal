import { PropsWithChildren, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '@fdx/components';
import { useExpandedIdParams } from '@fdx/shared/hooks/useParams';
import capitalize from 'lodash/capitalize';

import { Page } from '../Page';

interface Props {
  loading?: boolean;
  /** Specify the data type (used for timeseries and files for now). Will be removed when those are in FDM */
  dataType?: string;
  name?: string;
  description?: string;
  renderActions?: () => [JSX.Element, ...JSX.Element[]];
}

export const PageDashboard: React.FC<PropsWithChildren<Props>> = ({
  children,
  loading,
  dataType,
  name,
  description,
  renderActions,
}) => {
  const { externalId } = useParams();

  const customName = name || externalId;

  const [expandedId, setExpandedId] = useExpandedIdParams();
  const hasExpandedWidget = Boolean(expandedId);

  const handleCloseClick = useCallback(() => {
    setExpandedId(undefined);
  }, [setExpandedId]);

  return (
    <Page>
      <Page.Header
        header={hasExpandedWidget ? undefined : dataType}
        title={hasExpandedWidget ? capitalize(expandedId) : customName}
        subtitle={
          hasExpandedWidget
            ? `${customName} ${description ? '•' : ''} ${description || ''}`
            : description
        }
        loading={loading}
      >
        {hasExpandedWidget ? (
          <Button.ButtonEsc onCloseClick={handleCloseClick} />
        ) : (
          renderActions?.().map((Action, index) => {
            return <div key={`actions-${index}`}>{Action}</div>;
          })
        )}
      </Page.Header>

      {children}
    </Page>
  );
};
