export const officeExplorerMock = {
  externalId: 'cog-office-explorer',
  name: 'Cognite Office Explorer',
  description: 'Cognite Office Explorer',
  metadata: {},
  createdTime: 1625702400000,
  versions: [
    {
      version: 1,
      createdTime: 1651346026630,
      bindings: [],
      dataModel: {
        graphqlRepresentation:
          'type Building @view {\n  name: String!\n  description: String\n  thumbnail: String\n}\n\ntype Room @view {\n  type: String!\n  name: String!\n  description: String\n  isBookable: Boolean\n  building: Building\n}\n\ntype Equipment @view {\n  type: String!\n  isBroken: Boolean\n  room: Room\n  person: Person\n}\n\n\ntype Team @view {\n  name: String\n}\n\ntype Person @view {\n  name: String\n  slackId: String\n  desk: Equipment\n  team: Team\n}\n',
        types: [],
      },
    },
  ],
  db: {
    Building: [
      {
        externalId: 'building_oslo_office',
        name: 'Office Oslo',
        description: 'Cognite - Oslo office',
        thumbnail: '',
      },
    ],
    Room: [
      {
        externalId: 'room_devx_office',
        type: 'Office',
        name: 'DevX',
        description: 'DevX Office',
        isBookable: false,
        building: { externalId: 'building_oslo_office' },
      },
      {
        externalId: 'room_hulk_meeting_room',
        type: 'Meeting Room',
        name: 'Hulk',
        description: 'Hulk Meeting Room',
        isBookable: true,
        building: { externalId: 'building_oslo_office' },
      },
      {
        externalId: 'room_cirlce_meeting_room',
        type: 'Meeting Room',
        name: 'Circle',
        description: 'Circle Meeting Room',
        isBookable: true,
        building: { externalId: 'building_oslo_office' },
      },
    ],
    Equipment: [
      {
        externalId: 'equipment_devx_tv',
        type: 'TV',
        isBroken: false,
        room: { externalId: 'room_devx_office' },
        person: { externalId: 'room_devx_office' },
      },
      {
        externalId: 'equipment_andreas_desk',
        type: 'Desk',
        isBroken: false,
        room: { externalId: 'room_devx_office' },
        person: { externalId: 'person_devx_andreas' },
      },
      {
        externalId: 'equipment_branko_desk',
        type: 'Desk',
        isBroken: false,
        room: { externalId: 'room_devx_office' },
        person: { externalId: 'person_devx_branko' },
      },
      {
        externalId: 'equipment_baiel_desk',
        type: 'Desk',
        isBroken: false,
        room: { externalId: 'room_devx_office' },
        person: { externalId: 'person_devx_baiel' },
      },
      {
        externalId: 'equipment_brian_desk',
        type: 'Desk',
        isBroken: false,
        room: { externalId: 'room_devx_office' },
        person: { externalId: 'person_devx_brian' },
      },
      {
        externalId: 'equipment_david_desk',
        type: 'Desk',
        isBroken: false,
        room: { externalId: 'room_devx_office' },
        person: { externalId: 'person_devx_david' },
      },
    ],
    Team: [
      {
        externalId: 'team_devx',
        name: 'DevX',
      },
      {
        externalId: 'team_schema',
        name: 'Schema team',
      },
    ],
    Person: [
      {
        externalId: 'person_devx_andreas',
        name: 'Andreas Skonberg',
        slackId: 'andreas.skonberg',
        desk: { externalId: 'equipment_andreas_desk' },
        team: { externalId: 'team_devx' },
      },
      {
        externalId: 'person_devx_branko',
        name: 'Branko Dimitrijoski',
        slackId: 'bdimitrijoski',
        desk: { externalId: 'equipment_branko_desk' },
        team: { externalId: 'team_devx' },
      },
      {
        externalId: 'person_devx_baiel',
        name: 'Baiel Rysbekov',
        slackId: 'baiel.rysbekov',
        desk: { externalId: 'equipment_baiel_desk' },
        team: { externalId: 'team_devx' },
      },
      {
        externalId: 'person_devx_brian',
        name: 'Brian Kuzma',
        slackId: 'brian.kuzma',
        desk: { externalId: 'equipment_brian_desk' },
        team: { externalId: 'team_devx' },
      },
      {
        externalId: 'person_devx_david',
        name: 'David Liu',
        slackId: 'david.liu',
        desk: { externalId: 'equipment_david_desk' },
        team: { externalId: 'team_devx' },
      },
    ],
  },
};
