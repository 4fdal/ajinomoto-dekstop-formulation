import { useState, useEffect, useRef } from 'react';
import { SmallSpinner } from '~/components/Spinner';
import { Badge } from '~/components/ui/badge';
import { useDebounce } from '~/hooks/useDebounceHook';
import { DialogDetailFormulation } from '../master-formulation/DialogDetailFormulation';
import { DialogConfirmDelete } from '../master-formulation/DialogConfirmDelete';
import { RFormulationReports } from '~/lib/types/responses';
import { Input } from '~/components/ui/input';
import { encodeObjectToBase64, getDefaultTauriStore } from '~/lib/helpers';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { uploadFile } from '~/actions/masters.action';
import { getFormulationBySearchTerm } from '~/actions/formulation.action';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';
import { useUserDisplayStore } from '~/lib/store/store';
import { InputWithAdornment } from '~/components/ui/input-with-adornment';

import {
  useQuery,
  useMutation,
} from '@tanstack/react-query';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  FilePlus2,
  FileUp,
  EllipsisVertical,
  Pencil,
  Trash2,
  Trash2Icon,
  FileMinus,
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
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

const Status = ({ no }: { no: number }) => {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center rounded-md bg-green-200 px-2 py-1 text-green-600',
        {
          'bg-gray-200 text-gray-500': no == 1,
        },
      )}
    >
      {no == 0 ? 'Active' : 'Archived'}
    </div>
  );
};

