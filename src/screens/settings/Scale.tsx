import Spinner from '~/components/Spinner';

import { getScalesAction } from '~/actions/settings.action';
import { useEffect, useRef, useState } from 'react';
import { getDefaultTauriStore } from '~/lib/helpers';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { Store } from 'tauri-plugin-store-api';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { useUserDisplayStore } from '~/lib/store/store';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';
import { connectToScaleWebSocket, connectWithIndex } from '~/actions/websocket.action';

type FocusedFieldType = any

const ScaleObjectSchema = z.object({
  ID: z.number(),
  ConnectionType: z.string(),
  Name: z.string(),
  Port: z.string().optional(),
  Baudrate: z.string().optional(),
  Databit: z.number().optional(),
  Parity: z.string().optional(),
  IP: z.string().optional(),
  Delimiter: z.string(),
  FractionDigit: z.string(),
  Unit: z.string(),
  TareCommand: z.string().optional(),
  ZeroCommand: z.string().optional(),
  ClearCommand: z.string().optional(),
  PrintCommand: z.string().optional(),
  ScaleCategory: z.string(),
});

const FormSchema = z.object({
  scales: z.array(ScaleObjectSchema).optional(),
  number_of_scale: z.coerce
    .number()
    .min(1, { message: 'Number of scale must be filled' }),
});

