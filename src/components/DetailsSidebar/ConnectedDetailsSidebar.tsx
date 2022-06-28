import { useState } from 'react';
import MetadataPanel from 'components/MetadataPanel/MetadataPanel';
import { useComponentTranslations } from 'hooks/translations';
import StatisticsPanel from 'components/StatisticsPanel/StatisticsPanel';
import { ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import useDetailsSidebar from 'models/charts/details-sidebar/hooks/useDetailsSidebar';
import DetailsSidebar from './DetailsSidebar';

type Props = {
  /** The source selected in the source table */
  source: ChartWorkflow | ChartTimeSeries;
  /** Action to execute when the close button is clicked */
  onClose: () => void;
};

export default function ConnectedDetailsSidebar({ source, onClose }: Props) {
  const [selectedMenu, setSelectedMenu] = useState<'statistics' | 'metadata'>(
    'statistics'
  );

  const sourceProp = useDetailsSidebar(source);

  const translations = {
    ...useComponentTranslations(DetailsSidebar),
    ...useComponentTranslations(MetadataPanel),
    ...useComponentTranslations(StatisticsPanel),
  };

  return (
    <DetailsSidebar
      onClose={onClose}
      selectedPanel={selectedMenu}
      onChangeSelectedPanel={setSelectedMenu}
      source={sourceProp}
      translations={translations}
    />
  );
}
