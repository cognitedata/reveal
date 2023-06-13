import { PropsWithChildren, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '../../../components/buttons/Button';
import { useExpandedIdParams } from '../../../hooks/useParams';
import { Page } from '../Page';

interface Props {
  loading?: boolean;
  /** Specify the data type (used for timeseries and files for now). Will be removed when those are in FDM */
  customDataType?: string;
  customName?: string;
}

export const PageDashboard: React.FC<PropsWithChildren<Props>> = ({
  children,
  loading,
  customDataType,
  customName,
}) => {
  const { dataType, externalId } = useParams();

  const name = customName || externalId;
  const type = customDataType || dataType;

  const [expandedId, setExpandedId] = useExpandedIdParams();
  const hasExpandedWidget = Boolean(expandedId);

  const handleCloseClick = useCallback(() => {
    setExpandedId(undefined);
  }, [setExpandedId]);

  return (
    <Page>
      <Page.Header
        title={hasExpandedWidget ? expandedId : name}
        subtitle={hasExpandedWidget ? `${type} · ${name}` : type}
        loading={loading}
      >
        {hasExpandedWidget ? (
          <Button.ButtonEsc onCloseClick={handleCloseClick} />
        ) : (
          <>
            <Button.OpenIn />
            {/* <Button.Favorite /> */}
          </>
        )}
      </Page.Header>

      {children}
    </Page>
  );
};
