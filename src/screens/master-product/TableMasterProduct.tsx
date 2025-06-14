import { useEffect, useRef, useState } from 'react';
import { FormCreateProduct } from './FormCreateProduct';
import { useUserDisplayStore } from '~/lib/store/store';
import { Button } from '~/components/ui/button';
import { DialogConfirmDelete } from './DialogConfirmDelete';
import { DialogDetailProduct } from './DialogDetailProduct';
import { deleteProductWeightBridge } from '~/actions/product.action';
import { toast } from 'sonner';
import {
  encodeObjectToBase64,
  getDefaultTauriStore,
} from '~/lib/helpers';
import { Input } from '~/components/ui/input';
import { IProductWeightBridge } from '~/lib/types/types';
import { DialogDeleteProduct } from './DialogDeleteProduct';
import { PaginationTable } from '~/components/PaginationTable';
import { TableSkeleton } from './TableSkeleton';
import { useDebounce } from '~/hooks/useDebounceHook';
import { SmallSpinner } from '~/components/Spinner';
import { cn } from '~/lib/utils';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';
import { InputWithAdornment } from '~/components/ui/input-with-adornment';

import {
  getMasterProductsAction,
  uploadFile,
} from '~/actions/masters.action';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  EllipsisVertical,
  FileMinus,
  FilePlus2,
  FileUp,
  Pencil,
  Trash2,
  Trash2Icon,
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
import { Checkbox } from '~/components/ui/checkbox';
import { Store } from 'tauri-plugin-store-api';

