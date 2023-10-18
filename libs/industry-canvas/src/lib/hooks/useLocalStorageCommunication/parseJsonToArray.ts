const parseJsonToArray = <T>(json: string | null): T[] => {
  try {
    return JSON.parse(json || '[]');
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default parseJsonToArray;
