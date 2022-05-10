import { Treemap, TreeMapData } from './Treemap';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / Treemap',
  component: Treemap,
};
const basicData: TreeMapData = {
  title: 'Celtics',
  children: [
    {
      title: 'Guards',

      children: [
        {
          title: 'Kemba Walker',
          description: 'Something',
          value: 7,
        },
        {
          title: 'Marcus Smart',
          description: 'Something2',
          value: 6,
        },
        {
          title: 'Brad Wanamaker',
          description: 'Something3',
          value: 5,
        },
        {
          title: 'Tremont Waters',
          value: 4,
        },
        {
          title: 'Carsen Edwards',
          value: 3,
        },
        {
          title: 'Romeo Langford',
          value: 1,
        },
      ],
    },
  ],
};

const nestedData: TreeMapData = {
  title: 'Celtics',
  children: [
    {
      title: 'Guards',

      children: [
        {
          title: 'Kemba Walker',
          description: 'Something',
          value: 7,
        },
        {
          title: 'Marcus Smart',
          description: 'Something2',
          value: 6,
        },
        {
          title: 'Brad Wanamaker',
          description: 'Something3',
          value: 5,
        },
        {
          title: 'Tremont Waters',
          value: 4,
        },
        {
          title: 'Carsen Edwards',
          value: 3,
        },
        {
          title: 'Romeo Langford',
          value: 1,
        },
      ],
    },
    {
      title: 'Forwards',
      children: [
        {
          description: 'Forwards',
          title: 'Jayson Tatum',
          value: 23.4,
        },
        {
          description: 'Forwards',
          title: 'Jaylen Brown',
          value: 20.3,
        },
        {
          description: 'Forwards',
          title: 'Gordon Hayward',
          value: 17.5,
        },
        {
          description: 'Forwards',
          title: 'Grant Williams',
          value: 3.4,
        },
        {
          description: 'Forwards',
          title: 'Javonte Green',
          value: 3.4,
        },
        {
          description: 'Forwards',
          title: 'Semi Ojeleye',
          value: 3.4,
        },
        {
          description: 'Forwards',
          title: 'Vincent Poirier',
          value: 1.9,
        },
      ],
    },
    {
      title: 'Centers',
      children: [
        {
          description: 'Centers',
          title: 'Daniel Theis',
          value: 9.2,
        },
        {
          description: 'Centers',

          title: 'Enes Kanter',
          value: 8.1,
        },

        { description: 'Centers', title: 'Robert Williams III', value: 5.2 },
        {
          description: 'Centers',
          title: 'Tacko Fall',
          value: 3.3,
        },
      ],
    },
  ],
};

export const basic = () => {
  return (
    <div style={{ height: '600px' }}>
      <Treemap data={basicData} onTileClicked={(data) => console.log(data)} />
    </div>
  );
};

export const Nested = () => {
  return (
    <div style={{ height: '600px' }}>
      <Treemap data={nestedData} onTileClicked={(data) => console.log(data)} />
    </div>
  );
};
