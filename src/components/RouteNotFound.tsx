import { useLocation, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-7xl font-semibold">404</h1>
      <h1 className="font-semibold">
        ({location.pathname}) Not found!
      </h1>
      <h1>
        The page you're looking for is not found.{' '}
        <span
          className="cursor-pointer text-blue-500 hover:underline"
          onClick={() => navigate(-1)}
        >
          back
        </span>
      </h1>
    </div>
  );
}
