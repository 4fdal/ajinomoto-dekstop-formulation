import { z } from 'zod';
import { useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { decodeObjectFromBase64 } from '~/lib/helpers';
import { useEffect } from 'react';
import { Layers3 } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { ToleranceGroupingLinesSchema } from '~/lib/types/schemas';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { useUserDisplayStore } from '~/lib/store/store';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';
import { Store } from 'tauri-plugin-store-api';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

type FieldInputType =
  | 'lowerRange'
  | 'min'
  | 'max'
  | 'lowerRange'
  | 'upperRange';

export interface InitialValueLine {
  id: string;
  ToleranceGroupingHeaderId: string;
  lowerRange: string;
  upperRange: string;
  toleranceType: string;
  min: string;
  max: string;
  createdAt: Date;
  updatedAt: Date;
}

export function FormToleranceGroupingLines({
  filledToleranceGoupingLines,
  setFilledToleranceGroupingLines,
}: {
  filledToleranceGoupingLines: any;
  setFilledToleranceGroupingLines: any;
}) {
  const store = new Store('.settings.dat');
  const navigate = useNavigate();

  const [focusedField, setFocusedField] = useState('lowerRange'); // prettier-ignore
  const [searchParams, setSearch] = useSearchParams();
  const [isEnableVirtual, setIsEnableVirtual] = useState(false); // prettier-ignore
  const [tempField, setTempField] = useState('');

  const isEditForm = searchParams.get('edit_tolerance_grouping_lines') // prettier-ignore
  const linesId = searchParams.get('lines_id') // prettier-ignore
  const initialValueEditToleranceLines = searchParams.get('q_tolerance_lines') // prettier-ignore
  const editToleranceGrouping = searchParams.get('edit_tolerance_grouping_lines') // prettier-ignore

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const inputRef1 = useRef<HTMLInputElement>();
  const inputRef2 = useRef<HTMLInputElement>();
  const inputRef3 = useRef<HTMLInputElement>();
  const inputRef4 = useRef<HTMLInputElement>();

  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore();

  const form = useForm<
    z.infer<typeof ToleranceGroupingLinesSchema>
  >({
    resolver: zodResolver(ToleranceGroupingLinesSchema),
    defaultValues: {
      lowerRange: '',
      upperRange: '',
      toleranceType: '',
      min: '',
      max: '',
    },
  });

  const handleVirtualKeyboardChange = (txt: string) => {
    console.log('txt', txt);
    if (txt == '') {
      txt = '';
    }

    // switch (focusedField) {
    //   case 'lowerRange':
    //     form.setValue('lowerRange', txt);
    //     break;
    //   case 'upperRange':
    //     form.setValue('upperRange', txt);
    //     break;
    //   case 'min':
    //     form.setValue('min', txt);
    //     break;
    //   case 'max':
    //     form.setValue('max', txt);
    //     break;

    //   default:
    //     break;
    // }
    onChange(txt);
  };

  const clearPreviousInput = () => {
    // @ts-expect-error
    keyboard?.current?.clearInput();
  };

  const handleCurrentFocusField = (
    field: FieldInputType,
  ): void => {
    const initialVal = form.getValues(field);
    // @ts-expect-error
    keyboard?.current.setInput(initialVal?.toString());
    if (initialVal == '') {
      setTempField('');
      caretPositionRef.current = 0;
    }
    setFocusedField(field);
    setIsShowVirtualKeyboard(true);
    // clearPreviousInput();
  };

  async function onSubmit(
    data: z.infer<typeof ToleranceGroupingLinesSchema>,
  ) {
    console.log('data', data);
    console.log('filled', filledToleranceGoupingLines);
    const parsedData = {
      lowerRange: parseInt(data.lowerRange),
      upperRange: parseInt(data.upperRange),
      toleranceType: data.toleranceType,
      min: parseInt(data.min),
      max: parseInt(data.max),
    };

    if (editToleranceGrouping == 'true') {
      setFilledToleranceGroupingLines((prevData: any) => {
        const parsedResult = {
          lowerRange: parseInt(data.lowerRange),
          upperRange: parseInt(data.upperRange),
          toleranceType: data.toleranceType,
          min: parseInt(data.min),
          max: parseInt(data.max),
        };

        const filteredData = prevData.filter((_: any, i: number) => i !== parseInt(linesId!)) // prettier-ignore
        return [...filteredData, parsedResult];
      });
    } else {
      setFilledToleranceGroupingLines((prevData: any) => {
        console.log('prevdata state', prevData);

        const parsedPrevious = prevData.map((item: any) => {
          return {
            lowerRange: parseInt(item.lowerRange),
            upperRange: parseInt(item.upperRange),
            toleranceType: item.toleranceType,
            min: parseInt(item.min),
            max: parseInt(item.max),
          };
        });

        console.log('after parsed', parsedPrevious);

        return [...parsedPrevious, parsedData];
      });
      toast.success(
        'Successfully added tolerance grouping lines!',
      );
    }
    form.reset();
    navigate(-1);
  }

  const formErrors = form.formState.errors;

  const onChange = (newInput: string) => {
    updateCaretPosition(newInput);
    setTempField(newInput);
    // @ts-expect-error
    form.setValue(focusedField, newInput);

    switch (focusedField) {
      case 'lowerRange':
        if (inputRef1.current) {
          inputRef1.current.focus();
          inputRef1.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'upperRange':
        if (inputRef2.current) {
          inputRef2.current.focus();
          inputRef2.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'min':
        if (inputRef3.current) {
          inputRef3.current.focus();
          inputRef3.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'max':
        if (inputRef4.current) {
          inputRef4.current.focus();
          inputRef4.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      default:
        break;
    }
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
    if (inputRef1.current) {
      inputRef1.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }

    if (inputRef2.current) {
      inputRef2.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  }, [tempField]);

  useEffect(() => {
    const handleGetVirtualKeyboardActivation = async () => {
      const isEnableVirtualKeyboard = await store.get<{value: boolean}>('tauri_enable_virtual_keyboard') // prettier-ignore
      setIsEnableVirtual(isEnableVirtualKeyboard!.value);
    };

    handleGetVirtualKeyboardActivation();
  }, []);

  useEffect(() => {
    if (editToleranceGrouping == 'true') {
      const initialValuesEditToleranceGroupings = decodeObjectFromBase64(initialValueEditToleranceLines) as InitialValueLine; // prettier-ignore

      form.setValue(
        'lowerRange',
        initialValuesEditToleranceGroupings.lowerRange.toString(),
      );
      form.setValue(
        'upperRange',
        initialValuesEditToleranceGroupings.upperRange.toString(),
      );
      form.setValue(
        'max',
        initialValuesEditToleranceGroupings.max.toString(),
      );
      form.setValue(
        'min',
        initialValuesEditToleranceGroupings.min.toString(),
      );
      form.setValue(
        'toleranceType',
        initialValuesEditToleranceGroupings.toleranceType,
      );
    }
  }, [initialValueEditToleranceLines]);

  return (
    <Dialog
      defaultOpen
      onOpenChange={() => {
        setIsShowVirtualKeyboard(false);
        navigate(-1);
      }}
    >
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={cn('min-w-[600px]', {
          'flex min-h-[730px] flex-col':
            isShowVirtualKeyboard && isEnableVirtual,
        })}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers3 />
            {isEditForm == 'true'
              ? 'Edit Tolerance Grouping Lines'
              : 'Tolerance Grouping Lines'}
          </DialogTitle>
          <DialogDescription>
            {isEditForm == 'true'
              ? "Edit tolerance grouping lines, click save once you're done"
              : "Add new tolerance grouping lines, Click save once you're done"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-3"
          >
            <section className="flex w-full flex-col justify-between gap-3">
              <FormField
                control={form.control}
                name="lowerRange"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Lower Range</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              formErrors.lowerRange,
                          },
                        )}
                        {...field}
                        // @ts-expect-error
                        ref={inputRef1}
                        onChange={onChangeInput}
                        onClick={onChangeInput}
                        onFocus={() =>
                          handleCurrentFocusField(
                            'lowerRange',
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="upperRange"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Upper Range</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              formErrors.upperRange,
                          },
                        )}
                        {...field}
                        // @ts-expect-error
                        ref={inputRef2}
                        onChange={onChangeInput}
                        onClick={onChangeInput}
                        onFocus={() =>
                          handleCurrentFocusField(
                            'upperRange',
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toleranceType"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Tolerance Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder="Select Tolerance Type" />
                          ) : (
                            'Select Tolerance Type'
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="mass">
                          Mass
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Min</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              formErrors.min,
                          },
                        )}
                        {...field}
                        // @ts-expect-error
                        ref={inputRef3}
                        onChange={onChangeInput}
                        onClick={onChangeInput}
                        onFocus={() =>
                          handleCurrentFocusField('min')
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Max</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              formErrors.max,
                          },
                        )}
                        {...field}
                        // @ts-expect-error
                        ref={inputRef4}
                        onChange={onChangeInput}
                        onClick={onChangeInput}
                        onFocus={() =>
                          handleCurrentFocusField('max')
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <div className="flex w-full justify-end">
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-400"
              >
                {isEditForm == 'true'
                  ? 'Edit Lines'
                  : 'Save Lines'}
              </Button>
            </div>
          </form>
        </Form>
        <VirtualKeyboard
          isVisible={isShowVirtualKeyboard}
          onChange={handleVirtualKeyboardChange}
          // @ts-expect-error
          keyboardRef={keyboard}
          typeNumber
        />
      </DialogContent>
    </Dialog>
  );
}
