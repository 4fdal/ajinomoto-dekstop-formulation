import ContainerLayout from '~/components/ContainerLayout';

import { useUserDisplayStore } from '~/lib/store/store';
import { NavLink, useSearchParams } from 'react-router-dom';
import { cn } from '~/lib/utils';
import { ReactNode } from 'react';

import {
  Wrench,
  Scale,
  Printer,
  Cctv,
  ScanBarcode,
} from 'lucide-react';

interface SettingLink {
  icon: React.ComponentType<any>; // Type for the Lucide icon component
  label: string;
  to: string; // Path to the setting page
}

const settingsLinks: SettingLink[] = [
  {
    icon: Wrench,
    label: 'General',
    to: '/settings?type=general',
  },
  {
    icon: Scale,
    label: 'Scale',
    to: '/settings?type=scale',
  },
  {
    icon: Printer,
    label: 'Printer',
    to: '/settings?type=printer',
  },
  // {
  //   icon: Cctv,
  //   label: 'Camera CCTV',
  //   to: '/settings?type=camera',
  // },
  {
    icon: ScanBarcode,
    label: 'Barcode',
    to: '/settings?type=barcode',
  },
] as const;

export default function SettingsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [searchParams, setSearch] = useSearchParams();
  const typeView = searchParams.get('type');

  const {
    isExpandedSidebar,
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore((state) => state);

  return (
    <ContainerLayout
      fallback={<h1>Something must be wrong</h1>}
      className="pl-[80px] pt-[75px]"
    >
      <section className="flex w-full">
        {isExpandedSidebar && (
          <div
            className="flex w-1/4 flex-col gap-3 p-2"
            onClick={() => setIsShowVirtualKeyboard(false)}
          >
            {settingsLinks.map((setting) => (
              <NavLink
                key={setting.label}
                to={setting.to}
                className={cn(
                  'flex h-[50px] w-full items-center gap-3 rounded-md border px-3 font-medium transition-all',
                  {
                    'bg-blue-400 text-gray-100':
                      typeView ===
                        setting.label.toLowerCase() ||
                      (setting.label === 'Camera CCTV' &&
                        typeView === 'camera'), // prettier-ignore,
                  },
                )}
              >
                <setting.icon />
                {setting.label}
              </NavLink>
            ))}
          </div>
        )}

        <div className="w-full border pl-3">{children}</div>
      </section>
    </ContainerLayout>
  );
}
