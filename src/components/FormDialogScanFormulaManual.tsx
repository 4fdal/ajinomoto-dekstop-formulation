import Spinner from '~/components/Spinner';

import { toast } from 'sonner';
import { Store } from 'tauri-plugin-store-api';
import { VirtualKeyboard } from './VirtualKeyboard';
import { RFormulationReports } from '~/lib/types/responses';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import {
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { Input } from '~/components/ui/input';
import { WorkOrderSchema } from '~/lib/types/schemas';
import { debounce } from '~/lib/helpers';
import { Trash2 } from 'lucide-react';

import {
  Check,
  ChevronsUpDown,
  Play,
  SendToBack,
} from 'lucide-react';

import {
  checkStatusOrder,
  getUserRole,
} from '~/lib/helpers';

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  ChangeEvent,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

import {
  createFormulationReportsV2,
  getFormulationCode,
  getFormulationSuperAdmin,
} from '~/actions/formulation.action';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';

import {
  useFormulationReport,
  useUserAuthStore,
  useUserDisplayStore,
} from '~/lib/store/store';
import { getReportFormulationModals } from '~/actions/reports.action';

type FieldInputType = 'work_order';

export default function FormDialogScanFormulaManual() {
  const store = new Store('.settings.dat');
  const navigate = useNavigate();

  const [formulationCode, setFormulationCode] = useState<string>(''); // prettier-ignore
  const [searchParams, setSearch] = useSearchParams();
  const { setIsUserScanMaterialReports, user } = useUserAuthStore(); // prettier-ignore
  const { setIsOpenDialogScanProduct, isShowVirtualKeyboard, setIsShowVirtualKeyboard } = useUserDisplayStore() // prettier-ignore
  const [focusedField, setFocusedField] = useState<FieldInputType>('work_order'); // prettier-ignore
  const [isEnableVirtual, setIsEnableVirtual] = useState(false); // prettier-ignore
  const [tempField, setTempField] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isEnableOutweightRejection, setIsEnableOutweightRejection] = useState(false);

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>();
  const input2Ref = useRef<HTMLInputElement>();
  const input3Ref = useRef<HTMLInputElement>();

  const form = useForm<z.infer<typeof WorkOrderSchema>>({
    resolver: zodResolver(WorkOrderSchema),
    defaultValues: {
      work_order: '',
      formulation_code: '',
      formulation_name: '',
      order_qty: '',
      multiplier: '',
    },
  });

  const {
    setFormulationCode: setFormulationCodeStore,
    setFormulationName: setFormulationNameStore,

    setIsDoneAllRawMaterials,
    setFormulationReports,
    setSelectedFormulationReportLines,
    setFormulationMass,
    setMustFollowOrder,
    setNeedApproval,
    setRequestedMass,
    setTempFormulationCode,
  } = useFormulationReport();

  const { mutate } = useMutation({
    mutationFn: () => {
      return getFormulationCode({ formulationCode });
    },
    onSuccess: async (response) => {
      const isPassedApproval = response.FormulationLines;
      form.setValue(
        'formulation_name',
        response.formulationName,
      );
      toast.success('Successfully get formula code!');
    },
    onError: (error) => {
      console.log('error', error);
      toast.error('Failed get formula code!');
    },
  });

  const {
    mutate: createFormulationReports,
    isPending: isLoadingSubmitWO,
  } = useMutation({
    mutationFn: (
      data: z.infer<typeof WorkOrderSchema>,
    ): any => {
      return createFormulationReportsV2(data);
    },
    onSuccess: (res: RFormulationReports): void => {
      console.log('response form scan', res);
      setNeedApproval(res.needApproval);
      const getOriginalIndexFormulationReportLines = res.FormulationReportLines.findIndex(item => item.approvalStatus == 0 && item.status == 0) // prettier-ignore
      const isDoneAll = getOriginalIndexFormulationReportLines < 0 // prettier-ignore
      const hasUnDoneLists =
        res.FormulationReportLines.filter(
          (item: any) => item.status == 0,
        );

      /**
       * check if status order is waiting for implementation/on progress and need approval is true
       * then show uncompromised pop up (force user to logout)
       */

      const isApprovalHasAProblem = res.FormulationReportLines.some((item) => item.needApproval); // prettier-ignore
      const statusOrder = checkStatusOrder(res.status);

      if (
        ((isEnableOutweightRejection && isApprovalHasAProblem) &&
          statusOrder == 'waiting_implementation' &&
          getUserRole() !== 'Admin') ||
        ((isEnableOutweightRejection && isApprovalHasAProblem) &&
          statusOrder == 'on_progress' &&
          getUserRole() !== 'Admin')
      ) {
        navigate('?is_has_approval_problem=true');
      } else {
        setIsUserScanMaterialReports(true);
        setFormulationReports(res.FormulationReportLines);
        // setFormulationCodeStore(res.formulationCode);
        setFormulationCodeStore(
          form.getValues('work_order'),
        );
        setTempFormulationCode(res.formulationCode);
        setFormulationNameStore(res.formulationName);
        setFormulationMass(res.formulationMass);
        setRequestedMass(res.requestedMass);

        if (res?.mustFollowOrder && getUserRole() !== 'Admin' && !isDoneAll) {
          setMustFollowOrder(res?.mustFollowOrder);
          setIsOpenDialogScanProduct(true);
          navigate(
            `?item=${getOriginalIndexFormulationReportLines}&filter_materials=all`,
          );
          setSelectedFormulationReportLines(
            res.FormulationReportLines[
              getOriginalIndexFormulationReportLines
            ],
          );
        } else if (hasUnDoneLists.length === 0) {
          setMustFollowOrder(res?.mustFollowOrder);
          setIsDoneAllRawMaterials(true);
          setSelectedFormulationReportLines({});
          navigate('/?filter_materials=done');
        } else {
          if (getUserRole() !== 'Admin') {
            setMustFollowOrder(res?.mustFollowOrder);
          }
          navigate('/');
        }
      }

      form.reset();
      toast.success('Work order successfully created!');
    },
    onError: (err) => {
      console.log(err);
      toast.error('Failed to create work order!');
    },
  });

  async function onSubmit(
    data: z.infer<typeof WorkOrderSchema>,
  ) {
    createFormulationReports(data);
  }

  const onChange = (newInput: string) => {
    updateCaretPosition(newInput);
    setTempField(newInput);
    form.setValue(focusedField, newInput);

    switch (focusedField) {
      case 'work_order':
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      default:
        break;
    }
  };

  const handleVirtualKeyboardChange = (txt: string) => {
    onChange(txt);
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  };

  const clearPreviousInput = () => {
    // @ts-expect-error
    keyboard?.current?.clearInput();
  };

  const debouncedFetchData = useCallback(
    debounce(() => {
      mutate();
    }, 500),
    [],
  );

  const handleCurrentFocusField = (
    field: FieldInputType,
  ): void => {
    const initialVal = form.getValues(field);
    // @ts-expect-error
    keyboard?.current.setInput(initialVal);
    if (initialVal == '') {
      setTempField('');
      caretPositionRef.current = 1;
    }
    setFocusedField(field);
    setIsShowVirtualKeyboard(true);
    // clearPreviousInput();
  };

  const updateCaretPosition = (newInput: any) => {
    const newPosition = caretPositionRef.current + (newInput.length - tempField.length); // prettier-ignore
    caretPositionRef.current = newPosition < 0 ? 0 : newPosition; // prettier-ignore
  };

  const onChangeInput = (event: any) => {
    const newInput = event.target.value;
    updateCaretPosition(newInput);

    // Update caret position based on where the user clicks or types
    caretPositionRef.current = event.target.selectionStart;
    if (keyboard.current) {
      // @ts-expect-error
      keyboard.current.setInput(newInput);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  }, [tempField]);

  useEffect(() => {
    if (formulationCode !== '') {
      debouncedFetchData();
    }
  }, [formulationCode]);

  useEffect(() => {
    const handleGetVirtualKeyboardActivation = async () => {
      const isEnableVirtualKeyboard = await store.get<{value: boolean}>('tauri_enable_virtual_keyboard') // prettier-ignore
      setIsEnableVirtual(isEnableVirtualKeyboard!.value);
    };

    const handleGetIsEnableOutweightRejection = async () => {
      const isEnableOutweightRejection = await store.get<{value: boolean}>('tauri_enable_outweight_rejection') // prettier-ignore
      setIsEnableOutweightRejection(isEnableOutweightRejection!.value);
    };

    handleGetIsEnableOutweightRejection();
    handleGetVirtualKeyboardActivation();
  }, []);
  console.log(
    'caretPositionRef.current',
    caretPositionRef.current,
  );

  useEffect(() => {
    if (isShowVirtualKeyboard) {
      setIsPopoverOpen(true);
    }
  }, [isShowVirtualKeyboard]);

  const { data, isLoading } = useQuery({
    queryKey: ['formulation-reports'],
    queryFn: () => getReportFormulationModals(''),
  });

  console.log(data);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog
      defaultOpen={true}
      onOpenChange={() => {
        if (searchParams.get('item')) {
          navigate('?item=0');
        } else {
          navigate(-1);
        }
      }}
    >
      <DialogContent
        className={cn('min-w-[650px]', {
          'flex min-h-[720px] flex-col':
            isShowVirtualKeyboard &&
            isEnableVirtual &&
            true,
        })}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <SendToBack />
            Work Order Execution
          </DialogTitle>
          <DialogDescription>
            Scan Work Order Number, Formulation Code, and
            Order Quantity
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-3"
          >
            <FormField
              control={form.control}
              name="work_order"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                  <FormLabel className="w-full text-lg sm:w-[230px]">
                    Work Order
                  </FormLabel>
                  <div className="w-full sm:w-1/2">
                    <Popover open={isPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            onClick={() =>
                              setIsPopoverOpen(
                                (prev) => !prev,
                              )
                            }
                            className={cn(
                              'h-[50px] w-full justify-between truncate text-[18px] font-normal',
                              !field.value &&
                                'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? data?.rows?.find(
                                  (data: any) =>
                                    data.order_number ===
                                    field.value,
                                )?.order_number ??
                                form.getValues('work_order')
                              : 'Select Work Order'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput
                            // onFocus={() =>
                            //   handleCurrentFocusField(
                            //     'work_order',
                            //   )
                            // }
                            // value={form.getValues(
                            //   'work_order',
                            // )}
                            className="text-[18px]"
                            placeholder="Search..."
                          />
                          <CommandEmpty>
                            No work order found.
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {data?.rows?.map(
                                (row: any) => (
                                  <CommandItem
                                    value={row.orderNumber}
                                    key={row.id}
                                    onSelect={() => {
                                      form.setValue(
                                        'work_order',
                                        row.orderNumber,
                                      );
                                      form.setValue(
                                        'order_qty',
                                        `${row.requestedMass}`,
                                      );
                                      form.setValue(
                                        'formulation_code',
                                        row.formulationCode,
                                      );
                                      form.setValue(
                                        'formulation_name',
                                        row.formulationName,
                                      );
                                      form.setValue(
                                        'multiplier',
                                        `${row.multiplier}`,
                                      );
                                      setIsPopoverOpen(
                                        (prev) => !prev,
                                      );
                                    }}
                                    className="text-[18px]"
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-6 w-6',
                                        row.orderNumber ===
                                          field.value
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                    {row.orderNumber}
                                  </CommandItem>
                                ),
                              )}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </div>
                  <div
                    className="cursor-pointer rounded-sm bg-red-200 p-2"
                    onClick={() => {
                      setTempField('');
                      inputRef.current?.focus();
                      form.setValue('work_order', '');
                      form.setValue('order_qty', '');
                      form.setValue('formulation_code', '');
                      form.setValue('formulation_name', '');
                      form.setValue('multiplier', '');
                      clearPreviousInput();
                    }}
                  >
                    <Trash2 color="red" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formulation_code"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                  <FormLabel className="w-full text-lg sm:w-[230px]">
                    Formulation Code
                  </FormLabel>
                  <div className="w-full sm:w-1/2">
                    <FormControl>
                      <Input
                        placeholder="Formulation Code"
                        disabled
                        className="h-[50px] text-[18px] focus:border focus:border-yellow-400 disabled:border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                  <div className="rounded-sm bg-gray-200 p-2">
                    <Trash2 color="gray" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="formulation_name"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                  <FormLabel className="w-full text-lg sm:w-[230px]">
                    Formulation Name
                  </FormLabel>
                  <div className="w-full sm:w-1/2">
                    <FormControl>
                      <Input
                        placeholder="Formulation Name"
                        disabled
                        className="h-[50px] text-[18px] focus:border focus:border-yellow-400 disabled:border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                  <div className="rounded-sm bg-gray-200 p-2">
                    <Trash2 color="gray" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order_qty"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                  <FormLabel className="w-full text-lg sm:w-[230px]">
                    Order Qty
                  </FormLabel>
                  <div className="w-full sm:w-1/2">
                    <FormControl>
                      <Input
                        placeholder="Order Qty"
                        disabled
                        className="h-[50px] text-[18px] focus:border focus:border-yellow-400 disabled:border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                  <div className="rounded-sm bg-gray-200 p-2">
                    <Trash2 color="gray" />
                  </div>
                </FormItem>
              )}
            />

          <FormField
              control={form.control}
              name="multiplier"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                  <FormLabel className="w-full text-lg sm:w-[230px]">
                    Multiplier
                  </FormLabel>
                  <div className="w-full sm:w-1/2">
                    <FormControl>
                      <Input
                        placeholder="Multiplier"
                        disabled
                        className="h-[50px] text-[18px] focus:border focus:border-yellow-400 disabled:border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                  <div className="rounded-sm bg-gray-200 p-2">
                    <Trash2 color="gray" />
                  </div>
                </FormItem>
              )}
            />

            <Button
              className={cn(
                'flex w-full items-center gap-1 bg-blue-500 py-7 text-[18px] text-white hover:bg-blue-400',
                {
                  'border border-blue-500 bg-white hover:bg-white':
                    isLoadingSubmitWO,
                },
              )}
              type="submit"
            >
              {isLoadingSubmitWO ? (
                <Spinner />
              ) : (
                <>
                  <Play />
                  Start
                </>
              )}
            </Button>
          </form>
        </Form>
        <VirtualKeyboard
          isVisible={isShowVirtualKeyboard && true}
          onChange={handleVirtualKeyboardChange}
          // @ts-expect-error
          keyboardRef={keyboard}
        />
      </DialogContent>
    </Dialog>
  );
}
