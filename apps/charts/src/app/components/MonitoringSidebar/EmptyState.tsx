import { useTranslations } from '../../hooks/translations';
import { makeDefaultTranslations } from '../../utils/translations';
import { NotFound } from '../Icons/NotFound';

import {
  EmptyStateContainer,
  EmptyStateTitle,
  EmptyStateBody,
} from './elements';

const defaultTranslation = makeDefaultTranslations(
  'No results',
  'Please refine your search criteria and try again'
);

const EmptyState = () => {
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'MonitoringSidebar').t,
  };
  return (
    <EmptyStateContainer
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <NotFound />
      <EmptyStateTitle level={5}>{t['No results']}</EmptyStateTitle>
      <EmptyStateBody level={3}>
        {t['Please refine your search criteria and try again']}
      </EmptyStateBody>
    </EmptyStateContainer>
  );
};

export default EmptyState;
