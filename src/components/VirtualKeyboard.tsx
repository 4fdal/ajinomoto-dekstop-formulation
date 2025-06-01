import Keyboard from 'react-simple-keyboard';

import { cn } from '~/lib/utils';
import { Button } from './ui/button';
import { useUserDisplayStore } from '~/lib/store/store';
import { KeyboardOff } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Store } from 'tauri-plugin-store-api';

import {
  useState,
  MutableRefObject,
  useEffect,
} from 'react';

interface IProps {
  isVisible: boolean;
  onChange: (input: string) => void;
  keyboardRef: MutableRefObject<typeof Keyboard>;
  typeNumber?: boolean;
  onKeyPressed?: (val: string) => void;
}

export function VirtualKeyboard({
  isVisible,
  onChange,
  keyboardRef,
  typeNumber,
  onKeyPressed,
}: IProps): JSX.Element {
  const store = new Store('.settings.dat');
  const [searchParams, setSearchParams] = useSearchParams();
  const [layoutName, setLayoutName] = useState('default');
  const [isEnableVirtual, setIsEnableVirtual] = useState(false); // prettier-ignore

  const isModalPage = searchParams.get('is_modal') == 'true' // prettier-ignore
  const { setIsShowVirtualKeyboard } = useUserDisplayStore(
    (state) => state,
  );

  const onKeyPress = (button: string) => {
    if (onKeyPressed) {
      onKeyPressed(button);
    }

    if (button === '{shift}' || button === '{lock}') {
      setLayoutName(
        layoutName === 'default' ? 'shift' : 'default',
      );
    }
  };

  const layoutTypeNumber = {
    default: ['1 2 3', '4 5 6', '7 8 9', '. 0 ,', '{bksp}'],
    shift: [
      '! / #',
      '$ % ^',
      '& * (',
      '{shift} ) +',
      '{bksp}',
    ],
  };

  useEffect(() => {
    const handleGetVirtualKeyboardActivation = async () => {
      const isEnableVirtualKeyboard = await store.get<{value: boolean}>('tauri_enable_virtual_keyboard') // prettier-ignore
      setIsEnableVirtual(isEnableVirtualKeyboard!.value);
    };

    handleGetVirtualKeyboardActivation();
  }, []);

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-50 min-w-[500px] transform transition-transform duration-300 ease-in-out',
        {
          hidden: !isVisible || !isEnableVirtual, // prettier-ignore
          'hidden translate-y-[800px] duration-75':
            !isVisible,
          'translate-y-0': isVisible,
        },
      )}
    >
      <div className="absolute -top-10 right-0 flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsShowVirtualKeyboard(false)}
        >
          <KeyboardOff />
        </Button>
      </div>
      <Keyboard
        theme="hg-theme-default hg-layout-default"
        keyboardRef={(r) => (keyboardRef.current = r)}
        layoutName={layoutName}
        layout={typeNumber ? layoutTypeNumber : undefined}
        onChange={onChange}
        onKeyPress={onKeyPress}
        // debug
      />
    </div>
  );
}

export function GeneralVirtualKeyboard({
  isVisible,
  onChange,
  keyboardRef,
  typeNumber,
}: IProps): JSX.Element {
  const store = new Store('.settings.dat');
  const [searchParams, setSearchParams] = useSearchParams();
  const [layoutName, setLayoutName] = useState('default');
  const [isEnableVirtual, setIsEnableVirtual] = useState(false); // prettier-ignore

  const isModalPage = searchParams.get('is_modal') == 'true' // prettier-ignore
  const { setIsShowVirtualKeyboard } = useUserDisplayStore(
    (state) => state,
  );

  const onKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') {
      setLayoutName(
        layoutName === 'default' ? 'shift' : 'default',
      );
    }
  };

  const layoutTypeNumber = {
    default: ['1 2 3', '4 5 6', '7 8 9', '. 0 ,', '{bksp}'],
    shift: [
      '! / #',
      '$ % ^',
      '& * (',
      '{shift} ) +',
      '{bksp}',
    ],
  };

  useEffect(() => {
    const handleGetVirtualKeyboardActivation = async () => {
      const isEnableVirtualKeyboard = await store.get<{value: boolean}>('tauri_enable_virtual_keyboard') // prettier-ignore
      setIsEnableVirtual(isEnableVirtualKeyboard!.value);
    };

    handleGetVirtualKeyboardActivation();
  }, []);

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-50 min-w-[500px] transform transition-transform duration-300 ease-in-out',
        {
          hidden: !isVisible, // prettier-ignore
          'hidden translate-y-[800px] duration-75':
            !isVisible,
          'translate-y-0': isVisible,
        },
      )}
    >
      <div className="absolute -top-10 right-0 flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsShowVirtualKeyboard(false)}
        >
          <KeyboardOff />
        </Button>
      </div>
      <Keyboard
        keyboardRef={(r) => (keyboardRef.current = r)}
        layoutName={layoutName}
        layout={typeNumber ? layoutTypeNumber : undefined}
        onChange={onChange}
        onKeyPress={onKeyPress}
      />
    </div>
  );
}
