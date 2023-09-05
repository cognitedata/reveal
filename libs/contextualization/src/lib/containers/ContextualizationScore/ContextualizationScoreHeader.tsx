import {
  DataModelTypeDefsField,
  DataModelVersion,
} from '@fusion/data-modeling';

import sdk from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';

import { ContextualizationScore } from '../../components/ContextualizationScore';
import { ContextualizationContext } from '../../hooks/data-model-version/useContextualizationContext';
import { useFlagContextualizationScoreHeader } from '../../hooks/flags';

export const ContextualizationScoreHeader = ({
  field,
  dataModelVersions,
}: {
  field: DataModelTypeDefsField;
  dataModelVersions: DataModelVersion[];
}) => {
  const isContextualizationScoreHeaderEnabled =
    useFlagContextualizationScoreHeader();

  if (!isContextualizationScoreHeaderEnabled) {
    return null;
  }
  return (
    <SDKProvider sdk={sdk}>
      <ContextualizationContext.Provider
        value={{ dataModelVersions: dataModelVersions }}
      >
        <ContextualizationScore
          headerName={field.name}
          dataModelType={field.type.name}
        />
      </ContextualizationContext.Provider>
    </SDKProvider>
  );
};
