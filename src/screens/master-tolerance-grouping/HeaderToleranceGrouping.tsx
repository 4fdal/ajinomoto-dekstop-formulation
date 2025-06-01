import { Button } from '~/components/ui/button';
import { FilePlus2, FileUp } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Breadcrumbs } from '~/components/Breadcrumbs';

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

export function HeaderToleranceGrouping() {
  const navigate = useNavigate();
  const location = useLocation();
  // console.log('location', location);
  const [searchParams, setSearch] = useSearchParams();
  const isEditForm = searchParams.get('edit_tolerance_grouping') == 'true' // prettier-ignore

  return (
    <section className="flex w-full justify-between">
      <div className="flex h-full items-center">
        {isEditForm ? (
          <Breadcrumbs
            currentPathname="Edit Tolerance Grouping"
            previousPathAliases={['Tolerance Grouping']}
            previousPath={[
              'masters/master-tolerance-grouping-data',
            ]}
          />
        ) : (
          <Breadcrumbs
            currentPathname="Create Tolerance Grouping"
            previousPathAliases={['Tolerance Grouping']}
            previousPath={[
              'masters/master-tolerance-grouping-data',
            ]}
          />
        )}
      </div>
    </section>
  );
}
