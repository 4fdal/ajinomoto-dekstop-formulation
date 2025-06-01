import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { DialogConfirmDelete } from './DialogConfirmDelete';
import { DialogDetailToleranceGrouping } from './DialogDetailToleranceGrouping';
import { Button } from '~/components/ui/button';
import { useDebounce } from '~/hooks/useDebounceHook';
import { Input } from '~/components/ui/input';
import { ToleranceGroupingLines } from '~/lib/types/types';
import {
  encodeObjectToBase64,
  getDefaultTauriStore,
} from '~/lib/helpers';
import { cn } from '~/lib/utils';
import { SmallSpinner } from '~/components/Spinner';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';
import { useUserDisplayStore } from '~/lib/store/store';
import { InputWithAdornment } from '~/components/ui/input-with-adornment';

import {
  useQuery,
  useMutation,
} from '@tanstack/react-query';

import {
  getMasterToleranceGrouping,
  uploadFile,
} from '~/actions/masters.action';

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
  FilePlus2,
  FileUp,
  EllipsisVertical,
  Trash2,
  FileMinus,
  Trash2Icon,
  Pencil,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

export default function TableMasterToleranceGrouping() {
  const navigate = useNavigate();
  const [searchParams, setSearch] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 800);
  const [
    isEnableClientCreation,
    setIsEnableClientCreation,
  ] = useState<boolean>(false);

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const inputRef = useRef();

  const isOpenDetailToleranceGrouping = searchParams.get('id_detail') // prettier-ignore
  const isOpenDelete = searchParams.get('delete_id') // prettier-ignore

  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore((state) => state);

  const { data, refetch } = useQuery({
    queryKey: [
      'master_tolerance_groupings',
      debouncedSearchTerm,
    ],
    queryFn: () => getMasterToleranceGrouping(searchTerm),
  });

  const fileInputRef = useRef<HTMLInputElement | null>(
    null,
  );
  const [file, setFile] = useState<File | null>(null);
  // Mutation for file upload
  const { mutate: uploadFileMutation, isPending } =
    useMutation({
      mutationFn: (file: File) => uploadFile(file, '/tolerance-groupings/import'), // prettier-ignore
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
    });

  // Handle file input change
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = e.target.files
      ? e.target.files[0]
      : null;

    if (selectedFile) {
      setFile(selectedFile); // Only set file if it's not null
      uploadFileMutation(selectedFile); // Trigger the file upload
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

  const handleEditToleranceGrouping = <T,>(obj: T) => {
    const encodedObj = encodeObjectToBase64(obj);
    navigate(
      `/tolerance-grouping?edit_tolerance_grouping=true&q=${encodedObj}`,
    );
  };

  const clearPreviousInput = () => {
    // @ts-expect-error
    keyboard?.current?.clearInput();
  };

  const handleDeleteToleranceGrouping = <T,>(id: T) => {
    navigate(`?delete_id=${id}`);
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
        const result = await getDefaultTauriStore<{
          value: boolean;
        }>('tauri_enable_client_creation');
        setIsEnableClientCreation(result?.value ?? false); // Default to false if no value found
      } catch (error) {
        console.error(
          'Error fetching client creation status:',
          error,
        );
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
            placeholder="Search Tolerance Grouping"
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

        {isEnableClientCreation && (
          <div className="flex items-center gap-3">
            <Button
              onClick={handleButtonClick}
              className="flex w-[130px] items-center gap-2 bg-blue-500 hover:bg-blue-400"
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
              className="flex w-[130px] items-center gap-2 bg-blue-500 hover:bg-blue-400"
              onClick={() =>
                navigate('/tolerance-grouping')
              }
            >
              <FilePlus2 size={20} />
              Add New
            </Button>
          </div>
        )}
      </div>

      <div className="mb-12 mr-2 flex-1 overflow-x-auto rounded-sm border">
        <Table>
          <TableCaption>
            A list of registered Tolerance Grouping
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                No
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">
                Min (default)
              </TableHead>
              <TableHead className="text-center">
                Max (default)
              </TableHead>
              <TableHead className="text-center">
                Tolerance Type (default)
              </TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.rows?.map((tg: any, idx: number) => (
              <TableRow key={tg.id}>
                <TableCell className="font-medium">
                  {idx + 1}
                </TableCell>
                <TableCell>{tg.groupingName}</TableCell>
                <TableCell className="text-center">
                  {tg.defaultMin}
                </TableCell>
                <TableCell className="text-center">
                  {tg.defaultMax}
                </TableCell>
                <TableCell className="text-center">
                  {tg.defaultToleranceType !== ''
                    ? tg.defaultToleranceType
                    : '-'}
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
                            handleEditToleranceGrouping(tg)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`?id_detail=${tg.id}`)
                          }
                        >
                          <FileMinus className="mr-2 h-4 w-4" />
                          <span>Detail</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            handleDeleteToleranceGrouping(
                              tg.id,
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
            ))}
          </TableBody>
        </Table>
      </div>

      {isOpenDetailToleranceGrouping && (
        <DialogDetailToleranceGrouping
          back={() => navigate(-1)}
        />
      )}

      {isOpenDelete && <DialogConfirmDelete />}

      <VirtualKeyboard
        isVisible={isShowVirtualKeyboard}
        onChange={(e) => handleChangeVirtualKeyboard(e)}
        // @ts-expect-error
        keyboardRef={keyboard}
      />
    </main>
  );
}
