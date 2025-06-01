import ContainerLayout from '~/components/ContainerLayout';

import { useState } from 'react';
import { IBodyFormulationLines } from '~/lib/types/types';
import { useQuery } from '@tanstack/react-query';
import { getFormulations } from '~/actions/formulation.action';
import { TableListFormulationData } from './TableListFormulationData';
import { FormCreateFormulation } from './FormCreateFormulation';
import { HeaderFormulation } from './HeaderFormulation';
import { FormFormulationLines } from './FormFormulationLines';
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

export default function Formulations() {
  const location = useLocation();
  const [searchParams, setSearch] = useSearchParams();
  const [filledFormulationLines, setFormulationLines] = useState<IBodyFormulationLines[]>([]); // prettier-ignore
  const isOpenFormFormulationLines = searchParams.get('create_formulation_lines') // prettier-ignore
  const isOpenEditFormFormulationLines = searchParams.get('edit_formulation_lines') // prettier-ignore

  const { data } = useQuery({
    queryKey: ['formulations'],
    queryFn: () => getFormulations(),
  });

  return (
    <>
      <ContainerLayout className="mr-[20px] flex-col justify-between">
        <HeaderFormulation />
        <FormCreateFormulation
          setFormulationLines={setFormulationLines}
          filledFormulationLines={filledFormulationLines}
        />
        <TableListFormulationData
          setFormulationLines={setFormulationLines}
          filledFormulationLines={filledFormulationLines}
          formulationLines={data?.FormulationLines}
        />
      </ContainerLayout>

      {(isOpenFormFormulationLines == 'true' ||
        isOpenEditFormFormulationLines == 'true') && (
        <FormFormulationLines
          filledFormulationLines={filledFormulationLines}
          setFormulationLines={setFormulationLines}
        />
      )}
    </>
  );
}