export function TableMasterFormulation() {
  const navigate = useNavigate();
   const [isEnableClientCreation, setIsEnableClientCreation] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(
    null,
  );

  const [searchParams, setSearch] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 800);
  const isOpenDeleteDialog = searchParams.get('id_delete') // prettier-ignore
  const isOpenDetailFormulation = searchParams.get('id_detail') // prettier-ignore

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const inputRef = useRef();

  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore((state) => state);

  const { data, refetch } = useQuery({
    queryKey: ['all-formulations', debouncedSearchTerm],
    queryFn: () => getFormulationBySearchTerm(searchTerm),
  });

  const handleEditFormulations = <T,>(obj: T) => {
    const encodedObj = encodeObjectToBase64(obj);
    navigate(
      `/formulations?edit_formulation=true&q=${encodedObj}`,
    );
  };

  const clearPreviousInput = () => {
    // @ts-expect-error
    keyboard?.current?.clearInput();
  };

  const [file, setFile] = useState<File | null>(null);
  const { mutate: uploadFileMutation, isPending } =
    useMutation({
      mutationFn: (file: File) => uploadFile(file, '/formulations/import'), // prettier-ignore
      onSuccess: (res) => {
        // @ts-ignore
        if (res.status !== 200) {
          // @ts-ignore
          const errorMessage = res?.response?.data?.error;
          toast.error(errorMessage);
          toast.error(`Upload Failed`);
          setFile(null);
        } else {
          toast.success('Data Imported.');
          refetch();
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (err) => {
        console.log('error', err);
      },
    });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = e.target.files
      ? e.target.files[0]
      : null;

    if (selectedFile) {
      setFile(selectedFile);
      uploadFileMutation(selectedFile);
    } else {
      console.error('No file selected');
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const updateCaretPosition = (newInput: any) => {
    const newPosition =
      caretPositionRef.current +
      (newInput.length - searchTerm.length);
    caretPositionRef.current =
      newPosition < 0 ? 0 : newPosition;
  };

  const onChange = (newInput: string) => {
    updateCaretPosition(newInput);
    setSearchTerm(newInput);

    // Restore caret position after input value is set
    if (inputRef.current) {
      // @ts-expect-error
      inputRef.current.focus();
      // @ts-expect-error
      inputRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  };

  const handleChangeVirtualKeyboard = (txt: string) => {
    onChange(txt);
  };

  const onChangeInput = (event: any) => {
    const newInput = event.target.value;
    updateCaretPosition(newInput);
    setSearchTerm(newInput);

    // Update caret position based on where the user clicks or types
    caretPositionRef.current = event.target.selectionStart;
    if (keyboard.current) {
      // @ts-expect-error
      keyboard.current.setInput(newInput);
    }
  };

  const handleCaretPosition = (event: any) => {
    caretPositionRef.current = event.target.selectionStart;
  };

  useEffect(() => {
    if (inputRef.current) {
      // @ts-expect-error
      inputRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchClientCreationStatus = async () => {
      try {
        const result = await getDefaultTauriStore<{ value: boolean }>('tauri_enable_client_creation');
        setIsEnableClientCreation(result?.value ?? false); // Default to false if no value found
      } catch (error) {
        console.error('Error fetching client creation status:', error);
      }
    };

    fetchClientCreationStatus();
  }, []);

  return (
    <main className="flex h-full flex-col">
      <div className="flex w-full items-center justify-between py-3 pr-2">
        <div>
          <InputWithAdornment
            endAdornment={<Trash2Icon color="red" />}
            endAdornmentFn={() => {
              clearPreviousInput();
              setSearchTerm('');
            }}
            type="text"
            placeholder="Search Formulations"
            className="w-[500px] focus:border focus:border-blue-500"
            name="searchTerm"
            onChange={onChangeInput}
            onClick={onChangeInput}
            onKeyUp={handleCaretPosition}
            value={searchTerm}
            // @ts-expect-error
            ref={inputRef}
            onFocus={() => setIsShowVirtualKeyboard(true)}
          />
        </div>

       {
        isEnableClientCreation &&  <div className="flex items-center gap-3">
        <Button
          onClick={handleButtonClick}
          className={cn(
            'flex w-[130px] items-center gap-2 bg-blue-500 hover:bg-blue-400',
            {
              'border border-blue-500 bg-white':
                isPending,
            },
          )}
        >
          <FileUp
            size={20}
            className={cn('', {
              hidden: isPending,
            })}
          />
          <input
            type="file"
            id="file"
            name="file"
            accept=".xlsx" // Specify allowed file type
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {isPending ? <SmallSpinner /> : 'Import'}
        </Button>
        <Button
          onClick={() => navigate('/formulations')}
          className="flex w-[130px] items-center gap-2 bg-blue-500 hover:bg-blue-400"
        >
          <FilePlus2 size={20} />
          Add New
        </Button>
      </div>
       }
      </div>

      <div className="mb-12 mr-2 flex-1 overflow-x-auto rounded-sm border">
        <Table>
          <TableCaption>
            {data?.length == 0
              ? 'No data to be displayed'
              : 'A list of your recent master formulations.'}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                NO
              </TableHead>
              <TableHead>Formulation Name</TableHead>
              <TableHead>Formulation Code</TableHead>
              <TableHead className="text-center">
                Must Follow Order
              </TableHead>
              <TableHead className="text-center">
                Total Ingredient
              </TableHead>
              <TableHead className="text-center">
                Status
              </TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.map(
              (item: RFormulationReports, idx: number) => (
                <TableRow key={item.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell className="font-medium">
                    {item.formulationName}
                  </TableCell>
                  <TableCell>
                    {item.formulationCode}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={cn(
                        'bg-green-200 text-green-500',
                        {
                          'bg-red-200 text-red-500':
                            !item.mustFollowOrder,
                        },
                      )}
                    >
                      {item.mustFollowOrder
                        ? 'true'
                        : 'false'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.totalIngredient}
                  </TableCell>
                  <TableCell className="w-[150px]">
                    <Status no={item.status} />
                  </TableCell>
                  <TableCell className="cursor-pointer">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <EllipsisVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-20">
                        <DropdownMenuLabel>
                          Menus
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() =>
                              handleEditFormulations(item)
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `?id_detail=${item.id}`,
                              )
                            }
                          >
                            <FileMinus className="mr-2 h-4 w-4" />
                            <span>Detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              navigate(
                                `?id_delete=${item.id}`,
                              );
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                            <span>Delete</span>
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
      </div>

      {isOpenDeleteDialog && (
        <DialogConfirmDelete back={() => navigate(-1)} />
      )}

      {isOpenDetailFormulation && (
        <DialogDetailFormulation
          back={() => navigate(-1)}
        />
      )}

      <VirtualKeyboard
        isVisible={isShowVirtualKeyboard}
        onChange={(e) => handleChangeVirtualKeyboard(e)}
        // @ts-expect-error
        keyboardRef={keyboard}
      />
    </main>
  );
}
