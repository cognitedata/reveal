export const getHighestConfidenceIndex = (
  arrOfObj: { confidence: number }[]
) => {
  const arrConf = arrOfObj.map((o) => o.confidence);
  const maxInd = arrConf.indexOf(Math.max(...arrConf));

  return maxInd;
};

export const extractData = (data: {
  entities: any;
  intents: object[];
  text: string;
  traits: object;
}) => {
  return {
    text: data.text,
    entity:
      data.entities['tag:tag'][
        getHighestConfidenceIndex(
          data.entities['tag:tag'] as { confidence: number }[]
        )
      ],
  };
};
