import getCrossConnections from '../getCrossConnections';

interface Instance {
  id: string;
  text: string;
}

describe('getCrossConnections', () => {
  test('simple one-to-one connections', async () => {
    const pidInstances: Instance[] = [
      { id: 'pid-1', text: 'a' },
      { id: 'pid-2', text: 'b' },
    ];
    const isoInstances: Instance[] = [
      { id: 'iso-1', text: 'a' },
      { id: 'iso-2', text: 'b' },
    ];
    const crossConnections = getCrossConnections(
      pidInstances,
      isoInstances,
      (pid: Instance, iso: Instance) => pid.text === iso.text
    );

    expect(crossConnections.length).toBe(2);
  });

  test('many-to-one connections', async () => {
    const pidInstances: Instance[] = [
      { id: 'pid-1', text: 'a' },
      { id: 'pid-2', text: 'a' },
      { id: 'pid-3', text: 'a' },
      { id: 'pid-4', text: 'a' },
      { id: 'pid-5', text: 'b' },
    ];
    const isoInstances: Instance[] = [
      { id: 'iso-1', text: 'a' },
      { id: 'iso-2', text: 'b' },
    ];

    const crossConnectionsMax4 = getCrossConnections(
      pidInstances,
      isoInstances,
      (pid: Instance, iso: Instance) => pid.text === iso.text,
      4
    );
    expect(crossConnectionsMax4.length).toBe(5);

    const crossConnectionsMax3 = getCrossConnections(
      pidInstances,
      isoInstances,
      (pid: Instance, iso: Instance) => pid.text === iso.text,
      3
    );
    expect(crossConnectionsMax3.length).toBe(1);
  });
});
