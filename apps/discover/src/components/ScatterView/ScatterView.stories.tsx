import { ScatterView } from './ScatterView';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / ScatterView',
  component: ScatterView,
};

const events = [
  { id: '1', name: 'CMS', color: '#d3d3', metadata: [] },
  { id: '2', name: 'CMS 2', color: '#d3d3', metadata: [] },
];

export const simple = () => (
  <div style={{ height: '75px', width: '150px', border: '1px solid grey' }}>
    <ScatterView events={events} />
  </div>
);
