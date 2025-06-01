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
import { useMutation } from '@tanstack/react-query';
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

type FieldInputType =
  | 'work_order'
  | 'formulation_code'
  | 'formulation_name'
  | 'order_qty';

export default function FormDialogScanFormula() {
  const store = new Store('.settings.dat');
  const BARCODE_THRESHOLD = 100;
  const location = useLocation();
  const navigate = useNavigate();

  const [formulationCode, setFormulationCode] = useState<string>(''); // prettier-ignore
  const [searchParams, setSearch] = useSearchParams();
  const { setIsUserScanMaterialReports, user } = useUserAuthStore(); // prettier-ignore
  const { setIsOpenDialogScanProduct, isShowVirtualKeyboard, setIsShowVirtualKeyboard } = useUserDisplayStore() // prettier-ignore
  const [input, setInput] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const [inputCode, setInputCode] = useState('');
  const [lastKeyTimeCode, setLastKeyTimeCode] = useState(0);
  const [inputQty, setInputQty] = useState('');
  const [lastKeyTimeQty, setLastKeyTimeQty] = useState(0);
  const [focusedField, setFocusedField] = useState<FieldInputType>('work_order'); // prettier-ignore
  const [isEnableVirtual, setIsEnableVirtual] = useState(false); // prettier-ignore
  const [tempField, setTempField] = useState('');
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
    },
  });

  const {
    setFormulationCode: setFormulationCodeStore,
    setFormulationName: setFormulationNameStore,
    isDoneAllRawMaterials,

    setProductBatchNumber,
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
    mutate: getFormulationsForAdmin,
    data: dataFormulationSuperAdmin,
  } = useMutation({
    mutationFn: () => {
      return getFormulationSuperAdmin();
    },
    onSuccess: async () => {},
    onError: (error) => {
      console.log('error', error);
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

        if (
          res?.mustFollowOrder &&
          getUserRole() !== 'Admin' &&
          !isDoneAll
        ) {
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

      case 'formulation_code':
        setFormulationCode(newInput);
        if (input2Ref.current) {
          input2Ref.current.focus();
          input2Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'order_qty':
        if (input3Ref.current) {
          input3Ref.current.focus();
          input3Ref.current.setSelectionRange(
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

    if (input2Ref.current) {
      input2Ref.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }

    if (input3Ref.current) {
      input3Ref.current.setSelectionRange(
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
    if (getUserRole() == 'Admin') {
      getFormulationsForAdmin();
    }

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
            getUserRole() === 'Admin',
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
                    <FormControl>
                      <Input
                        placeholder="Work Order"
                        className="h-[50px] text-[18px] focus:border focus:border-yellow-400 disabled:border disabled:border-gray-300"
                        onKeyDown={(e) => {
                          if (getUserRole() !== 'Admin') {
                            const currentTime = new Date().getTime(); // prettier-ignore
                            const timeDiff = currentTime - lastKeyTime; // prettier-ignore
                            setLastKeyTime(currentTime);

                            if (
                              e.key === 'Backspace' ||
                              e.key === 'Delete'
                            ) {
                              // Allow backspace and delete keys
                              setInput((prevInput) =>
                                prevInput.slice(0, -1),
                              );
                              return;
                            }

                            if (
                              e.key !== 'Tab' &&
                              timeDiff > BARCODE_THRESHOLD
                            ) {
                              e.preventDefault();
                            } else {
                              if (
                                e.key === 'Backspace' ||
                                e.key === 'Delete'
                              ) {
                                // Allow backspace and delete keys
                                setInput((prevInput) =>
                                  prevInput.slice(0, -1),
                                );
                                return;
                              } else {
                                setInput(
                                  (prevInput) =>
                                    prevInput + e.key,
                                );
                              }
                            }
                          }
                        }}
                        {...field}
                        // onChange={onChangeInput}
                        onClick={onChangeInput}
                        // @ts-expect-error
                        ref={inputRef}
                        onFocus={() =>
                          handleCurrentFocusField(
                            'work_order',
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                  <div
                    className="cursor-pointer rounded-sm bg-red-200 p-2"
                    onClick={() => {
                      setTempField('');
                      inputRef.current?.focus();
                      form.setValue('work_order', '');
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
                        onChangeCapture={(
                          e: ChangeEvent<HTMLInputElement>,
                        ) =>
                          setFormulationCode(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (getUserRole() !== 'Admin') {
                            const currentTime =
                              new Date().getTime();
                            const timeDiff =
                              currentTime - lastKeyTimeCode;
                            setLastKeyTimeCode(currentTime);

                            if (
                              e.key === 'Backspace' ||
                              e.key === 'Delete'
                            ) {
                              // Allow backspace and delete keys
                              setInputCode((prevInput) =>
                                prevInput.slice(0, -1),
                              );
                              return;
                            }

                            if (
                              e.key !== 'Tab' &&
                              timeDiff > BARCODE_THRESHOLD
                            ) {
                              e.preventDefault();
                            } else {
                              if (
                                e.key === 'Backspace' ||
                                e.key === 'Delete'
                              ) {
                                // Allow backspace and delete keys
                                setInputCode((prevInput) =>
                                  prevInput.slice(0, -1),
                                );
                                return;
                              } else {
                                setInputCode(
                                  (prevInput) =>
                                    prevInput + e.key,
                                );
                              }
                            }
                          }
                        }}
                        className="h-[50px] text-[18px] focus:border focus:border-yellow-400"
                        {...field}
                        // @ts-expect-error
                        ref={input2Ref}
                        // onChange={onChangeInput}
                        onClick={onChangeInput}
                        onFocus={() =>
                          handleCurrentFocusField(
                            'formulation_code',
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                  <div
                    className="cursor-pointer rounded-sm bg-red-200 p-2"
                    onClick={() => {
                      setTempField('');
                      input2Ref.current?.focus();
                      form.setValue('formulation_code', '');
                      clearPreviousInput();
                      setFormulationCode('');
                    }}
                  >
                    <Trash2 color="red" />
                  </div>
                </FormItem>
              )}
            />
            {getUserRole() == 'Admin' ? (
              <FormField
                control={form.control}
                name="formulation_name"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                    <FormLabel className="w-full text-lg sm:w-[230px]">
                      Formulation Name
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'h-[50px] w-full justify-between truncate sm:w-1/2',
                              !field.value &&
                                'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? dataFormulationSuperAdmin?.rows?.find(
                                  (data: any) =>
                                    data.formulationName ===
                                    field.value,
                                )?.formulationName
                              : 'Select formulation lists'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Search formulations..." />
                          <CommandEmpty>
                            No formulation found.
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {dataFormulationSuperAdmin?.rows?.map(
                                (language: any) => {
                                  return (
                                    <CommandItem
                                      value={
                                        language.formulationName
                                      }
                                      key={language.id}
                                      onSelect={() => {
                                        form.setValue(
                                          'formulation_name',
                                          language.formulationName,
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          language.formulationName ===
                                            field.value
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      {
                                        language.formulationName
                                      }
                                    </CommandItem>
                                  );
                                },
                              )}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                    <div
                      className="rounded-sm bg-red-200 p-2"
                      onClick={() =>
                        form.setValue(
                          'formulation_name',
                          '',
                        )
                      }
                    >
                      <Trash2 color="red" />
                    </div>
                  </FormItem>
                )}
              />
            ) : (
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
            )}

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
                        className="h-[50px] text-[18px] focus:border focus:border-yellow-400"
                        onKeyDown={(e) => {
                          if (getUserRole() !== 'Admin') {
                            const currentTime = new Date().getTime(); // prettier-ignore
                            const timeDiff = currentTime - lastKeyTimeQty; // prettier-ignore
                            setLastKeyTimeQty(currentTime);

                            if (
                              e.key === 'Backspace' ||
                              e.key === 'Delete'
                            ) {
                              // Allow backspace and delete keys
                              setInputQty((prevInput) =>
                                prevInput.slice(0, -1),
                              );
                              return;
                            }

                            const whitelistedKey = '1234567890,.'; // prettier-ignore
                            if (
                              !whitelistedKey.includes(
                                e.key,
                              )
                            ) {
                              e.preventDefault();
                            } else {
                              setInputQty((prevInput) => {
                                return `${prevInput}${e.key}`;
                              });
                            }
                            return;
                          }
                        }}
                        {...field}
                        // @ts-expect-error
                        ref={input3Ref}
                        // onChange={onChangeInput}
                        onClick={onChangeInput}
                        onFocus={() =>
                          handleCurrentFocusField(
                            'order_qty',
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                  <div
                    className="cursor-pointer rounded-sm bg-red-200 p-2"
                    onClick={() => {
                      setTempField('');
                      input3Ref.current?.focus();
                      form.setValue('order_qty', '');
                      clearPreviousInput();
                    }}
                  >
                    <Trash2 color="red" />
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
          isVisible={
            isShowVirtualKeyboard &&
            getUserRole() === 'Admin'
          }
          onChange={handleVirtualKeyboardChange}
          // @ts-expect-error
          keyboardRef={keyboard}
          typeNumber={focusedField === 'order_qty'}
        />
      </DialogContent>
    </Dialog>
  );
}
