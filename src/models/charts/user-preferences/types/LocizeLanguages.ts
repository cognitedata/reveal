export type LocizeLanguages = Record<
  string,
  {
    name: string;
    nativeName: string;
    isReferenceLanguage: boolean;
    translated: {
      latest: number;
    };
  }
>;
