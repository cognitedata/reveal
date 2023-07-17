export const signoutClickEvent = 'SignoutClickEvent' as const;
export type SignoutClickEvent = typeof signoutClickEvent;

export const manageAccountClickEvent = 'ManageAccountClickEvent' as const;
export type ManageAccountClickEvent = typeof manageAccountClickEvent;

export const languageChangeEvent = 'LanguageChangeEvent' as const;
export type LanguageChangeEvent = typeof languageChangeEvent;

export const tabChangeEvent = 'TabChangeEvent' as const;
export type TabChangeEvent = typeof tabChangeEvent;

export type TrackEvent =
  | SignoutClickEvent
  | ManageAccountClickEvent
  | LanguageChangeEvent
  | TabChangeEvent;

export type OnTrackEvent = (
  eventName: TrackEvent,
  metaData?: Record<string, string | number | object | null>
) => void;
