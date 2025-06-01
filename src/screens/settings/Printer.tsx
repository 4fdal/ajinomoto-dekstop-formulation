import Spinner from '~/components/Spinner';

import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '~/components/ui/textarea';
import { getPrinterAction } from '~/actions/settings.action';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Switch } from '~/components/ui/switch';
import { z } from 'zod';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Store } from 'tauri-plugin-store-api';
import { getDefaultTauriStore } from '~/lib/helpers';
import { useEffect, useState, useRef } from 'react';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';
import { useUserDisplayStore } from '~/lib/store/store';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';

const FormSchema = z.object({
  enable_printing: z.boolean(),
  type_printer: z.string(),
  printer_device: z.string(),
  printing_template: z.string(),
});

export function Printer() {
  const store = new Store('.settings.dat');

  const [focusedField, setFocusedField] = useState('username'); // prettier-ignore
  const [isPendingSave, setIsPendingSave] = useState<boolean>(false) // prettier-ignore
  const [tempField, setTempField] = useState('');

  const { setIsShowVirtualKeyboard, isShowVirtualKeyboard } = useUserDisplayStore() // prettier-ignore
  const { data, isError } = useQuery({
    queryKey: ['printers'],
    queryFn: () => getPrinterAction(),
  });

  const typePC = data?.data?.pc;
  const typeRs232 = data?.data?.rs232;

  if (isError) {
    toast.error('Failed to retreive printer device!');
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      enable_printing: false,
      type_printer: '',
      printer_device: '',
      printing_template: '',
    },
  });

  const errors = form.formState.errors;
  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const input1Ref = useRef<HTMLInputElement>();

  async function onSubmit(
    data: z.infer<typeof FormSchema>,
  ) {
    setIsPendingSave(true);
    const storeData = [
      {
        key: 'tauri_formulation_enable_printing',
        value: data.enable_printing,
      },
      {
        key: 'tauri_formulation_type_printer',
        value: data.type_printer,
      },
      {
        key: 'tauri_formulation_printer_device',
        value: data.printer_device,
      },
      {
        key: 'tauri_printing_template',
        value: data.printing_template,
      },
    ] as const;

    try {
      for (const item of storeData) {
        await store.set(item.key, { value: item.value });
      }
      await store.save();
      toast.success('Successfully saved settings!');
      setIsPendingSave(false);
    } catch (error) {
      toast.error('Something must be wrong!');
      setIsPendingSave(false);
    }
  }

  const handleVirtualKeyboardChange = (txt: string) => {
    if (txt == '') {
      txt = '';
    }

    onChange(txt);
  };

  const onChange = (newInput: string) => {
    updateCaretPosition(newInput);
    setTempField(newInput);
    // @ts-expect-error
    form.setValue(focusedField, newInput);

    switch (focusedField) {
      case 'printing_template':
        if (input1Ref.current) {
          input1Ref.current.focus();
          input1Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      default:
        break;
    }
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

  const updateCaretPosition = (newInput: any) => {
    const newPosition = caretPositionRef.current + (newInput.length - tempField.length); // prettier-ignore
    caretPositionRef.current = newPosition < 0 ? 0 : newPosition; // prettier-ignore
  };

  const clearPreviousInput = (): void => {
    // @ts-expect-error
    keyboard?.current?.clearInput();
  };

  const handleCurrentFocusField = (field: any): void => {
    const initialVal = form.getValues(field);
    // @ts-expect-error
    keyboard?.current.setInput(initialVal?.toString());
    setFocusedField(field);
    setIsShowVirtualKeyboard(true);
    // clearPreviousInput();
  };

  const handleOnEnterPress = (button: string) => {
    if (button === '{enter}') {
      const previousPrintingTemplate = form.getValues(
        'printing_template',
      );
      form.setValue(
        'printing_template',
        `${previousPrintingTemplate}\n`,
      );
      // @ts-expect-error
      keyboard?.current.setInput(
        `${previousPrintingTemplate}\n`,
      );
    }
  };

  useEffect(() => {
    const getDefaultSettingsValue = async () => {
      const isEnablePrinting = await getDefaultTauriStore<{ value: boolean }>('tauri_formulation_enable_printing') // prettier-ignore
      const typePrinter = await getDefaultTauriStore<{ value: string }>('tauri_formulation_type_printer') // prettier-ignore
      const printerDevice = await getDefaultTauriStore<{ value: string }>('tauri_formulation_printer_device') // prettier-ignore
      const printingTemplate = await getDefaultTauriStore<{ value: string }>('tauri_printing_template') // prettier-ignore

      form.setValue(
        'enable_printing',
        isEnablePrinting.value,
      );
      form.setValue(
        'printing_template',
        printingTemplate.value,
      );
      form.setValue('type_printer', typePrinter.value);
      form.setValue('printer_device', printerDevice.value);
    };

    getDefaultSettingsValue();
  }, []);

  useEffect(() => {
    if (input1Ref.current) {
      input1Ref.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  }, [tempField]);

  return (
    <>
      <Form {...form}>
        <form
          autoComplete={'off'}
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-3 flex w-full flex-col gap-3 space-y-2 pr-3"
        >
          <FormField
            control={form.control}
            name="enable_printing"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Enable Printing Feature
                  </FormLabel>
                  <FormDescription>
                    Feature to enable printing on the app
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type_printer"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div className="w-1/2">
                  <FormLabel className="text-base">
                    Type Printer
                  </FormLabel>
                  <FormDescription>
                    Choose your type printer (PC/Serial)
                  </FormDescription>
                </div>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-[400px]">
                    <SelectTrigger>
                      {form.getValues('type_printer') ===
                        'PC' ||
                      form.getValues('type_printer') ===
                        'SERIAL' ? (
                        <span>
                          {form.getValues('type_printer')}
                        </span>
                      ) : (
                        <SelectValue placeholder="Select your printer device" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="SERIAL">
                      Serial
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="printer_device"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div className="w-1/2">
                  <FormLabel className="text-base">
                    Select Printer
                  </FormLabel>
                  <FormDescription>
                    Select available printer
                  </FormDescription>
                </div>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-[400px]">
                    <SelectTrigger>
                      {form.getValues('printer_device') !==
                      '' ? (
                        <span>
                          {form.getValues('printer_device')}
                        </span>
                      ) : (
                        <SelectValue placeholder="Select your printer device" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(form.getValues('type_printer') == 'PC'
                      ? typePC
                      : typeRs232
                    )?.map((printer: string) => (
                      <SelectItem
                        key={printer}
                        value={printer}
                      >
                        {printer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="printing_template"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Printing Template</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write down here how your output printing looks like"
                    className="min-h-[180px] resize-y"
                    {...field}
                    // @ts-expect-error
                    ref={input1Ref}
                    // onChange={onChangeInput}
                    onClick={onChangeInput}
                    onFocus={() => {
                      handleCurrentFocusField(
                        'printing_template',
                      );
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Your printing template. Modify it and
                  click save once you've done
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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

      <VirtualKeyboard
        isVisible={isShowVirtualKeyboard}
        onChange={handleVirtualKeyboardChange}
        // @ts-expect-error
        keyboardRef={keyboard}
        onKeyPressed={handleOnEnterPress}
      />
    </>
  );
}
