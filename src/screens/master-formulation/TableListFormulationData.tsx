import { IBodyFormulationLines } from '~/lib/types/types';
import { FormulationLine } from '~/lib/types/responses';
import { encodeObjectToBase64 } from '~/lib/helpers';
import { cn } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  EllipsisVertical,
  Pencil,
  Trash2,
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

export function TableListFormulationData({
  // formulationLines,
  filledFormulationLines,
  setFormulationLines,
}: {
  formulationLines: FormulationLine[] | undefined;
  filledFormulationLines: IBodyFormulationLines[];
  setFormulationLines: React.Dispatch<
    React.SetStateAction<IBodyFormulationLines[]>
  >;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearch] = useSearchParams();
  const isEditForm = searchParams.get('edit_formulation') == 'true' // prettier-ignore
  const initialValuesEdit = searchParams.get('q') // prettier-ignore
  // console.log(
  //   'initialvaluesEdit table lines',
  //   initialValuesEdit,
  // );

  const removeFormulationLineById = (id: number) => {
    const filteredFormulationLines = filledFormulationLines.filter((_, i) => i !== id); // prettier-ignore
    setFormulationLines(filteredFormulationLines);
  };

  const handleEditLines = <T,>(obj: T, idx: number) => {
    console.log('idx', idx);
    const encodedObj = encodeObjectToBase64(obj);
    // if (isEditForm) {
    //   navigate(
    //     `?edit_formulation_lines=true&lines_id=${idx}&q_formulation_lines=${encodedObj}&q=${initialValuesEdit}`,
    //   );
    // } else {
    // }
    navigate(
      `?edit_formulation_lines=true&lines_id=${idx}&q_formulation_lines=${encodedObj}`,
    );
  };

  return (
    <section className="relative h-fit min-h-72 overflow-y-auto rounded-sm border-l border-r border-t">
      <Table>
        <TableCaption>
          {filledFormulationLines.length == 0
            ? 'You have not any formulation lines'
            : ' A list of your recorded datas.'}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Material Code</TableHead>
            <TableHead>Material Name</TableHead>
            <TableHead className="w-[200px]">
              Instruction
            </TableHead>
            <TableHead>Type Tolerance</TableHead>
            <TableHead>Tolerance Grouping</TableHead>
            <TableHead>Max</TableHead>
            <TableHead>Min</TableHead>
            <TableHead className="text-right">
              Max Allowed W
            </TableHead>
            <TableHead className="text-right">
              Target Mass
            </TableHead>
            <TableHead>More</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filledFormulationLines?.map(
            (item: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.productCode}</TableCell>
                <TableCell>{item.instruction}</TableCell>
                <TableCell className="text-center">
                  {item.toleranceType}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={cn(
                      'bg-green-200 text-green-500',
                      {
                        'bg-red-200 text-red-500':
                          !item.implementToleranceGrouping,
                      },
                    )}
                  >
                    {item.implementToleranceGrouping
                      ? 'true'
                      : 'false'}
                  </Badge>
                </TableCell>
                <TableCell>{item.max}</TableCell>
                <TableCell>{item.min}</TableCell>
                <TableCell className="text-right">
                  {item.maxAllowedWeighingQty}
                </TableCell>
                <TableCell className="text-right">
                  {item.targetMass}
                </TableCell>
                <TableCell className="cursor-pointer">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <EllipsisVertical />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-20">
                      <DropdownMenuLabel>
                        My lines
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() =>
                            handleEditLines(item, idx)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            removeFormulationLineById(idx)
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                          <span>Remove</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    </section>
  );
}
