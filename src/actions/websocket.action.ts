import { toast } from 'sonner';
import { Store } from 'tauri-plugin-store-api';
import { v4 as uuidv4 } from 'uuid';
import { parseStringToObject } from '~/lib/helpers';
import { useUserDisplayStore } from '~/lib/store/store';

interface TauriStore {
  value: string;
}

interface TauriStoreScale {
  value: [];
}
interface ScaleDevice {
  ID: string;
  Name: string;
  ConnectionType: string;
}

let timerDelay = 2000;
let isTimerActive = false;
let ws: WebSocket | null;
let isStableSign = false;
let timer: NodeJS.Timeout | undefined;
export const connectToScaleWebSocket = async (
  setScaleValue: (value: number) => void,
  setIsStableSign: (value: boolean) => void,
  setScaleUnit: (value: any) => void,
  setScaleName: (value: any) => void,
  setScaleFractionalDigit: (value: any) => void,
  isButtonPressed: boolean = false,
) => {
  if (isTimerActive && isButtonPressed) {
    toast.info(
      `Gagal: Mohon ulangi setelah ${timerDelay / 1000} detik`,
    );
    return;
  }
  isTimerActive = true;

  setTimeout(() => {
    // Unlock the function after the defined delay
    isTimerActive = false;
    console.log('Function A can be executed again');
  }, timerDelay);

  const store = new Store('.settings.dat');

  const BASE_URL = (await store.get(
    'tauri_formulation_scale_url',
  )) as TauriStore;

  const SCALE_DEVICES = (await store.get(
    'tauri_formulation_scale_device',
  )) as TauriStoreScale;

  let ACTIVE_INDEX =
    useUserDisplayStore.getState().activeScaleIndex;
  if (ACTIVE_INDEX >= SCALE_DEVICES.value.length) {
    ACTIVE_INDEX = 0;
    useUserDisplayStore.setState({
      activeScaleIndex: 1,
    });
  } else {
    // for next iteration
    useUserDisplayStore.setState({
      activeScaleIndex: ACTIVE_INDEX + 1,
    });
  }

  const SCALE_DEVICE = SCALE_DEVICES.value[
    ACTIVE_INDEX
  ] as ScaleDevice;
  // const parsedScaleDevice = parseStringToObject(
  //   SCALE_DEVICE as unknown as string,
  // );
  const parsedScaleDevice = {
    id: SCALE_DEVICE.ID,
    name: SCALE_DEVICE.Name,
  };
  setScaleName(parsedScaleDevice.name);

  if (SCALE_DEVICE.ConnectionType == 'Internal') {
    useUserDisplayStore.setState({
      isScaleInternal: true,
    });
  } else {
    useUserDisplayStore.setState({
      isScaleInternal: false,
    });
  }

  try {
    if (ws != null) {
      if (ws.readyState == WebSocket.OPEN) {
        ws.close(1000, 'CLOSE IT');
      }
    }

    const wsURL = `${BASE_URL.value}/ws?CODE=${parsedScaleDevice.id}`;
    ws = new WebSocket(wsURL);

    ws.onopen = (event) => {
      console.log('Connected to WebSocket server', event);
      startTimer();
    };

    ws.onmessage = (event) => {
      if (event.data.length < 2) {
        console.error('error', event);
        setScaleValue(0);
        return;
      }

      const stableSign = event.data[0];
      const slicedData = event.data.slice(1);
      const extractedUnit =
        slicedData.match(/[a-zA-Z]+/)?.[0] || '';
      const extractedNumber =
        slicedData.match(/[\d,.]+/)?.[0] || '';

      // console.warn(slicedData);
      const valueForReact = extractedNumber;

      // detect if not stable
      if (stableSign == '?') {
        resetTimer();
      }

      const [integerPart, fractionalPart] = valueForReact.split('.'); // prettier-ignore
      const decimals = fractionalPart
        ? fractionalPart.length
        : 0;

      setScaleFractionalDigit(decimals);
      setScaleValue(parseFloat(valueForReact));
      setIsStableSign(isStableSign);
      setScaleUnit(extractedUnit);
    };

    function startTimer() {
      timer = setTimeout(() => {
        isStableSign = true;
      }, 3000);
    }

    function resetTimer() {
      isStableSign = false;
      clearTimeout(timer);
      startTimer();
    }

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      useUserDisplayStore.setState({
        isScaleConnected: false,
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      useUserDisplayStore.setState({
        isScaleConnected: false,
      });
    };
    toast.success(`Timbangan Terhubung`);
  } catch (error) {
    console.log(error);
    useUserDisplayStore.setState({
      isScaleConnected: false,
    });
  }
};

export const connectWithIndex = async (
  index: number,
  command: string,
  closeFunction: (error: boolean) => any,
) => {
  if (isTimerActive) {
    return;
  }
  isTimerActive = true;

  setTimeout(() => {
    // Unlock the function after the defined delay
    isTimerActive = false;
    console.log('Function A can be executed again');
  }, timerDelay);

  const store = new Store('.settings.dat');

  const BASE_URL = (await store.get(
    'tauri_formulation_scale_url',
  )) as TauriStore;

  const SCALE_DEVICES = (await store.get(
    'tauri_formulation_scale_device',
  )) as TauriStoreScale;

  let ACTIVE_INDEX = index;

  const SCALE_DEVICE = SCALE_DEVICES.value[
    ACTIVE_INDEX
  ] as ScaleDevice;
  const parsedScaleDevice = {
    id: SCALE_DEVICE.ID,
    name: SCALE_DEVICE.Name,
  };

  try {
    if (ws != null) {
      if (ws.readyState == WebSocket.OPEN) {
        ws.close(1000, 'CLOSE IT');
      }
    }
    let timeoutId: NodeJS.Timeout;

    // const wsURL = `${BASE_URL.value}/ws?CODE=${parsedScaleDevice.id}`;

    const [, , url] = BASE_URL.value.split('/');
    const [host, port] = url.split(':');
    const wsURL = `ws://${host}:${port}/ws?CODE=1`;

    ws = new WebSocket(wsURL);

    ws.onopen = (event) => {
      console.log(
        'Connected to WebSocket server ' + wsURL,
        event,
      );
      ws?.send(command);

      // Set a timeout to close the connection if no message is received in 5 seconds
      timeoutId = setTimeout(() => {
        closeFunction(true), ws?.close(1000, 'CLOSE IT');
      }, 5000);
    };

    ws.onmessage = (event) => {
      if (event.data.length < 2) {
        console.error(
          'Error: Invalid message ' + wsURL,
          event,
        );
        return;
      }

      // Clear the timeout since a message has been received
      clearTimeout(timeoutId);

      // Execute success function and close WebSocket
      closeFunction(false);
      ws?.close(1000, 'CLOSE IT');
    };

    ws.onclose = () => {
      console.log(
        'Disconnected from WebSocket server ' + wsURL,
      );
      useUserDisplayStore.setState({
        isScaleConnected: false,
      });
    };

    ws.onerror = (error) => {
      console.error(
        'WebSocket ' + wsURL + ' error:',
        error,
      );
      useUserDisplayStore.setState({
        isScaleConnected: false,
      });
    };
  } catch (error) {
    console.log(error);
    useUserDisplayStore.setState({
      isScaleConnected: false,
    });
  }
};

export const sendCommand = async (
  command: string,
  closeFunction: () => any,
) => {
  if (isTimerActive) {
    return;
  }
  isTimerActive = true;

  setTimeout(() => {
    // Unlock the function after the defined delay
    isTimerActive = false;
    console.log('Function A can be executed again');
  }, timerDelay);
  ws?.send(command);
  closeFunction();
};

export const connectToGuardWebSocket = async (
  setGuardedMaterial: (value: string) => void,
  user: any,
) => {
  const store = new Store('.settings.dat');

  const BASE_URL = (await store.get(
    'tauri_formulation_websocket_url',
  )) as TauriStore;

  try {
    if (
      useUserDisplayStore.getState().isGuardSocketConnected
    ) {
      console.log(
        'Only one websocket connection is allowed',
      );
      return;
    }

    const [protocol, url] = BASE_URL.value.split('//');
    const wsProtocol = protocol == 'http:' ? 'ws:' : 'wss:';
    let wsURL = `${BASE_URL.value}/forwarder?url=${wsProtocol}//${url}/ws`;

    // const wsURL = `${BASE_URL.value}/forwarder?url=${BASE_URL.value}/ws`;
    const wsGuard = new WebSocket(wsURL);

    wsGuard.onopen = (event) => {
      console.log(
        'Connected to WebSocket server : ' + wsURL,
        event,
      );

      const appId = user.username;
      const lockTargetId = uuidv4();
      const identityMessage = `${appId}:${lockTargetId}`;

      wsGuard.send(identityMessage);
      useUserDisplayStore.setState({
        guardWebsocket: wsGuard,
      });
    };

    wsGuard.onmessage = (event) => {
      console.log('EVENT HAPPENT', event.data);
      if (event.data.length < 2) {
        console.error('error', event);
        return;
      }

      setGuardedMaterial(event.data);
      useUserDisplayStore.setState({
        isGuardSocketConnected: true,
      });
    };

    wsGuard.onclose = () => {
      console.log('Disconnected from WebSocket server');
      useUserDisplayStore.setState({
        isGuardSocketConnected: false,
        guardWebsocket: null,
      });
    };

    wsGuard.onerror = (error) => {
      console.error(
        'WebSocket error ' + wsURL + ' : ',
        error,
      );
      useUserDisplayStore.setState({
        isGuardSocketConnected: false,
        guardWebsocket: null,
      });
    };
  } catch (error) {
    console.log(error);
    useUserDisplayStore.setState({
      isGuardSocketConnected: false,
      guardWebsocket: null,
    });
  }
};
