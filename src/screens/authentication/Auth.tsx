import AuthNavigationBar from './AuthNavigationBar';
import FormAuth from './FormAuth';

import { useQuery } from '@tanstack/react-query';
import { generateDefaultStoreValues } from '~/lib/helpers';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserDisplayStore } from '~/lib/store/store';

import {
  checkLicenseAction,
  getLicenseClientName,
} from '~/actions/license.action';

export default function Authentication() {
  const navigate = useNavigate();
  const { setClientLicenseName } = useUserDisplayStore();

  const { isError } = useQuery({
    queryKey: ['license'],
    queryFn: () => checkLicenseAction(),
  });

  const { data } = useQuery({
    queryKey: ['license_client_name'],
    queryFn: () => getLicenseClientName(),
  });

  if (isError) {
    // navigate('/license');
  }

  if (data) {
    // setClientLicenseName(data?.name);
  }

  useEffect(() => {
    generateDefaultStoreValues();
  }, []);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center">
      <AuthNavigationBar />
      <div className="mt-[100px] flex h-full w-full flex-col items-center justify-start gap-16 sm:w-[600px]">
        <img
          src="/assets/logo_prisma.png"
          alt="Error Boundary Image"
          className="w-[300px]"
        />
        <FormAuth />
      </div>
    </main>
  );
}
