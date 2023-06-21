export type TranslationKey = keyof typeof translationKeys;

export const translationKeys = {
	APP_DATA_OPS_SUBTITLE: "app-data-ops-subtitle",
	APP_DATA_OPS_TITLE: "app-data-ops-title",
	APP_INFIELD_SUBTITLE: "app-infield-subtitle",
	APP_INFIELD_TITLE: "app-infield-title",
	APP_INROBOT_SUBTITLE: "app-inrobot-subtitle",
	APP_INROBOT_TITLE: "app-inrobot-title",
	APP_MAINTAIN_SUBTITLE: "app-maintain-subtitle",
	APP_MAINTAIN_TITLE: "app-maintain-title",
	LABEL_CANVAS: "label-Canvas",
	LABEL_CHARTS: "label-Charts",
	LABEL_APPS: "label-apps",
	LABEL_EXPLORE: "label-explore",
	LABEL_LOGOUT: "label-logout"
} as const