export function TableMasterProduct() {
  const store = new Store('.settings.dat');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore((state) => state);

  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [
    isEnableClientCreation,
    setIsEnableClientCreation,
  ] = useState<boolean>(false);
  const [whitelistedList, setWhitelistedList] = useState<
    string[]
  >([]);

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const inputRef = useRef();

  const isOpenCreateForm = searchParams.get('is_create_products'); // prettier-ignore
  const isOpenEditProduct = searchParams.get('edit_product'); // prettier-ignore
  const isOpenDeleteDialog = searchParams.get('id_delete') // prettier-ignore
  const productId = searchParams.get('product_id'); // prettier-ignore
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const { data, refetch, isLoading } = useQuery({
    queryKey: [
      'master_products',
      page,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      return getMasterProductsAction(page, searchTerm);
    },
    staleTime: 5000,
  });

  const { mutate } = useMutation({
    mutationFn: (id: string) => {
      return deleteProductWeightBridge(id);
    },
    onSuccess: () => {
      toast.success('Successfully delete material!');
      queryClient.invalidateQueries({
        queryKey: ['master_products'],
      });
    },
    onError: (_) => {
      console.log(_);
      toast.error('Failed to delete material!');
    },
  });

  const handleEditProduct = <T,>(obj: T, id: string) => {
    const encodedObj = encodeObjectToBase64(obj);
    navigate(`?edit_product=true&id=${id}&q=${encodedObj}`);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(
    null,
  );

  const [file, setFile] = useState<File | null>(null);
  // Mutation for file upload
  const { mutate: uploadFileMutation, isPending } =
    useMutation({
      mutationFn: (file: File) => uploadFile(file, '/product-weight-bridges/import'), // prettier-ignore
      onSuccess: (res) => {
        // @ts-ignore
        if (res.status !== 200) {
          // @ts-ignore
          const errorMessage = res?.response?.data?.error;
          toast.error(errorMessage);
          toast.error(`Upload Failed`);
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
    const newPosition = caretPositionRef.current + (newInput.length - searchTerm.length); // prettier-ignore
    caretPositionRef.current = newPosition < 0 ? 0 : newPosition; // prettier-ignore
  };

  const clearPreviousInput = () => {
    // @ts-expect-error
    keyboard?.current?.clearInput();
  };

  const onChange = (newInput: string) => {
    console.log('new input', newInput);
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
    console.log('exec');
    caretPositionRef.current = event.target.selectionStart;
  };

  const isWhitelisted = (productName: string) => {
    return whitelistedList.includes(productName);
  };

  const modifyWhitelisted = async (productName: string) => {
    setWhitelistedList((prevList) => {
      const updatedList = prevList.includes(productName)
        ? prevList.filter((item) => item !== productName)
        : [...prevList, productName];

      store
        .set('tauri_whitelisted_product', {
          value: updatedList.join(','),
        })
        .catch((error) =>
          console.error('Error saving whitelist:', error),
        );

      return updatedList;
    });
    const whitelistedProduct = await getDefaultTauriStore<{ value: string }>('tauri_whitelisted_product') // prettier-ignore

    console.log(whitelistedProduct, whitelistedList);
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
        const whitelistedProduct = await getDefaultTauriStore<{ value: string }>('tauri_whitelisted_product') // prettier-ignore
        const splittedProducts =
          whitelistedProduct?.value?.split(',') || [];
        const result = await getDefaultTauriStore<{
          value: boolean;
        }>('tauri_enable_client_creation');
        setIsEnableClientCreation(result?.value ?? false); // Default to false if no value found
        setWhitelistedList(splittedProducts);
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
      <div className="flex w-full items-center justify-between py-3">
        <div>
          <InputWithAdornment
            endAdornment={<Trash2Icon color="red" />}
            endAdornmentFn={() => {
              clearPreviousInput();
              setSearchTerm('');
            }}
            type="text"
            placeholder="Search Materials"
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
          <div className="flex items-center gap-3 pr-2">
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
              onClick={() =>
                navigate('?is_create_products=true')
              }
              className="flex w-[130px] items-center gap-2 bg-blue-500 hover:bg-blue-400"
            >
              <FilePlus2 size={20} />
              Add New
            </Button>
          </div>
        )}
      </div>

      <div className="mb-8 mr-2 flex flex-1 flex-col justify-between overflow-x-auto rounded-md border">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <Table>
            <TableCaption>
              {data?.count == 0
                ? 'No data to be displayed'
                : 'A list of your materials.'}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>NO</TableHead>
                <TableHead>Whitelist</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">
                  UoM
                </TableHead>
                <TableHead className="text-center">
                  More
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data?.rows?.map(
                (
                  data: IProductWeightBridge,
                  idx: number,
                ) => (
                  <TableRow key={data.id}>
                    <TableCell>
                      {(page - 1) * 7 + idx + 1}{' '}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={isWhitelisted(data.name)}
                          onCheckedChange={() =>
                            modifyWhitelisted(data.name)
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>{data.code}</TableCell>
                    <TableCell>{data.name}</TableCell>
                    <TableCell className="text-center">
                      {data.Unit.name}
                    </TableCell>
                    <TableCell className="flex cursor-pointer justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <EllipsisVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-20">
                          <DropdownMenuLabel>
                            My Materials
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={() =>
                                handleEditProduct(
                                  data,
                                  data.id,
                                )
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(
                                  `?product_id=${data.id}`,
                                )
                              }
                            >
                              <FileMinus className="mr-2 h-4 w-4" />
                              <span>Detail</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                navigate(
                                  `?id_delete=${data.id}`,
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
        )}

        <div
          className={cn('', {
            hidden: data?.rows.length < 1,
          })}
        >
          <PaginationTable
            datas={data}
            page={page}
            setPage={setPage}
          />
        </div>
      </div>

      {(isOpenCreateForm == 'true' ||
        isOpenEditProduct == 'true') && (
        <FormCreateProduct />
      )}

      {productId && (
        <DialogDetailProduct back={() => navigate(-1)} />
      )}

      {isOpenDeleteDialog && (
        <DialogConfirmDelete back={() => navigate(-1)} />
      )}

      <VirtualKeyboard
        isVisible={
          isShowVirtualKeyboard &&
          !isOpenCreateForm &&
          !isOpenEditProduct
        }
        onChange={handleChangeVirtualKeyboard}
        // @ts-expect-error
        keyboardRef={keyboard}
      />
    </main>
  );
}
