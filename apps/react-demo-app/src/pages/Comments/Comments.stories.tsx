import { CommentsPage } from './Comments';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'CommentsPage',
};

export const Base = () => (
  <CommentsPage
    data={[
      {
        id: 1,
        rootId: 1,
        name: 'test',
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
      },
    ]}
  />
);
