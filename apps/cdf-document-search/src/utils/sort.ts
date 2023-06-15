export const sortByDate = <T extends { createdAt?: number }>(data?: T[]) => {
  return (data || []).sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));
};

export const sortByName = <T extends { name?: string }>(data?: T[]) => {
  return (data || []).sort((a, b) =>
    (a?.name || '').localeCompare(b?.name || '')
  );
};
