import PullToRefresh from 'react-simple-pull-to-refresh';

import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '~/components/ui/button';
import { getFormulationReports } from '~/actions/formulation.action';
import { useEffect, useState } from 'react';
import { MaterialListSkeleton } from './MaterialListSkeleton';
import { MaterialListCards } from './MaterialListCards';

import {
  useFormulationReport,
  useUserAuthStore,
} from '~/lib/store/store';

export default function MaterialLists() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(13);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const { isUserScannedMaterialReports } = useUserAuthStore() // prettier-ignore
  const { setFormulationReports } = useFormulationReport();

  const { refetch, data, isRefetching } = useQuery({
    queryKey: ['formulation-reports'],
    queryFn: () => getFormulationReports(),
    enabled: false,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refetch().then((res) => {
      if (res.data) {
        // setFormulationReports(res.data);
      }
    });

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  useEffect(() => {
    handleRefresh().then(() => setProgress(88));
  }, []);

  return (
    <>
      {isUserScannedMaterialReports ? (
        <PullToRefresh onRefresh={handleRefresh}>
          {isRefreshing ? (
            <MaterialListSkeleton />
          ) : (
            <MaterialListCards />
          )}
        </PullToRefresh>
      ) : (
        <div className="flex h-full flex-col items-center justify-center">
          <Button
            onClick={() => navigate('?is_modal=true')}
            variant="outline"
            className="border-0 text-xl font-semibold text-red-500 hover:bg-white hover:text-red-400"
          >
            SCAN FORMULA
          </Button>
          <h1 className="text-center text-xl font-semibold">
            Please Scan Formula and Quantity QR Code
          </h1>
        </div>
      )}
    </>
  );
}
