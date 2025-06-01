import Layout from './Layout';

import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const GlobalError = ({ error }: { error: Error }) => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <img
        src="/assets/error-boundary.png"
        alt="Error Boundary Image"
        className="w-[300px]"
      />
      <h1 className="text-3xl font-semibold">
        Something went wrong
      </h1>
      <pre>{error.message}</pre>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-[100px]"
        >
          Back
        </Button>
        <Button
          className="w-[100px]"
          onClick={() => navigate(0)}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};

const ErrorBoundaryLayout = () => (
  <ErrorBoundary FallbackComponent={GlobalError}>
    <Layout>
      <Outlet />
    </Layout>
  </ErrorBoundary>
);

export default ErrorBoundaryLayout;
