export type embeddingResponse = {
  items: [
    {
      text: string;
      values: number[];
    }
  ];
};

export type embeddingResponseAda = {
  model: string;
  data: [
    {
      embedding: number[];
      index: number;
    }
  ];
};

export type queryResponse = {
  namespace: string;
  items: [
    {
      id: string;
      text: string;
      metadata: {
        fileId: string;
        namespace: string;
        page: string;
        source: string;
        text: string;
      };
      values: number[];
      score: number;
    }
  ];
};

export type sourceResponse = {
  fileId: string;
  source: string;
  page: string;
  text: string;
  index: number;
};

export type translationResponse = {
  language: string;
  translation: string;
};
