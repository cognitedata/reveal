import Config from 'models/charts/config/classes/Config';
import { makeDefaultTranslations } from 'utils/translations';

const layoutOptionsTranslations = makeDefaultTranslations('Grid', 'List');

export default class UserPreferences {
  static get startPageLayout() {
    return Config.lsGet('startPageLayout', 'list');
  }

  static set startPageLayout(value: 'list' | 'grid') {
    Config.lsSave('startPageLayout', value);
  }

  static startPageLayoutOptions(translations = layoutOptionsTranslations) {
    return [
      { label: translations.List, value: 'list' as const },
      { label: translations.Grid, value: 'grid' as const },
    ];
  }

  static startPageLayoutOption(translations = layoutOptionsTranslations) {
    return (
      UserPreferences.startPageLayoutOptions(translations).find(
        (o) => o.value === UserPreferences.startPageLayout
      ) ?? UserPreferences.startPageLayoutOptions()[0]
    );
  }
}
