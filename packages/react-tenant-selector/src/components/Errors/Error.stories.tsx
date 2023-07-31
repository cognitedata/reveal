import Error from './Error';

export default {
  title: 'Errors/Error',
};

export const Base = () => (
  <Error>
    <div>Something is taking longer than usual. Please refresh the page.</div>
    <div>
      Contact <a href="mailto:support@cognite.com">support@cognite.com</a> if
      the problem persists.
    </div>
  </Error>
);
