import { useTranslations } from '../../hooks/translations';
import { makeDefaultTranslations } from '../../utils/translations';
import { NoAlerts } from '../Icons/NoAlerts';

import {
  EmptyStateButton,
  EmptyStateButtonIcon,
  EmptyStateHeader,
  EmptyStateText,
  EmptyStateContainer,
} from './elements';

const defaultTranslation = makeDefaultTranslations(
  'No alerts',
  'To create a new monitoring job or view existing jobs click on the button below',
  'Go to monitoring jobs'
);

type Props = {
  onViewMonitoringJobs: () => void;
};
const EmptyState = ({ onViewMonitoringJobs }: Props) => {
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'AlertingSidebar').t,
  };
  return (
    <>
      <EmptyStateContainer>
        <NoAlerts />
        <EmptyStateHeader>{t['No alerts']}</EmptyStateHeader>
        <EmptyStateText>
          {
            t[
              'To create a new monitoring job or view existing jobs click on the button below'
            ]
          }
        </EmptyStateText>
        <EmptyStateButton type="primary" onClick={onViewMonitoringJobs}>
          {t['Go to monitoring jobs']}
          <EmptyStateButtonIcon type="ArrowRight" />
        </EmptyStateButton>
      </EmptyStateContainer>
    </>
  );
};

export default EmptyState;
