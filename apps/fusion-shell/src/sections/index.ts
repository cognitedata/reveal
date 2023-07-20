import { useTranslation } from '../common/i18n';
import { Section } from '../types';

import { getAllAppsData } from './sections';

export const useSections = () => {
  const { t } = useTranslation();
  const { sectionsData } = getAllAppsData(t);

  const integrate = sectionsData.integrate;
  const contextualize = sectionsData.contextualize;
  const exploreAndBuild = sectionsData.explore;
  const manageAndConfigure = sectionsData.configure;

  const sections: Section[] = [
    integrate,
    contextualize,
    exploreAndBuild,
    manageAndConfigure,
  ];

  return {
    sections,
  };
};
