import moment from 'moment';

import { useState, useEffect } from 'react';
import { getDeviceInfo } from '~/lib/helpers';
import { cn } from '~/lib/utils';
import { version } from '~/lib/config/version';
import { useUserDisplayStore } from '~/lib/store/store';
import { useQuery } from '@tanstack/react-query';
import { getLicenseClientName } from '~/actions/license.action';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '~/components/ui/hover-card';

export default function Footer({
  pathname,
}: {
  pathname: string;
}) {
  const {
    clientLicenseName,
    isScaleConnected,
    setClientLicenseName,
  } = useUserDisplayStore();

  const [currentTime, setCurrentTime] = useState<string>(
    moment().format('hh.mm A'),
  );

  const [deviceInfo, setDeviceInfo] = useState<{
    arch: string;
    platform: string;
    version: string;
  }>({
    arch: '',
    platform: '',
    version: '',
  });

  const { data } = useQuery({
    queryKey: ['license_client_name'],
    queryFn: () => getLicenseClientName(),
  });

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      const info = await getDeviceInfo();
      if (info) {
        setDeviceInfo(info);
      }
    };

    if (data?.name) {
      setClientLicenseName(data?.name);
    }

    fetchDeviceInfo();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format('hh.mm A'));
    }, 60000); // revalidate every one minute

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <section
      className={cn(
        'absolute bottom-0 left-0 right-0 z-10 flex w-full items-center justify-between border bg-white py-2 pl-[90px] pr-4',
        {
          'pl-4 pr-4':
            pathname == '/auth' || pathname == '/license',
        },
      )}
    >
      <div className="w-[155px]">
        <h1 className="font-semibold">v{version}</h1>
      </div>

      <div>
        <h1 className="font-semibold">{currentTime}</h1>
      </div>

      <HoverCard>
        <HoverCardTrigger className="cursor-pointer font-semibold">
          {/* {deviceInfo.platform} */}
          {/* PT. Foom Lab Global */}
          {clientLicenseName}
        </HoverCardTrigger>
        <HoverCardContent>
          <span className="block">
            Device architecture: {deviceInfo.arch}
          </span>
          <span className="block">
            Device platform: {deviceInfo.platform}
          </span>
          <span className="block">
            Device version: {deviceInfo.version}
          </span>
        </HoverCardContent>
      </HoverCard>
    </section>
  );
}
