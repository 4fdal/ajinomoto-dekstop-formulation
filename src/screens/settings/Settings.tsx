import SettingsLayout from './SettingsLayout';

import { General } from './General';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Scale } from './Scale';
import { Printer } from './Printer';
import { Camera } from './Camera';
import { Barcode } from './Barcode';

export default function Settings() {
  const [searchParams, setSearch] = useSearchParams();
  const [renderView, setRenderView] = useState<React.ReactNode>(null); // prettier-ignore

  const typeView = searchParams.get('type');

  useEffect(() => {
    switch (typeView) {
      case 'general':
        setRenderView(<General />);
        break;

      case 'scale':
        setRenderView(<Scale />);
        break;

      case 'printer':
        setRenderView(<Printer />);
        break;

      case 'camera':
        setRenderView(<Camera />);
        break;

      case 'barcode':
        setRenderView(<Barcode />);
        break;

      default:
        break;
    }
  }, [typeView]);

  return <SettingsLayout>{renderView}</SettingsLayout>;
}
