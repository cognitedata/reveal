import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const PopulationPage = () => {
  const { t } = useTranslation('SolutionPopulation');

  const renderHeader = () => {
    return (
      <PageToolbar title={t('population_title', 'Population pipelines')} />
    );
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        POPULATION PIPELINES (WIP...)
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
