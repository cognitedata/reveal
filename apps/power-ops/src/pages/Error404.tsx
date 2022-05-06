import { NotFound } from './elements';

export const NotFoundPage = ({ message }: { message?: string }) => (
  <NotFound>
    <h3>404 Not Found</h3>
    <p>{message}</p>
  </NotFound>
);
