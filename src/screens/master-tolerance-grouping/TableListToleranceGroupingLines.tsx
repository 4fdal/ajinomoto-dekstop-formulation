import { encodeObjectToBase64 } from '~/lib/helpers';
import { ToleranceGroupingLines } from '~/lib/types/types';

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

export function TableListToleranceGroupingLines({
  filledToleranceGoupingLines,
  setFilledToleranceGroupingLines,
}: {
  filledToleranceGoupingLines: ToleranceGroupingLines[];
  setFilledToleranceGroupingLines: React.Dispatch<
    React.SetStateAction<ToleranceGroupingLines[]>
  >;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearch] = useSearchParams();
  const isEditForm = searchParams.get('edit_formulation') == 'true' // prettier-ignore
  const initialValuesEdit = searchParams.get('q') // prettier-ignore

  const removeFormulationLineById = (id: number) => {
    const filteredToleranceGroupingLines = filledToleranceGoupingLines.filter((_, i) => i !== id); // prettier-ignore
    setFilledToleranceGroupingLines(
      filteredToleranceGroupingLines,
    );
  };

  const handleEditLines = <T,>(obj: T, idx: number) => {
    const encodedObj = encodeObjectToBase64(obj);
    navigate(
      `?edit_tolerance_grouping_lines=true&lines_id=${idx}&q_tolerance_lines=${encodedObj}`,
    );
  };

  return (
    <section className="relative h-full min-h-[330px] overflow-y-auto rounded-sm border-l border-r border-t">
      <Table>
        <TableCaption>
          {filledToleranceGoupingLines.length == 0
            ? 'You have not any tolerance grouping lines'
            : ' A list of your recorded datas.'}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Lower Range</TableHead>
            <TableHead>Upper Range</TableHead>
            <TableHead className="text-center">
              Tolerance Type
            </TableHead>
            <TableHead>Min</TableHead>
            <TableHead>Max</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filledToleranceGoupingLines.map(
            (item: ToleranceGroupingLines, idx: number) => (
              <TableRow key={idx}>
                <TableCell>{item.lowerRange}</TableCell>
                <TableCell>{item.upperRange}</TableCell>
                <TableCell className="text-center">
                  {item.toleranceType}
                </TableCell>
                <TableCell>{item.min}</TableCell>
                <TableCell>{item.max}</TableCell>
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
