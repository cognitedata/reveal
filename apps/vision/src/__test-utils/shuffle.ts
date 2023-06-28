// return shuffled array with all the elements
export const shuffle = (arr: never[]) => arr.sort(() => Math.random() - 0.5);
