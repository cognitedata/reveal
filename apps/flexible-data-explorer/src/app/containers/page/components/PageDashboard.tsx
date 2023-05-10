import { PropsWithChildren } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../../components/buttons/Button';
import { useExpandedIdParams } from '../../../hooks/useParams';
import { Page } from '../Page';

export const PageDashboard: React.FC<
  PropsWithChildren<{ loading?: boolean }>
> = ({ children, loading }) => {
  const { dataType, externalId } = useParams();

  const [expandedId, setExpandedId] = useExpandedIdParams();
  const hasExpandedWidget = Boolean(expandedId);

  return (
    <Page>
      <Page.Header
        title={hasExpandedWidget ? expandedId : externalId}
        subtitle={hasExpandedWidget ? `${dataType} · ${externalId}` : dataType}
        loading={loading}
      >
        {hasExpandedWidget ? (
          <Button.ButtonEsc onCloseClick={() => setExpandedId(undefined)} />
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
