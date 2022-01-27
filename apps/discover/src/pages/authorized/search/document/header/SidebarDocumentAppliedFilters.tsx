import {
  DocumentAppliedFilters,
  ClearAllScenarios,
} from './DocumentAppliedFilters';

export const SidebarDocumentAppliedFilters: React.FC = () => {
  return (
    <DocumentAppliedFilters
      showClearTag
      showClearTagForScenarios={ClearAllScenarios.FILTERS}
    />
  );
};
