import { Button } from '~/components/ui/button';
import { FilePlus2, FileUp } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Breadcrumbs } from '~/components/Breadcrumbs';

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

export function HeaderFormulation() {
  const navigate = useNavigate();
  const location = useLocation();
  // console.log('location', location);
  const [searchParams, setSearch] = useSearchParams();
  const isEditForm = searchParams.get('edit_formulation') == 'true' // prettier-ignore

  return (
    <section className="flex w-full justify-between">
      <div className="flex h-full items-center">
        {isEditForm ? (
          <Breadcrumbs
            currentPathname="Edit Formulation"
            previousPathAliases={['Formulations']}
            previousPath={[
              'masters/master-formulation-data',
            ]}
          />
        ) : (
          <Breadcrumbs
            currentPathname="Create Formulation"
            previousPathAliases={['Formulations']}
            previousPath={[
              'masters/master-formulation-data',
            ]}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* <Button
          onClick={() =>
            navigate('?create_formulation_lines=true')
          }
          className={cn(
            'flex w-[125px] items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:cursor-not-allowed',
            {
              hidden: isEditForm,
            },
          )}
        >
          <FilePlus2 size={20} />
          Add Lines
        </Button> */}
      </div>
    </section>
  );
}
