interface Settings {
  /** toggle between wide and narrow (compact) view mode for the page content/body */
  compact?: boolean;
}

/**
 * TODO: These settings are to be stored in local storage (and not in DB and/or URL)
 */
export const useUserSettings = (): Settings => {
  return {
    compact: true,
  };
};
