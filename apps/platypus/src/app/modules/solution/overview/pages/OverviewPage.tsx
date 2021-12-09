import { useHistory } from 'react-router-dom';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import useSelector from '@platypus-app/hooks/useSelector';
import { SolutionState } from '@platypus-app/redux/reducers/global/solutionReducer';
import { SchemaVersionSelect } from '@platypus-app/modules/solution/components/SchemaVersionSelect/SchemaVersionSelect';
import { StyledVersionContainer } from './elements';

export const OverviewPage = () => {
  const history = useHistory();

  const { solution, selectedSchema, schemas } = useSelector<SolutionState>(
    (state) => state.solution
  );

  const { t } = useTranslation('SolutionOverview');

  const renderVersionSelect = () => {
    return (
      <StyledVersionContainer>
        <SchemaVersionSelect
          selectedVersion={selectedSchema?.version}
          versions={schemas.map((s) => s.version)}
          onChange={(seletedValue) => {
            history.replace(`/solutions/${solution?.id}/${seletedValue}`);
          }}
        />
      </StyledVersionContainer>
    );
  };

  const renderHeader = () => {
    return (
      <PageToolbar
        title={`${t('solution_overview_title', 'Overview')}`}
        behindTitle={schemas.length ? renderVersionSelect() : ''}
      />
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
        {selectedSchema ? (
          <div>Version {selectedSchema.version}</div>
        ) : (
          <div>No schema defined yet.</div>
        )}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
