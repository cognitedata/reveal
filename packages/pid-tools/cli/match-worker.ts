// eslint-disable-next-line no-restricted-globals

interface MatcherData {
  type: 'DocumentMatch';
}

interface MatcherMessage {
  data: MatcherData;
}

const ctx: Worker = globalThis as any;

ctx.addEventListener('message', (event: MatcherMessage) => {
  if (event.data.type === 'DocumentMatch') {
    // computeLines(event.data.graphs);
  }
});

export default null;
