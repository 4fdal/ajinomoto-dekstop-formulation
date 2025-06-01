import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IFormulationReportsLines } from '../types/responses';

type CounterStore = {
  count: number;
  increment: () => void;
  decrement: () => void;
};

interface User {
  [key: string]: unknown; // Allow any properties with type `unknown`
  access_token: string | undefined;
  role: string;
  username: string;
  user_id: string;
}

type UserAuthStore = {
  user: {
    access_token?: string | undefined;
    username?: string | undefined;
    user_id?: string | undefined;
  };
  isAppConnected: boolean;
  isUserScannedMaterialReports: boolean;
  scannedMaterialUUID: string;
  setUser: (user: User) => void;
  setScannedMaterialUUID: (val: string) => void;
  removeUser: () => void;
  setIsUserScanMaterialReports: (val: boolean) => void;
  setIsAppConnected: (val: boolean) => void;
};

interface UserDisplayState {
  isOpenDialogScanProduct: boolean;
  isExpandedSidebar: boolean;
  isAdminScannedProductCode: boolean;
  isScaleConnected: boolean;
  clientLicenseName: string;
  scaleFractionalDigit: number;
  isShowVirtualKeyboard: boolean;
  isGuardSocketConnected: boolean;
  guardedMaterial: { [key: string]: string };
  guardedMaterialIdSet: Set<string>;
  guardWebsocket: null | WebSocket;
  currentAppId: string;
  activeScaleIndex: number;
  isScaleInternal: boolean;
  appId: string;
  lockTargetId: string;

  setAppId: (val: string) => void;
  setLockTargetId: (val: string) => void;
  setIsExpandedSidebar: (val: boolean) => void;
  setIsShowVirtualKeyboard: (val: boolean) => void;
  setIsScaleConnected: (val: boolean) => void;
  setIsOpenDialogScanProduct: (val: boolean) => void;
  setIsAdminScannedProductCode: (val: boolean) => void;
  setClientLicenseName: (val: string) => void;
  setScaleFractionalDigit: (val: number) => void;
  setIsGuardSocketConnected: (val: boolean) => void;
  setGuardedMaterial: (raw: string) => void;
  setIsScaleInternal: (val: boolean) => void;
}

interface UseFormulationReport<T> {
  formulationReportsLines: any;
  selectedFormulationReportLines: any;
  formulationCode: string;
  formulationName: string;
  formulationMass: number;
  requestedMass: number;
  productBatchNumber: string;
  mustFollowOrder: boolean;
  needApproval: boolean;
  scanProductCode: string;
  isReadyToStartWeighing: boolean;
  isDoneAllRawMaterials: boolean;
  appFractionalDigit: number;
  tempFormulationCode: string;

  setTempFormulationCode: (val: string) => void;
  setFormulationCode: (val: string) => void;
  setAppFractionalDigit: (val: number) => void;
  setIsDoneAllRawMaterials: (val: boolean) => void;
  setIsReadyToStartWeighing: (val: boolean) => void;
  setScanProductCode: (val: string) => void;
  setNeedApproval: (val: boolean) => void;
  setFormulationName: (val: string) => void;
  setFormulationMass: (val: number) => void;
  setRequestedMass: (val: number) => void;
  setProductBatchNumber: (val: string) => void;
  setMustFollowOrder: (val: boolean) => void;
  setFormulationReports: (item: T) => void;
  setSelectedFormulationReportLines: (
    item: IFormulationReportsLines | {},
  ) => void;
  removeSelectedFormulationReportLines: () => void;
}

export const useCounterStore = create<CounterStore>(
  (set) => ({
    count: 0,
    increment: () => {
      set((state) => ({ count: state.count + 1 }));
    },
    decrement: () => {
      set((state) => ({ count: state.count - 1 }));
    },
  }),
);

export const useUserAuthStore = create<UserAuthStore>()(
  persist(
    (set) => ({
      user: {},
      isAppConnected: false,
      isUserScannedMaterialReports: false,
      scannedMaterialUUID: '',
      setIsUserScanMaterialReports: (val: boolean) => {
        if (!val) {
          set(() => ({
            isUserScannedMaterialReports: val,
            scannedMaterialUUID: '',
          })); // or set({ user })
        } else {
          set(() => ({
            isUserScannedMaterialReports: val,
          })); // or set({ user })
        }
      },
      setScannedMaterialUUID: (val: string) => {
        set(() => ({ scannedMaterialUUID: val }));
      },
      setUser: (user: User) => {
        set(() => ({ user: user })); // or set({ user })
      },
      removeUser: () => {
        set(() => ({ user: {} })); // or set({ user: {} })
      },
      setIsAppConnected: (val: boolean) => {
        set(() => ({ isAppConnected: val }));
      },
    }),
    { name: 'user_store' },
  ),
);

