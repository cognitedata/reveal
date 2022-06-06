export const data = {
  data: {
    rooms: {
      items: [
        {
          id: 'room-1',
          name: 'Mario',
          nodeId: 3245,
          description: "It's a me, Mario",
          isBookable: true,
          type: 'meeting-room',
          equipment: [
            {
              id: 'equip-4',
              nodeId: 1444,
              type: 'TV',
              isBroken: true,
            },
            {
              id: 'equip-5',
              nodeId: 1654,
              type: 'Whiteboard',
              isBroken: false,
            },
          ],
        },
        {
          id: 'room-2',
          name: '5th Floor Restroom',
          nodeId: 3345,
          description: 'The Restroom. What more shall I say?',
          isBookable: false,
          type: 'rest-room',

          equipment: [
            {
              id: 'equip-6',
              nodeId: 1354,
              type: 'TV',
              isBroken: false,
            },
          ],
        },
      ],
    },
    people: {
      items: [
        {
          id: 'id1',
          name: 'Potato',
          slackId: 'potato.slack',
          desk: {
            id: 'equip-1',
            nodeId: 2345,
            type: 'Desk',
            isBroken: false,
          },
        },
        {
          id: 'id2',
          name: 'Cake',
          slackId: 'cake.slack',
          desk: {
            id: 'equip-2',
            nodeId: 2334,
            type: 'Desk',
            isBroken: false,
          },
        },
        {
          id: 'id3',
          name: 'Sweet Potato',
          slackId: 'spotato.slack',
          desk: {
            id: 'equip-3',
            nodeId: 2324,
            type: 'Desk',
            isBroken: false,
          },
        },
      ],
    },
  },
};