export function Scale() {
  const store = new Store('.settings.dat');
  const [isPendingSave, setIsPendingSave] = useState(false);
  const [isPendingZero, setIsPendingZero] = useState(false);
  const [isPendingSpan, setIsPendingSpan] = useState(false);
  const [startFocus, setStartFocus] = useState(false); // prettier-ignore
  const [focusedField, setFocusedField] = useState('username'); // prettier-ignore
  const { setIsShowVirtualKeyboard, isShowVirtualKeyboard } = useUserDisplayStore() // prettier-ignore
  const [tempField, setTempField] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [spanValue, setSpanValue] = useState('');
  const [zeroScaleTarget, setZeroScaleTarget] = useState('');

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const input1Ref = useRef<HTMLInputElement>();
  const input2Ref = useRef<HTMLInputElement>();
  const input3Ref = useRef<HTMLInputElement>();

  const { data, isError } = useQuery({
    queryKey: ['scales'],
    queryFn: () => getScalesAction(),
  });

  if (isError) {
    toast.error('Failed to retreive scale device!');
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      number_of_scale: 1,
    },
  });
  const errors = form.formState.errors;

  async function onSubmit(
    data: z.infer<typeof FormSchema>,
  ) {
    setIsPendingSave(true);

    try {
      const numberOfScales = Number(data.number_of_scale);
      const slicedScales = Array.isArray(data.scales)
        ? data.scales.slice(0, numberOfScales)
        : [];
      store.set('tauri_formulation_scale_device', {
        value: slicedScales, // Use the sliced scales here
      });
      store.set('tauri_formulation_number_of_scale', {
        value: numberOfScales,
      });
      await store.save();
      toast.success('Successfully save scale device!');
      setIsPendingSave(false);
    } catch (error) {
      toast.error('Failed to save scale device!');
      setIsPendingSave(true);
      console.log(error);
    }
  }

  const updateCaretPosition = (newInput: any) => {
    const newPosition = caretPositionRef.current + (newInput.length - tempField.length); // prettier-ignore
    caretPositionRef.current = newPosition < 0 ? 0 : newPosition; // prettier-ignore
  };

  const handleCurrentFocusField = (
    field: FocusedFieldType,
  ): void => {
    const initialVal = form.getValues(field);
    // @ts-expect-error
    keyboard?.current.setInput(initialVal?.toString());
    setFocusedField(field);
    setIsShowVirtualKeyboard(true);
    setStartFocus(true);
    // clearPreviousInput();
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
    if (input1Ref.current) {
      input1Ref.current.setSelectionRange(
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
    const getDefaultSettingValue = async () => {
      setIsLoading(true);
      const scaleDevices = await getDefaultTauriStore<{
        value: any[];
      }>('tauri_formulation_scale_device');

      const numberOfScale = await getDefaultTauriStore<{
        value: number;
      }>('tauri_formulation_number_of_scale');

      form.setValue('scales', scaleDevices.value);
      form.setValue('number_of_scale', numberOfScale.value);
    };
    
    getDefaultSettingValue().finally(() => {
      setIsLoading(false);
    })
  }, []);

  const handleVirtualKeyboardChange = (txt: string) => {
    if (txt == '') {
      txt = '';
    }
    onChange(txt);
  };

  const zeroCallib = async () => {
    setIsPendingZero(true)
    try {
      const closeFunction = (error: boolean) => {
        try {
          if (error) {
            toast.error("Gagal melakukan zero")
          } else {
            toast.success("Zero sukses, lanjut span")
          }
        } finally {
          setIsPendingZero(false)
        }
      }
      await connectWithIndex(Number(zeroScaleTarget) - 1, "ZCL@", closeFunction)
    } finally {
    }
  }

  const spanCallib = () => {
    setIsPendingSpan(true)
    const closeFunction = (error: boolean) => {
      try {
        if (error) {
          toast.error("Gagal melakukan span")
        } else {
          toast.success("span sukses, kalibrasi selesai")
        }
      } finally {
        setIsPendingSpan(false)
      }
    }
    connectWithIndex(Number(zeroScaleTarget) - 1, `SCL@${spanValue}`, closeFunction)
  }


  const onChange = (newInput: string) => {
    updateCaretPosition(newInput);
    setTempField(newInput);
    // @ts-expect-error
    form.setValue(focusedField, newInput);

    switch (focusedField) {
      case 'number_of_scale':
        if (input1Ref.current) {
          input1Ref.current.focus();
          input1Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;
      case 'zero_scale_target':
        if (input2Ref.current) {
          input2Ref.current.focus();
          input2Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        setZeroScaleTarget(newInput)
        break;
      case 'span_value':
        if (input3Ref.current) {
          input3Ref.current.focus();
          input3Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        setSpanValue(newInput)
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Render a loading state
  }

  return (
    <>
      <section
        className={cn(
          'relative h-full overflow-y-auto pb-20',
          {
            'pb-[280px]': isShowVirtualKeyboard,
          },
        )}
      >
        <div className="mt-3">
          <Form {...form}>
            <form
              autoComplete={'off'}
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6 pl-3 pr-5"
            >
              <FormField
                control={form.control}
                name="number_of_scale"
                render={({ field }) => (
                  <FormItem className="flex w-full items-center">
                    <FormLabel className="w-1/2">
                      Number Of Scale
                      <FormDescription>
                        Total scale that want to be
                        connected.
                      </FormDescription>
                    </FormLabel>
                    <div className="w-1/2">
                      <FormControl>
                        <Input
                          className={cn(
                            'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500',
                            {
                              'focus:border-pink-500 focus:ring-pink-500':
                                errors.number_of_scale,
                            },
                          )}
                          {...field}
                          // ref={input1Ref}
                          // onChange={onChangeInput}
                          // onClick={onChangeInput}
                          // onFocus={() =>
                          //   handleCurrentFocusField(
                          //     'number_of_scale',
                          //   )
                          // }
                        />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              {Array.from({
                length: form.watch('number_of_scale'),
              }).map((_, idx) => (
                <FormField
                  key={idx}
                  control={form.control}
                  name={`scales.${idx}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`Select Scale ${idx + 1}`}</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          // Parse the JSON string back to an object
                          const selectedScale =
                            JSON.parse(value);
                          field.onChange(selectedScale); // Set the selected scale object
                        }}
                        defaultValue={
                          field.value
                            ? JSON.stringify(field.value)
                            : ''
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            {field.value &&
                            field.value.Name ? (
                              <h1>{`${field.value.Name} - ${field.value.ConnectionType == 'Serial' ? field.value.Port : field.value.IP}`}</h1>
                            ) : (
                              <SelectValue placeholder="Select scale device to connect" />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {data?.length === 0 ? (
                            <div className="p-3 text-center">
                              There is no scale available
                            </div>
                          ) : (
                            <>
                              {data?.map(
                                (
                                  scale: any,
                                  index: number,
                                ) => (
                                  <SelectItem
                                    key={index}
                                    value={JSON.stringify(
                                      scale,
                                    )} // Store the whole object as a string
                                  >
                                    {scale.Name}
                                    {' - '}
                                    {scale.ConnectionType ===
                                    'Serial'
                                      ? scale.Port
                                      : scale.IP}
                                  </SelectItem>
                                ),
                              )}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value
                          ? `Your selected scale is ${field.value.Name}`
                          : "You haven't selected a scale yet"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button
                className={cn(
                  'z-30 w-full bg-blue-500 text-base text-white hover:bg-blue-400',
                  {
                    'border border-blue-500 bg-white hover:bg-white':
                      isPendingSave,
                  },
                )}
                type="submit"
              >
                {isPendingSave ? <Spinner /> : 'Save'}
              </Button>
            </form>
          </Form>
          <div className={cn(
              'z-30 w-full flex flex-col gap-5 mt-5 justify-end items-end '
            )}>
          <Input
            placeholder='Nomor urut timbangan'
            value={zeroScaleTarget}
            // ref={input2Ref}
            onChange={onChangeInput}
            onClick={onChangeInput}
            onFocus={() =>
              handleCurrentFocusField(
                'zero_scale_target',
              )
            }
            className={cn(
              'w-1/4 mr-5 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ',
            )}
          />
          <Button
            onClick={zeroCallib}
            className={cn(
              'z-30 w-1/4 bg-blue-500 text-base text-white hover:bg-blue-400 mr-5 ml-5 active:bg-opacity-70',
            )}
            type="button"
          >
            {isPendingZero ? <Spinner /> : 'Zero'}
          </Button>
          <Input
            value={spanValue}
            // ref={input3Ref}
            onFocus={() =>
              handleCurrentFocusField(
                'span_value',
              )
            }
            onChange={onChangeInput}
            onClick={onChangeInput}
            placeholder='Nilai berat span'
            className={cn(
              'w-1/4 mr-5 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ',
            )}
          />
          <Button
            onClick={spanCallib}
            className={cn(
              'z-30 w-1/4 bg-blue-500 text-base text-white hover:bg-blue-400 mr-5 ml-5 active:bg-opacity-70'
            )}
            type="button"
          >
            {isPendingSpan ? <Spinner /> : 'Span'}
          </Button>
          </div>
        </div>
      </section>
      <VirtualKeyboard
        isVisible={isShowVirtualKeyboard && startFocus}
        onChange={handleVirtualKeyboardChange}
        // @ts-expect-error
        keyboardRef={keyboard}
        typeNumber={true}
      />
    </>
  );
}
