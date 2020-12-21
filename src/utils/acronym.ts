const exclude = ['&', 'and'];

export const acronym = (title: string) =>
  title
    .trim()
    .split(' ')
    .filter((str) => str !== '' && !exclude.includes(str.toLowerCase()))
    .map((str) => [...str][0].toUpperCase()) // Codepoint-aware first character
    .slice(0, 2) // Limit the number of characters to include
    .join('') || '';
