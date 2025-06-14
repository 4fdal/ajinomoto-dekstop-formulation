import {
  House,
  Settings,
  List,
  Ellipsis,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ClipboardMinus,
  Database,
} from 'lucide-react';

import { NavLink } from 'react-router-dom';
import { ThemeMode } from './ThemeMode';
import { DialogConfirmCancel } from '~/screens/homepage/DialogConfirmCancel';
import {
  getUserRole,
  handleLogoutAndUnsubscribeStates,
} from '~/lib/helpers';

import {
  useFormulationReport,
  useUserAuthStore,
  useUserDisplayStore,
} from '~/lib/store/store';

export default function Sidebar() {
  const { isUserScannedMaterialReports } = useUserAuthStore() // prettier-ignore
  const { isExpandedSidebar, setIsExpandedSidebar, setIsShowVirtualKeyboard } = useUserDisplayStore((state) => state); // prettier-ignore
  const { formulationReportsLines, isDoneAllRawMaterials, mustFollowOrder } = useFormulationReport(); // prettier-ignore

  const getOriginalIndexFormulationReportLines =
    formulationReportsLines.findIndex(
      (item: any) =>
        item.approvalStatus == 0 && item.status == 0,
    );

  return (
    <section className="absolute bottom-0 left-0 top-0 z-20 flex w-[80px] flex-col items-center justify-between bg-[#eff0fa] pt-4">
      <div onClick={() => setIsShowVirtualKeyboard(false)}>
        <div className="pb-9">
          <img
            src="/assets/icon_prisma.png"
            alt="Error Boundary Image"
            className="w-[50px]"
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-7">
          <NavLink
            to={
              !isDoneAllRawMaterials &&
              getUserRole() !== 'Admin' &&
              mustFollowOrder
                ? `/?item=${getOriginalIndexFormulationReportLines}&filter_materials=all`
                : '/'
            }
            className={({ isActive, isPending }) =>
              isPending
                ? 'pending'
                : isActive
                  ? 'rounded-md bg-yellow-200 p-3'
                  : 'p-3 transition-all'
            }
          >
            <House />
          </NavLink>

          {getUserRole() == 'Admin' ? (
            <>
              {' '}
              <NavLink
                to="/masters"
                className={({ isActive, isPending }) =>
                  isPending
                    ? 'pending'
                    : isActive
                      ? 'rounded-md bg-yellow-200 p-3'
                      : 'p-3 transition-all'
                }
              >
                <Database />
              </NavLink>
              <NavLink
                to="/reports"
                // to="/license"
                className={({ isActive, isPending }) =>
                  isPending
                    ? 'pending'
                    : isActive
                      ? 'rounded-md bg-yellow-200 p-3'
                      : 'p-3 transition-all'
                }
              >
                <ClipboardMinus />
              </NavLink>
            </>
          ) : (
            <></>
          )}

          {!isUserScannedMaterialReports && (
            <NavLink
              to="/select-workorder"
              // to="/license"
              className={({ isActive, isPending }) =>
                isPending
                  ? 'pending'
                  : isActive
                    ? 'rounded-md bg-yellow-200 p-3'
                    : 'p-3 transition-all'
              }
            >
              <ClipboardList />
            </NavLink>
          )}

          {isUserScannedMaterialReports && (
            <DialogConfirmCancel />
          )}

          <NavLink
            to="/settings?type=general"
            className={({ isActive, isPending }) =>
              isPending
                ? 'pending'
                : isActive
                  ? 'rounded-md bg-yellow-200 p-3'
                  : 'p-3 transition-all'
            }
          >
            <Settings />
          </NavLink>
        </div>
      </div>

      <div>
        {/* <div
          className="mb-8 transform cursor-pointer rounded-full p-2"
          onClick={() =>
            setIsExpandedSidebar(!isExpandedSidebar)
          }
        >
          {isExpandedSidebar ? (
            <ChevronLeft />
          ) : (
            <ChevronRight />
          )}
        </div> */}
        <div
          className="mb-4 cursor-pointer rounded-full bg-red-100 p-2"
          onClick={() => handleLogoutAndUnsubscribeStates()}
        >
          <LogOut color="red" />
        </div>
      </div>
    </section>
  );
}
