const getKonvaSelectorSlugByExternalId = (externalId: string) => {
  return externalId.replaceAll('.', '-');
};

export default getKonvaSelectorSlugByExternalId;
