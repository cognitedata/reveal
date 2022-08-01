export const data = {
  data: {
    rooms: {
      items: [
        {
          externalId: 'room-1',
          name: 'Mario',
          nodeId: 3245,
          description: "It's a me, Mario",
          isBookable: true,
          type: 'meeting-room',
          equipment: [
            // This should be a property in the actual API but arrays of direct relations are not supported yet (Aug. 1st 2022)
            {
              externalId: 'equip-4',
              nodeId: 1444,
              type: 'TV',
              isBroken: true,
            },
            {
              externalId: 'equip-5',
              nodeId: 1654,
              type: 'Whiteboard',
              isBroken: false,
            },
          ],
        },
        {
          externalId: 'room-2',
          name: '5th Floor Restroom',
          nodeId: 3345,
          description: 'The Restroom. What more shall I say?',
          isBookable: false,
          type: 'rest-room',
          equipment: [
            {
              externalId: 'equip-6',
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
          externalId: 'id1',
          name: 'Potato',
          slackId: 'potato.slack',
          desk: {
            externalId: 'equip-1',
            nodeId: 2345,
            isBroken: false,
          },
        },
        {
          externalId: 'id2',
          name: 'Cake',
          slackId: 'cake.slack',
          desk: {
            externalId: 'equip-2',
            nodeId: 2334,
            isBroken: false,
          },
        },
        {
          externalId: 'id3',
          name: 'Sweet Potato',
          slackId: 'spotato.slack',
          desk: {
            externalId: 'equip-3',
            nodeId: 2324,
            isBroken: false,
          },
        },
      ],
    },
  },
};
