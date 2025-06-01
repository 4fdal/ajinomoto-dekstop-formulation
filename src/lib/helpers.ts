import { os } from '@tauri-apps/api';
import { Store } from 'tauri-plugin-store-api';

import {
  useFormulationReport,
  useUserAuthStore,
  useUserDisplayStore,
  handleLogoutAndUnsubscribeStatesStore,
} from './store/store';

interface DeviceInfo {
  arch: string;
  platform: string;
  version: string;
}

const store = new Store('.settings.dat');

const getErrorMessage = (error: unknown): string => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (
    error &&
    typeof error === 'object' &&
    'message' in error
  ) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'something strange went wrong';
  }

  return message;
};

const getDeviceInfo = async (): Promise<
  DeviceInfo | undefined
> => {
  try {
    const arch = await os.arch(); // Get architecture
    const platform = await os.platform(); // Get platform
    const version = await os.version(); // Get version

    return { arch, platform, version };
  } catch (error) {
    console.error('Error fetching device info:', error);
  }
};

const getAccessToken = () => {
  const user = useUserAuthStore.getState().user;
  // @ts-ignore
  return user?.access_token;
};

const getUserRole = () => {
  const user = useUserAuthStore.getState().user;
  // @ts-ignore
  return user?.role;
};

function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function sleep<
  T extends (...args: any[]) => any,
>(fn: T, ...args: Parameters<T>): Promise<ReturnType<T>> {
  await timeout(3000);
  return fn(...args);
}

