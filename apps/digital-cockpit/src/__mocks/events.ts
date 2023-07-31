import { CogniteEvent } from '@cognite/sdk';

const randomId = () => Math.round(Math.random() * 10000000);

export class MockEvents {
  static single = (overwrites?: Partial<CogniteEvent>): CogniteEvent => {
    const id = randomId();
    return {
      id,
      description: `myEvent_${id}`,
      type: 'Type',
      subtype: 'Subtype',
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
      startTime: new Date(),
      endTime: id % 2 === 0 ? new Date() : undefined,
      ...overwrites,
    };
  };

  static multiple = (
    amount = 10,
    overwrites: Partial<CogniteEvent>[] = []
  ): CogniteEvent[] => {
    const result = [];
    for (let i = 0; i < amount; i++) {
      result.push(this.single(overwrites[i]));
    }
    return result;
  };
}
