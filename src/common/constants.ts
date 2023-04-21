export const CATEGORY_SEARCH_PARAM_KEY = 'category';

import { ExtractorWithReleases } from 'service/extractors';

export const MQTT_EXTRACTOR_MOCK: ExtractorWithReleases = {
  category: 'hosted-extractor',
  externalId: 'cognite-mqtt-extractor',
  name: 'MQTT Extractor',
  imageUrl:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFcAAAAYCAYAAACPxmHVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVsSURBVHgB7VlPaBNZHP6SdkV72SxeLRsR1FsjHqSysKm9KrYXLx6SslrtqQl6UqQJeBKl6aVpbKHJoRdZaIsV3ENtRBYXpWz2qOJuFj3sobLxYFYoNfv7HnnD6+s0Myk2hdIPpjP5vd97M++bb773p8Aetg2BBBKhz/gccivM1rIbYo/TjzGfml8Xm8BEGXvYgMAVXFmqoRZ1KzwYPoizqbM4HTvtxD6UP+BB8gFKcyUzNX0f91P6xyVcSgQRHDbK81Kehg/I80xbz5OUunN23mVcjss9Yl/wJRJAQIlD6lUkVpJYoQ1tRfOlS35G8s6jCUg7Y1OYytQ5CqM5JNu7f+oO1dZqirT3pfeoVqpOKWOFeAELqQVcW7qmyOYxNDukYg/TD1WePPT3ZqvSQXY2bIRSV3G14KVwyYlKh+JmTDq17qsSkkjmLNuXMt7bKSPJfDFyZjvlQQyOyYvJ6DLrmTxR7wfqxIabqcvnbo9NxSpmkAS/Kr7C4tiiIpfg+cbhG0rF50bOqRivCU2wj5uNyGmgUY4QMt2oXMjqk9Ms/CEsx6jU+dbvV/O10W4HDkUOqaM30Yvn+eeKPE0y1UryY9MxdIQ6FMHVj1U8yTzxug/JjYsy05upl585GqhD6obXsDZtKbUs7Y7RCuohqjlm2UpqCENlyc3Iy8ubbcrvJeMnLaXfum2ZfyQ+YNWLyGnUCD2VnJSZsx/7S+13frgTavumTRHaGenEsR+PqU+f6I53o6uvCwvpBSxmFlWMXrtSXlE2QYIvjF7A6n+ryOVy8EIj9UrnR7zqam+tY+4ADgxkkKlYqXlRa0rOTnvyUjId6Dhs50qe+bMiL74IF9hxedEk2Hz2v9zqBt/++jb0uvhaqY/+ys8/25/Fyp8r6kE0gTw0qF4OahoXJy6iAZwO1dUbthP8qJZ1zTZFKUkXYhU4uEqHi0YoVEU1jhYj6BakOm8euRnKD+SdAY42EZ+OOzm0DPqyD1TMjtbVuw6mauU6b5eL8qJW/pzX4Ch15q06XWgxgrlarnzr91tqBkAb0JZAkMDbJ247nstyPaAR9GBd1gjSMWdAsdVrq9bMNRAxf0gbf8AD+7CvaNWJosVQyqXfRvoiSpn0UpNAknev555DIgexo9Gj6pqqprq9QD+y1OsMBrZq3RRpea2az8ID4omeOduN4Junb0DP1dALB6pZq5jEjvePOzl8CfRignWfTT7zvJGl3j7OaX2qdkvQc1QDLSc7eDd6N0xlJr9LKhVqhVLNekZAcBDTc1qSfiZxxmlkZnDG80Yu6o35US0hKly3HBTiIvDAKlbX5Uj7f6PFcAY0fuL0WBJNIgmSyDmtBmcUzgA33ItmYXsvfKrWxT9j3BNBA8gLOG/dew4txobZgvZYTTC92PRYPUOgonXcL2z1ajRSLTGO8ZLL1GrTebHYzTCtx2i/LKciWgzXqRhJND3WHOCobg0S3yzcFOrHa11yEtzkoXdTxTx4LQuDUa7GzEQhurATO3fBzQqo4OWfl9UgQIVq72WcKzSis6sTzcJFvWk/Ha+vgJJmjNbCJayo+F8e9eVswqpaMHfsWolgo8IXMy8cX+MyWMP05K0gh1yPeGKPkHOimY5zh4vr/Ppn7gclqRPHDiHY6EHfld4511q5BDdrCIPcj2gSVOIkJktbqJeXZ+6RS9qEV/2I2MQIdgiB+mop7FZ4JHoE15euq2tu3jxKPVLXw0vDOB49rq6HAkNqB2izdf52g177CZ/Csjmu7l/fsbK3JZN6X7eVCGAXQtRK3zW3BCHkx7PIFtBCtGEXYhnLv53ESQonqmPcWziFU7+8xMt/0CLsSuVquP3zde+fqbsE/wM/jHA6jvfHqQAAAABJRU5ErkJggg==',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  documentation:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  type: 'global',
  latestVersion: '',
  tags: ['MQTT', 'Topic', 'Cognite Extractor', 'ODBC'],
  links: [
    {
      name: 'Cognite Docs',
      type: 'generic',
      url: 'https://docs.cognite.com/',
    },
    {
      name: 'GitHub',
      type: 'generic',
      url: 'https://docs.cognite.com/',
    },
  ],
  releases: [],
};
