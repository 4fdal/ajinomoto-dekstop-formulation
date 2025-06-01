import ContainerLayout from '~/components/ContainerLayout';

import { useUserDisplayStore } from '~/lib/store/store';
import { useEffect } from 'react';

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

export default function MasterProductLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { isExpandedSidebar, setIsShowVirtualKeyboard } =
    useUserDisplayStore((state) => state);

  useEffect(() => {
    if (location.pathname == '/masters') {
      navigate('/masters/master-product-data');
    }
  }, [location]);

  return (
    <ContainerLayout
      fallback={<h1>Something must be wrong</h1>}
      className="border pl-[80px] pt-[75px]"
    >
      <section className="flex w-full">
        {isExpandedSidebar && (
          <div
            className="w-1/4 bg-white"
            onClick={() => setIsShowVirtualKeyboard(false)}
          >
            <NavLink
              to="/masters/master-product-data"
              className={({ isActive, isPending }) =>
                isPending
                  ? 'pending'
                  : isActive
                    ? 'block w-full rounded-md bg-slate-100 px-5 py-4'
                    : 'block w-full bg-white px-5 py-4'
              }
            >
              Master Material
            </NavLink>
            <NavLink
              to="/masters/master-formulation-data"
              className={({ isActive, isPending }) =>
                isPending
                  ? 'pending'
                  : isActive
                    ? 'block w-full rounded-md bg-slate-100 px-5 py-4'
                    : 'block w-full bg-white px-5 py-4'
              }
            >
              Master Formulation
            </NavLink>
            <NavLink
              to="/masters/master-tolerance-grouping-data"
              className={({ isActive, isPending }) =>
                isPending
                  ? 'pending'
                  : isActive
                    ? 'block w-full rounded-md bg-slate-100 px-5 py-4'
                    : 'block w-full bg-white px-5 py-4'
              }
            >
              Master Tolerance Grouping
            </NavLink>
            <NavLink
              to="/masters/master-user-data"
              className={({ isActive, isPending }) =>
                isPending
                  ? 'pending'
                  : isActive
                    ? 'block w-full rounded-md bg-slate-100 px-5 py-4'
                    : 'block w-full bg-white px-5 py-4'
              }
            >
              Master User
            </NavLink>
          </div>
        )}

        <div className="w-full border pl-3">
          <Outlet />
        </div>
      </section>
    </ContainerLayout>
  );
}
