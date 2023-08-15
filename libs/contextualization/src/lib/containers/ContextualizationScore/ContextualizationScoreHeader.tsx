import { DataModelVersion } from '@fusion/data-modeling';

import { ContextualizationScore } from '../../components/ContextualizationScore';
import { ContextualizationContext } from '../../hooks/data-model-version/useContextualizationContext';
import { useFlagContextualizationScoreHeader } from '../../hooks/flags';

export const ContextualizationScoreHeader = ({
  dataModelVersions,
  ...props
}: {
  headerName: string;
  dataModelType: string;
  dataModelVersions: DataModelVersion[];
}) => {
  const isContextualizationScoreHeaderEnabled =
    useFlagContextualizationScoreHeader();

  if (!isContextualizationScoreHeaderEnabled) {
    return null;
  }
  return (
    <ContextualizationContext.Provider
      value={{ dataModelVersions: dataModelVersions }}
    >
      <ContextualizationScore {...props} />
    </ContextualizationContext.Provider>
  );
};
