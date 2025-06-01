import { handleLogoutAndUnsubscribeStates } from '~/lib/helpers';
import { emit } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import { confirm } from '@tauri-apps/api/dialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';
import { useUserAuthStore } from '~/lib/store/store';
import { generatePingAction } from '~/actions/auth.action';

import Footer from './Footer';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useUserAuthStore((state) => state);
  const { setIsAppConnected, isAppConnected } = useUserAuthStore((state) => state); // prettier-ignore
  const connectionStatusRef = useRef(isAppConnected);

  useEffect(() => {
    // @ts-ignore
    if (!user.access_token) {
      navigate('/auth');
    }
    // @ts-ignore
  }, [user.access_token]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      generatePingAction().then((res) => {
        const newConnectionStatus = !!res?.message;
        if (
          newConnectionStatus !==
          connectionStatusRef.current
        ) {
          setIsAppConnected(newConnectionStatus);
          connectionStatusRef.current = newConnectionStatus;
        } else {
        }
      });
    }, 1500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const setupCloseListener = async () => {
      const unlisten = await appWindow.onCloseRequested(
        async (event) => {
          console.log('event', event);
          const confirmed = await confirm(
            'Are you sure to close the application?',
          );

          if (!confirmed) {
            event.preventDefault();
            return;
          }

          try {
            await emit('kill-processes');
            console.log('Processes killed successfully');
            localStorage.clear();
            handleLogoutAndUnsubscribeStates();
          } catch (error) {
            console.error(
              'Failed to kill processes',
              error,
            );
            event.preventDefault();
            return;
          }
        },
      );

      return () => {
        unlisten();
      };
    };

    setupCloseListener();
  }, []);

  useEffect(() => {
    if (!isAppConnected) {
      toast.error('Connection failed!');
    } else {
      toast.success('Reconnection success!');
    }
  }, [isAppConnected]);

  return (
    <div className="h-screen">
      {location.pathname !== '/auth' &&
        location.pathname !== '/license' && (
          <>
            <Sidebar />
            <Navbar />
          </>
        )}
      {children}
      <Footer pathname={location.pathname} />
    </div>
  );
}