export const useUserDisplayStore = create<UserDisplayState>(
  (set) => ({
    isOpenDialogScanProduct: false,
    isExpandedSidebar: true,
    isAdminScannedProductCode: false, // required for admin
    isScaleConnected: false,
    clientLicenseName: '',
    scaleFractionalDigit: 0,
    isShowVirtualKeyboard: false,
    isGuardSocketConnected: false,
    guardedMaterial: {},
    guardedMaterialIdSet: new Set(),
    guardWebsocket: null,
    guardedByOther: true,
    currentAppId: '',
    activeScaleIndex: 0,
    isScaleInternal: false,
    appId: '',
    lockTargetId: '',

    setAppId: (val: string) => {
      set(() => ({ appId: val }));
    },
    setLockTargetId: (val: string) => {
      set(() => ({ lockTargetId: val }));
    },
    setIsExpandedSidebar: (val: boolean) => {
      set(() => ({ isExpandedSidebar: val }));
    },
    setIsShowVirtualKeyboard: (val: boolean) => {
      set(() => ({ isShowVirtualKeyboard: val }));
    },
    setIsScaleConnected: (val: boolean) => {
      set(() => ({ isScaleConnected: val }));
    },
    setIsOpenDialogScanProduct: (val: boolean) => {
      set(() => ({ isOpenDialogScanProduct: val }));
    },
    setIsAdminScannedProductCode: (val: boolean) => {
      set(() => ({ isAdminScannedProductCode: val }));
    },
    setClientLicenseName: (val: string) => {
      set(() => ({ clientLicenseName: val }));
    },
    setScaleFractionalDigit: (val: number) => {
      set(() => ({ scaleFractionalDigit: val }));
    },
    setIsGuardSocketConnected: (val: boolean) => {
      set(() => ({ isGuardSocketConnected: val }));
    },
    setIsScaleInternal: (val: boolean) => {
      set(() => ({ isScaleInternal: val }));
    },
    setGuardedMaterial: (raw: string) => {
      if (!raw || typeof raw !== 'string') {
        console.error(
          'Invalid input guarded material: raw must be a non-empty string',
        );
        return;
      }

      const guardedMaterial: { [key: string]: string } = {};
      const guardedMaterialIdSet: Set<string> = new Set();

      raw.split(',').forEach((item) => {
        const [key, value] = item.split(':');
        if (key && value) {
          guardedMaterial[key] = value;
          guardedMaterialIdSet.add(value);
        } else {
          console.error(`Invalid item: ${item}`);
        }
      });

      set(() => ({
        guardedMaterial,
        guardedMaterialIdSet,
      }));
    },
  }),
);

export const useFormulationReport = create<
  UseFormulationReport<Record<string, any>>
>()(
  persist(
    (set) => ({
      formulationReportsLines: [],
      formulationCode: '', // ubah mendadak jadi work order
      formulationName: '',
      formulationMass: 0,
      tempFormulationCode: '', // temporary formulation code, soalnya yang asli diubah mendadak
      requestedMass: 0,
      productBatchNumber: '',
      mustFollowOrder: false,
      needApproval: false,
      scanProductCode: '',
      isReadyToStartWeighing: false,
      isDoneAllRawMaterials: false,
      appFractionalDigit: 0,

      setTempFormulationCode: (val: string) => {
        set(() => ({ tempFormulationCode: val }));
      },
      setMustFollowOrder: (val: boolean) => {
        set(() => ({ mustFollowOrder: val }));
      },
      setAppFractionalDigit: (val: number) => {
        set(() => ({ appFractionalDigit: val }));
      },
      setIsDoneAllRawMaterials: (val: boolean) => {
        set(() => ({ isDoneAllRawMaterials: val }));
      },
      setIsReadyToStartWeighing: (val: boolean) => {
        if (val == false) {
          const guardWebsocket =
            useUserDisplayStore.getState().guardWebsocket;
          const currentAppId =
            useUserDisplayStore.getState().currentAppId;
          if (guardWebsocket != null) {
            guardWebsocket.send(
              `${currentAppId}:APPID${currentAppId}`,
            );
          }
        }
        set(() => ({ isReadyToStartWeighing: val }));
      },
      setScanProductCode: (val: string) => {
        set(() => ({ scanProductCode: val }));
      },
      setNeedApproval: (val: boolean) => {
        set(() => ({ needApproval: val }));
      },
      setProductBatchNumber: (val) => {
        set(() => ({ productBatchNumber: val }));
      },
      setFormulationName: (val) => {
        set(() => ({ formulationName: val }));
      },
      setFormulationCode: (val) => {
        set(() => ({ formulationCode: val }));
      },
      setFormulationMass(val) {
        set(() => ({ formulationMass: val }));
      },
      setRequestedMass(val) {
        set(() => ({ requestedMass: val }));
      },
      selectedFormulationReportLines: {},
      setFormulationReports: (item) => {
        set(() => ({ formulationReportsLines: item }));
      },
      setSelectedFormulationReportLines: (
        item: IFormulationReportsLines | {},
      ) => {
        set(() => ({
          selectedFormulationReportLines: item,
        }));
      },
      removeSelectedFormulationReportLines: () => {
        set(() => ({
          selectedFormulationReportLines: {},
        }));
      },
    }),
    { name: 'formulation_reports' },
  ),
);

export const handleLogoutAndUnsubscribeStatesStore = () => {
  // Clear all persisted state from different stores
  useUserAuthStore.persist.clearStorage(); // Clears user auth store
  // useFormulationReport.persist.clearStorage();  // Clears formulation reports

  // If you have other persisted stores, add them here.
  // For example:
  // useUserDisplayStore.persist.clearStorage();

  // Optionally, you can also clear other non-persisted store states

  localStorage.clear(); // Clears everything in localStorage
};
