import Spinner from '~/components/Spinner';

import { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { decodeObjectFromBase64 } from '~/lib/helpers';
import { useUserDisplayStore } from '~/lib/store/store';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { ToleranceGroupingSchema } from '~/lib/types/schemas';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { FilePlus2 } from 'lucide-react';
import { ToleranceGroupingLines } from '~/lib/types/types';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';

import {
  createMasterToleranceGrouping,
  editMasterToleranceGrouping,
} from '~/actions/tolerance.action';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

type FocusedFieldType =
  | 'groupingName'
  | 'defaultMin'
  | 'defaultMax';

export function FormCreateToleranceGrouping({
  filledToleranceGoupingLines,
  setFilledToleranceGroupingLines,
}: {
  filledToleranceGoupingLines: ToleranceGroupingLines[];
  setFilledToleranceGroupingLines: React.Dispatch<
    React.SetStateAction<ToleranceGroupingLines[]>
  >;
}) {
  const navigate = useNavigate();

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>();
  const input2Ref = useRef<HTMLInputElement>();
  const input3Ref = useRef<HTMLInputElement>();

  const [dataEditId, setDataEditId] = useState('');
  const [searchParams, setSearch] = useSearchParams();
  const [focusedField, setFocusedField] = useState('name');
  const [tempField, setTempField] = useState('');

  const isEditForm = searchParams.get('edit_tolerance_grouping') // prettier-ignore
  const isCreateForm = searchParams.get('create_tolerance_grouping_lines') // prettier-ignore
  const initalValuesEditToleranceGrouping = searchParams.get('q') // prettier-ignore

  const form = useForm<
    z.infer<typeof ToleranceGroupingSchema>
  >({
    resolver: zodResolver(ToleranceGroupingSchema),
    defaultValues: {
      groupingName: '',
      defaultMax: '',
      defaultMin: '',
      toleranceType: '',
    },
  });

  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore();

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => {
      if (isEditForm == 'true') {
        return editMasterToleranceGrouping(
          data as any,
          dataEditId,
        );
      } else {
        return createMasterToleranceGrouping(data as unknown as any) // prettier-ignore
      }
    },
    onSuccess: (res) => {
      navigate(-1);
      if (res?.edit) {
        return toast.success(
          'Successfully edit tolerance grouping',
        );
      }
      toast.success(
        'Successfully created new tolerance grouping',
      );

      form.reset();
      setIsShowVirtualKeyboard(false);
    },
    onError: (err) => {
      console.log(err);
      toast.error(
        'Failed to create new tolerance grouping',
      );
    },
  });

  const handleVirtualKeyboardChange = (txt: string) => {
    if (txt == '') {
      txt = '';
    }
    // switch (focusedField) {
    //   case 'groupingName':
    //     form.setValue('groupingName', txt);
    //     break;
    //   case 'defaultMin':
    //     form.setValue('defaultMin', txt);
    //     break;
    //   case 'defaultMax':
    //     form.setValue('defaultMax', txt);
    //     break;

    //   default:
    //     break;
    // }
    onChange(txt);
  };

  const clearPreviousInput = (): void => {
    // @ts-expect-error
    keyboard?.current?.clearInput();
  };

  const handleCurrentFocusField = (
    field: FocusedFieldType,
  ): void => {
    const initialVal = form.getValues(field);
    // @ts-expect-error
    keyboard?.current.setInput(initialVal?.toString());
    if (initialVal == '') {
      setTempField('');
      caretPositionRef.current = 1;
    }
    setFocusedField(field);
    setIsShowVirtualKeyboard(true);
    // clearPreviousInput();
  };

  async function onSubmit(
    data: z.infer<typeof ToleranceGroupingSchema>,
  ) {
    const rebuildBody = {
      groupingName: data.groupingName,
      defaultMin: parseInt(data.defaultMin),
      defaultMax: parseInt(data.defaultMax),
      defaultToleranceType: data.toleranceType,
      ToleranceGroupingLines: filledToleranceGoupingLines,
    };
    mutate(rebuildBody as unknown as any);
  }

  const formErrors = form.formState.errors;

  const onChange = (newInput: string) => {
    updateCaretPosition(newInput);
    setTempField(newInput);
    // @ts-expect-error
    form.setValue(focusedField, newInput);

    switch (focusedField) {
      case 'groupingName':
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'defaultMin':
        if (input2Ref.current) {
          input2Ref.current.focus();
          input2Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'defaultMax':
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
    if (isEditForm == 'true') {
      const initialValues = decodeObjectFromBase64(initalValuesEditToleranceGrouping) as any; // prettier-ignore
      setDataEditId(initialValues.id);
      setFilledToleranceGroupingLines(
        initialValues.ToleranceGroupingLines as any,
      );

      form.setValue(
        'groupingName',
        initialValues.groupingName,
      );
      form.setValue(
        'defaultMin',
        initialValues.defaultMin.toString(),
      );
      form.setValue(
        'defaultMax',
        initialValues.defaultMax.toString(),
      );
      form.setValue(
        'toleranceType',
        initialValues.defaultToleranceType,
      );
    }
  }, []);

  return (
    <>
      <Form {...form}>
        <form
          autoComplete="off"
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-9 flex h-full w-full gap-2"
        >
          <section className="flex w-full flex-col space-y-4">
            <FormField
              control={form.control}
              name="groupingName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Grouping Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Grouping Name"
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            formErrors.groupingName,
                        },
                      )}
                      {...field}
                      onChange={onChangeInput}
                      onClick={onChangeInput}
                      // @ts-expect-error
                      ref={inputRef}
                      onFocus={() =>
                        handleCurrentFocusField(
                          'groupingName',
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
              name="defaultMin"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Default Min</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Default Min"
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            formErrors.defaultMin,
                        },
                      )}
                      {...field}
                      onChange={onChangeInput}
                      onClick={onChangeInput}
                      // @ts-expect-error
                      ref={input2Ref}
                      onFocus={() =>
                        handleCurrentFocusField(
                          'defaultMin',
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="flex w-full flex-col items-end space-y-4">
            <FormField
              control={form.control}
              name="defaultMax"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Default Max</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Default Max"
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            formErrors.defaultMax,
                        },
                      )}
                      {...field}
                      onChange={onChangeInput}
                      onClick={onChangeInput}
                      // @ts-expect-error
                      ref={input3Ref}
                      onFocus={() =>
                        handleCurrentFocusField(
                          'defaultMax',
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
                    value={field.value}
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

            <Button
              type="submit"
              disabled={
                filledToleranceGoupingLines.length == 0
              }
              className={cn(
                'absolute right-4 top-20 w-[100px] bg-blue-500 hover:bg-blue-400',
                {
                  'border border-blue-500 bg-white':
                    isPending,
                },
              )}
            >
              {isPending ? (
                <Spinner />
              ) : isEditForm == 'true' ? (
                'Edit'
              ) : (
                'Save'
              )}
            </Button>

            <Button
              type="button"
              onClick={() =>
                navigate(
                  '?create_tolerance_grouping_lines=true',
                )
              }
              className={cn(
                'mt-[51px] flex w-[200px] items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:cursor-not-allowed',
                {
                  hidden: isEditForm,
                },
              )}
            >
              <FilePlus2 size={20} />
              Add Grouping Lines
            </Button>
          </section>
        </form>
      </Form>
      <VirtualKeyboard
        isVisible={isShowVirtualKeyboard && !isCreateForm}
        onChange={handleVirtualKeyboardChange}
        // @ts-expect-error
        keyboardRef={keyboard}
        typeNumber={focusedField !== 'groupingName'}
      />
    </>
  );
}
