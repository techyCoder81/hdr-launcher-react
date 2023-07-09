import { Link, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error: any = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1 style={{ color: 'white' }}>Oops!</h1>
      <p style={{ color: 'white' }}>Sorry, an unexpected error has occurred.</p>
      <p>
        <i style={{ color: 'white' }}>{error.statusText || error.message}</i>
      </p>
      <Link to="/">Go Back.</Link>
    </div>
  );
}
