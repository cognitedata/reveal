import { NotFound } from './elements';

const NotFoundPage = ({ message }: { message?: string }) => (
  <NotFound>
    <h3>404 Not Found</h3>
    <p>{message}</p>
  </NotFound>
);

export default NotFoundPage;