function parseJwt(token: string): any {
  const base64Url = token.split('.')[1];
  const base64 = base64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => {
        return (
          '%' +
          ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        );
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
}

function checkStatusOrder(status: number) {
  switch (status) {
    case 0:
      return 'waiting_implementation';
    case 1:
      return 'on_progress';
    case 2:
      return 'completed';
    case 3:
      return 'aborted';
    default:
      return 'not_implemented';
  }
}

function handleLogoutAndUnsubscribeStates() {
  useUserAuthStore.setState({
    user: {},
    isUserScannedMaterialReports: false,
  });
  useFormulationReport.setState({
    formulationReportsLines: [],
    productBatchNumber: '',
    mustFollowOrder: false,
    isReadyToStartWeighing: false,
    isDoneAllRawMaterials: false,
    selectedFormulationReportLines: {},
  });
  useUserDisplayStore.setState({
    isAdminScannedProductCode: false,
    isShowVirtualKeyboard: false,
  });
  handleLogoutAndUnsubscribeStatesStore();
}

async function getDefaultTauriStore<T>(
  key: string,
): Promise<T> {
  const val = await store.get(key);
  return val as T;
}

const encodeObjectToBase64 = <T>(obj: T): string => {
  const jsonStr = JSON.stringify(obj);
  return btoa(jsonStr);
};

const decodeObjectFromBase64 = <T>(
  encodedStr: string | null,
): T => {
  const jsonStr = atob(encodedStr!);
  return JSON.parse(jsonStr) as T;
};

const generateDefaultStoreValues = async () => {
  const env = import.meta.env;

  try {
    const defaultStoreValues = {
      tauri_formulation_scale_device: {
        value: '233 Tcp/Ip',
      },
      identifier: {
        value: true,
      },
      tauri_formulation_scan_feature: {
        value: true,
      },
      tauri_formulation_service_url: {
        value:
          env.TAURI_FORMULATION_SERVICE_URL ??
          'http://localhost:3003',
      },
      tauri_printer_url: {
        value:
          env.TAURI_FORMULATION_PRINTER_URL ??
          'http://localhost:3012',
      },
      tauri_formulation_websocket_url: {
        value:
          env.TAURI_FORMULATION_WEBSOCKET ??
          'http://localhost:3007',
        // value: 'http://localhost:3007/wss',
      },
      tauri_formulation_store_url: {
        value:
          env.TAURI_FORMULATION_STORE_URL ??
          'http://localhost:3003',
        // value: 'http://localhost:3007/wss',
      },
      tauri_application_id: {
        value: '02',
      },
      tauri_formulation_scale_url: {
        value:
          env.TAURI_FORMULATION_SCALE_URL ??
          'http://localhost:3011',
      },
      tauri_formulation_type_printer: {
        value: 'PC',
      },
      tauri_formulation_printer_device: {
        value: 'POS58 Printer',
      },
      tauri_printing_template: {
        value:
          'Operator: {{operator.name}}\n Formulation Name: {{formulationName}}\n Formulation Code: {{formulationCode}}\n Quantity: {{lastLogger}}{{line.unit}}\n Created At: {{logger.createdAt}}\n\n\n\n',
      },
      tauri_formulation_type_printer_pos: {
        value: 'PC',
      },
      tauri_formulation_enable_printing: {
        value: true,
      },
      tauri_fractional_digit: {
        value: 1,
      },
      tauri_implement_auto_save_time_weight_in_tolerance: {
        value: 'yes',
      },
      tauri_auto_save_time_weight_in_tolerance: {
        value: 3000,
      },
      tauri_implement_auto_save_time_weight_out_of_tolerance:
        {
          value: 'yes',
        },
      tauri_auto_save_time_weight_out_of_tolerance: {
        value: 3000,
      },
      tauri_enable_virtual_keyboard: {
        value: true,
      },
    };

    // await store.clear();
    for (const [key, value] of Object.entries(
      defaultStoreValues,
    )) {
      // const existingValue = await store.get(key);
      // if (existingValue === null) {
      // If the key doesn't exist in the store
      await store.set(key, value);
      // }
    }
    await store.save();
  } catch (error) {
    console.log('error generating default store', error);
  }
};

const parseStringToObject = (
  input: string,
): {
  id: number;
  type: string;
} => {
  // Split the string by the comma and trim any extra spaces
  const [idPart, typePart] = input
    .split(',')
    .map((part) => part.trim());

  // Convert the idPart to a number
  const id = parseInt(idPart, 10);

  // Return the resulting object
  return { id, type: typePart };
};

const convertToDate = (dateString: string) => {
  // Split the input string into date and time components
  if (!dateString) {
    return '-';
  }
  const date = new Date(dateString);

  // Extract the components
  const day = String(date.getDate()).padStart(2, '0'); // Day
  const month = String(date.getMonth() + 1).padStart(
    2,
    '0',
  ); // Month (0-indexed)
  const year = date.getFullYear(); // Year
  const hours = String(date.getHours()).padStart(2, '0'); // Hours
  const minutes = String(date.getMinutes()).padStart(
    2,
    '0',
  ); // Minutes

  // Format the output
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const extractStringForProductCode = (val: string) => {
  if (val.includes('-') || val.includes('/')) {
    const parts = val.split(/[-/]/);
    const productCode = parts[0];
    const productDate = parts.slice(1).join('/'); // Join the remaining parts as the product date

    return {
      productCode,
      productDate,
    };
  }

  return {
    productCode: val,
    productDate: '',
  };
};

const getStatusPrint = (no: number) => {
  switch (no) {
    case 0:
      return 'Waiting implementation';
    case 1:
      return 'On Progress';
    case 2:
      return 'Completed';
    case 3:
      return 'Aborted';

    default:
      break;
  }
};

const getActualDurationSetting = (
  durationInSeconds: number,
): string => {
  const seconds = durationInSeconds % 60;
  const minutes = Math.floor(durationInSeconds / 60);

  if (minutes > 0) {
    return `${minutes} minutes ${seconds} seconds`;
  } else {
    return `${seconds} seconds`;
  }
};

const nightSleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const formatValueDynamically = (value: string) => {
  const [integerPart, fractionalPart] = value.split('.');

  const decimals = fractionalPart
    ? fractionalPart.length
    : 0;

  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue)) {
    return '-';
  }

  return parsedValue.toFixed(decimals);
};

const getReportOrderStatus = (
  status: number,
  approvalStatus: number,
) => {
  if (
    (status === 2 && approvalStatus === 1) ||
    (status == 2 && approvalStatus == 0)
  ) {
    return 'Release';
  } else if (status === 2 && approvalStatus !== 1) {
    return 'Rejected';
  }

  return '-';
};

export {
  getErrorMessage,
  getDeviceInfo,
  getAccessToken,
  debounce,
  parseJwt,
  getUserRole,
  checkStatusOrder,
  handleLogoutAndUnsubscribeStates,
  getDefaultTauriStore,
  encodeObjectToBase64,
  decodeObjectFromBase64,
  generateDefaultStoreValues,
  parseStringToObject,
  extractStringForProductCode,
  getStatusPrint,
  getActualDurationSetting,
  nightSleep,
  formatValueDynamically,
  getReportOrderStatus,
  convertToDate,
};
