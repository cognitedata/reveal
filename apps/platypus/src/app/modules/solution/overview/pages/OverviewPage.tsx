import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Solution, SolutionSchema } from '@platypus/platypus-core';

export const OverviewPage = ({
  solution,
  schema,
}: {
  solution?: Solution;
  schema: SolutionSchema;
}) => {
  const { t } = useTranslation('SolutionMonitoring');

  const renderHeader = () => {
    return (
      <PageToolbar title={`${t('solution_overview_title', 'Overview')} `} />
    );
  };

  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        OVERVIEW (WIP...)
        <br />
        <br />
        <strong>{solution?.name}</strong>
        Version: {schema?.version || 'No schema defined yet'}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
