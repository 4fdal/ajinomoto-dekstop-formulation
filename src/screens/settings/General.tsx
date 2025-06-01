import Spinner from '~/components/Spinner';

import { Switch } from '~/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SettingsFormSchema } from '~/lib/types/schemas';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Store } from 'tauri-plugin-store-api';
import { useEffect, useState, useRef } from 'react';

import {
  getActualDurationSetting,
  getDefaultTauriStore,
} from '~/lib/helpers';

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

import {
  useFormulationReport,
  useUserDisplayStore,
} from '~/lib/store/store';

type FocusedFieldType =
  | 'scale_url'
  | 'service_url'
  | 'printer_url'
  | 'application_id'
  | 'fractional_digit'
  | 'auto_save_time_weight_in_tolerance'
  | 'websocket_url'
  | 'enable_overweight_protection'
  | 'auto_save_time_weight_out_of_tolerance'
  | 'enable_scan_product_code'

export function General() {
  const store = new Store('.settings.dat');
  const [focusedField, setFocusedField] = useState('username'); // prettier-ignore
  const [startFocus, setStartFocus] = useState(false); // prettier-ignore
  const { setAppFractionalDigit } = useFormulationReport();
  const { setIsShowVirtualKeyboard, isShowVirtualKeyboard } = useUserDisplayStore() // prettier-ignore
  const [tempField, setTempField] = useState('');

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const input1Ref = useRef<HTMLInputElement>();
  const input2Ref = useRef<HTMLInputElement>();
  const input3Ref = useRef<HTMLInputElement>();
  const input4Ref = useRef<HTMLInputElement>();
  const input5Ref = useRef<HTMLInputElement>();
  const input6Ref = useRef<HTMLInputElement>();
  const input7Ref = useRef<HTMLInputElement>();
  const input8Ref = useRef<HTMLInputElement>();

  const form = useForm<z.infer<typeof SettingsFormSchema>>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      scale_url: '',
      websocket_url: '',
      service_url: '',
      printer_url: '',
      application_id: '',
      fractional_digit: 1,
      implement_auto_save_time_weight_in_tolerance: 'yes',
      auto_save_time_weight_in_tolerance: 3000,
      implement_auto_save_time_weight_out_of_tolerance: 'yes', // prettier-ignore
      auto_save_time_weight_out_of_tolerance: 3000,
      enable_virtual_keyboard: false,
      implement_manual_work_order: false,
      enable_client_creation: false,
      enable_outweight_rejection: false,
      enable_scan_product_code: false,
    },
  });

  const [isPendingSave, setIsPendingSave] = useState<boolean>(false) // prettier-ignore
  const errors = form.formState.errors;

  async function onSubmit(
    data: z.infer<typeof SettingsFormSchema>,
  ) {
    setStartFocus(false);
    setIsPendingSave(true);
    const storeData = [
      {
        key: 'tauri_formulation_scale_url',
        value: data.scale_url,
      },
      {
        key: 'tauri_formulation_service_url',
        value: data.service_url,
      },
      {
        key: 'tauri_formulation_websocket_url',
        value: data.websocket_url,
      },
      {
        key: 'tauri_printer_url',
        value: data.printer_url,
      },
      {
        key: 'tauri_application_id',
        value: data.application_id,
      },
      {
        key: 'tauri_fractional_digit',
        value: data.fractional_digit,
      },
      {
        key: 'tauri_implement_auto_save_time_weight_in_tolerance',
        value: data.implement_auto_save_time_weight_in_tolerance, // prettier-ignore
      },
      {
        key: 'tauri_auto_save_time_weight_in_tolerance',
        value: data.auto_save_time_weight_in_tolerance,
      },
      {
        key: 'tauri_implement_auto_save_time_weight_out_of_tolerance',
        value: data.implement_auto_save_time_weight_out_of_tolerance, // prettier-ignore
      },
      {
        key: 'tauri_auto_save_time_weight_out_of_tolerance',
        value: data.auto_save_time_weight_out_of_tolerance,
      },
      {
        key: 'tauri_enable_virtual_keyboard',
        value: data.enable_virtual_keyboard,
      },
      {
        key: 'tauri_implement_manual_work_order',
        value: data.implement_manual_work_order,
      },
      {
        key: 'tauri_enable_client_creation',
        value: data.enable_client_creation,
      },
      {
        key: 'tauri_enable_outweight_rejection',
        value: data.enable_outweight_rejection,
      },
      {
        key: 'tauri_enable_overweight_protection',
        value: data.enable_overweight_protection,
      },
      {
        key: 'tauri_enable_scan_product_code',
        value: data.enable_scan_product_code,
      },
    ] as const;

    try {
      for (const item of storeData) {
        await store.set(item.key, { value: item.value });
      }
      await store.save();
      toast.success('Successfully saved settings!');
      setAppFractionalDigit(data.fractional_digit);
      setIsShowVirtualKeyboard(
        data.enable_virtual_keyboard,
      );
      setIsPendingSave(false);
    } catch (error) {
      toast.error('Something must be wrong!');
      setIsPendingSave(false);
    }
  }

  const act = getActualDurationSetting(
    form.getValues(
      'auto_save_time_weight_out_of_tolerance',
    ),
  );

  const handleVirtualKeyboardChange = (txt: string) => {
    if (txt == '') {
      txt = '';
    }

    // switch (focusedField) {
    //   case 'scale_url':
    //     form.setValue('scale_url', txt);
    //     break;
    //   case 'service_url':
    //     form.setValue('service_url', txt);
    //     break;
    //   case 'printer_url':
    //     form.setValue('printer_url', txt);
    //     break;
    //   case 'application_id':
    //     form.setValue('application_id', txt);
    //     break;
    //   case 'fractional_digit':
    //     form.setValue('fractional_digit', parseInt(txt));
    //     break;
    //   case 'auto_save_time_weight_in_tolerance':
    //     form.setValue(
    //       'auto_save_time_weight_in_tolerance',
    //       parseInt(txt),
    //     );
    //     break;
    //   case 'auto_save_time_weight_out_of_tolerance':
    //     form.setValue(
    //       'auto_save_time_weight_out_of_tolerance',
    //       parseInt(txt),
    //     );
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

  // const handleCurrentFocusField = (
  //   field: FocusedFieldType,
  // ): void => {
  //   const initialVal = form.getValues(field);
  //   // @ts-expect-error
  //   keyboard?.current.setInput(initialVal?.toString());
  //   setFocusedField(field);
  //   setIsShowVirtualKeyboard(true);
  //   setStartFocus(true);
  //   // clearPreviousInput();
  // };

  const onChange = (newInput: string) => {
    updateCaretPosition(newInput);
    setTempField(newInput);
    // @ts-expect-error
    form.setValue(focusedField, newInput);

    switch (focusedField) {
      case 'scale_url':
        if (input1Ref.current) {
          input1Ref.current.focus();
          input1Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;
      case 'service_url':
        if (input2Ref.current) {
          input2Ref.current.focus();
          input2Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;
      case 'printer_url':
        if (input3Ref.current) {
          input3Ref.current.focus();
          input3Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;
      case 'application_id':
        if (input4Ref.current) {
          input4Ref.current.focus();
          input4Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;
      case 'fractional_digit':
        if (input5Ref.current) {
          input5Ref.current.focus();
          input5Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;
      case 'auto_save_time_weight_in_tolerance':
        if (input6Ref.current) {
          input6Ref.current.focus();
          input6Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;
      case 'auto_save_time_weight_out_of_tolerance':
        if (input7Ref.current) {
          input7Ref.current.focus();
          input7Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'websocket_url':
        if (input8Ref.current) {
          input8Ref.current.focus();
          input8Ref.current.setSelectionRange(
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
  }, [tempField]);

  useEffect(() => {
    const getDefaultSettingsValue = async () => {
      const scaleUrl = await getDefaultTauriStore<{ value: string }>('tauri_formulation_scale_url') // prettier-ignore
      const websocketUrl = await getDefaultTauriStore<{ value:string }>('tauri_formulation_websocket_url') // prettier-ignore
      const serviceUrl = await getDefaultTauriStore<{ value:string }>('tauri_formulation_service_url') // prettier-ignore
      const printerUrl = await getDefaultTauriStore<{ value:string }>('tauri_printer_url') // prettier-ignore
      const applicationId = await getDefaultTauriStore<{ value: string }>('tauri_application_id') // prettier-ignore
      const fractionalDigit = await getDefaultTauriStore<{ value: number }>('tauri_fractional_digit') // prettier-ignore
      const implementAutoSaveWeightInTolerance = await getDefaultTauriStore<{ value: string }>('tauri_implement_auto_save_time_weight_in_tolerance') // prettier-ignore
      const autoSaveTimeWeightInTolerance = await getDefaultTauriStore<{ value: number }>('tauri_auto_save_time_weight_in_tolerance') // prettier-ignore
      const implementAutoSaveWeightOutOfTolerance = await getDefaultTauriStore<{ value: string }>('tauri_implement_auto_save_time_weight_out_of_tolerance') // prettier-ignore
      const autoSaveTimeWeightOutOfTolerance = await getDefaultTauriStore<{ value: number }>('tauri_auto_save_time_weight_out_of_tolerance') // prettier-ignore
      const isEnableVirtualKeyboard = await getDefaultTauriStore<{ value: boolean }>('tauri_enable_virtual_keyboard') // prettier-ignore
      const isEnableManualWorkOrder = await getDefaultTauriStore<{ value: boolean }>('tauri_implement_manual_work_order') // prettier-ignore
      const isEnableClientCreation = await getDefaultTauriStore<{ value: boolean }>('tauri_enable_client_creation') // prettier-ignore
      const isEnableOutweightRejection = await getDefaultTauriStore<{ value: boolean }>('tauri_enable_outweight_rejection') // prettier-ignore
      const isEnableScanProductCode = await getDefaultTauriStore<{ value: boolean }>('tauri_enable_scan_product_code') // prettier-ignore
      const isEnableOverweightProtection = await getDefaultTauriStore<{ value: boolean }>('tauri_enable_overweight_protection') // prettier-ignore
      setIsShowVirtualKeyboard(
        isEnableVirtualKeyboard.value,
      );

      form.setValue('scale_url', scaleUrl.value);
      form.setValue('websocket_url', websocketUrl.value);
      form.setValue('service_url', serviceUrl.value);
      form.setValue('printer_url', printerUrl.value);
      form.setValue('application_id', applicationId.value);
      form.setValue(
        'fractional_digit',
        fractionalDigit.value,
      );
      form.setValue(
        'implement_auto_save_time_weight_in_tolerance',
        implementAutoSaveWeightInTolerance.value,
      );
      form.setValue(
        'auto_save_time_weight_in_tolerance',
        autoSaveTimeWeightInTolerance.value,
      );
      form.setValue(
        'implement_auto_save_time_weight_out_of_tolerance',
        implementAutoSaveWeightOutOfTolerance.value,
      );
      form.setValue(
        'auto_save_time_weight_out_of_tolerance',
        autoSaveTimeWeightOutOfTolerance.value,
      );
      form.setValue(
        'enable_virtual_keyboard',
        isEnableVirtualKeyboard.value,
      );
      form.setValue(
        'implement_manual_work_order',
        isEnableManualWorkOrder.value,
      );
      form.setValue(
        'enable_client_creation',
        isEnableClientCreation.value,
      );
      form.setValue(
        'enable_outweight_rejection',
        isEnableOutweightRejection.value,
      );
      form.setValue(
        'enable_overweight_protection',
        isEnableOverweightProtection.value,
      );
      form.setValue(
        'enable_scan_product_code',
        isEnableScanProductCode.value,
      );
    };

    getDefaultSettingsValue();
  }, []);

  return (
    <>
      <section
        className={cn(
          'relative h-full overflow-y-auto pb-20',
          {
            'pb-[280px]':
              isShowVirtualKeyboard && startFocus,
          },
        )}
      >
        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="mb-4 w-full space-y-4 pr-3 pt-3"
          >
            <FormField
              control={form.control}
              name="enable_virtual_keyboard"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Virtual Keyboard
                    </FormLabel>
                    <FormDescription>
                      Feature to enable virtual keyboard
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
              name="implement_manual_work_order"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Manual Work Order
                    </FormLabel>
                    <FormDescription>
                      Feature to enable manual work order
                      pop up
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
              name="enable_client_creation"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Client Creation
                    </FormLabel>
                    <FormDescription>
                      Feature to enable modifying server data from client. Should be turned off when using syncronizer.
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
              name="enable_outweight_rejection"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Outweight Rejection
                    </FormLabel>
                    <FormDescription>
                      Feature to enable rejection when saved weight is over tolerable value.
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
              name="enable_overweight_protection"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Over Weight Protection
                    </FormLabel>
                    <FormDescription>
                      Can't save more than tolerance weight.
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
              name="enable_scan_product_code"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Scan Product Code
                    </FormLabel>
                    <FormDescription>
                      Feature to give validation of product code before start weighing
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
              name="scale_url"
              render={({ field }) => (
                <FormItem className="flex w-full items-center">
                  <FormLabel className="w-1/2">
                    Scale URL
                  </FormLabel>
                  <div className="w-1/2">
                    <FormControl>
                      <Input
                        placeholder="http://localhost:3011/ws?CODE=248"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              errors.scale_url,
                          },
                        )}
                        {...field}
                        // ref={input1Ref}
                        // onChange={onChangeInput}
                        // onClick={onChangeInput}
                        // onFocus={() =>
                        //   handleCurrentFocusField(
                        //     'scale_url',
                        //   )
                        // }
                      />
                    </FormControl>
                    <FormDescription>
                      Your scale service url
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="websocket_url"
              render={({ field }) => (
                <FormItem className="flex w-full items-center">
                  <FormLabel className="w-1/2">
                    Websocket URL
                  </FormLabel>
                  <div className="w-1/2">
                    <FormControl>
                      <Input
                        placeholder="http://localhost:3007/ws"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              errors.scale_url,
                          },
                        )}
                        {...field}
                        // ref={input8Ref}
                        // onChange={onChangeInput}
                        // onClick={onChangeInput}
                        // onFocus={() =>
                        //   handleCurrentFocusField(
                        //     'websocket_url',
                        //   )
                        // }
                      />
                    </FormControl>
                    <FormDescription>
                      Your scale service url
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_url"
              render={({ field }) => (
                <FormItem className="flex w-full items-center">
                  <FormLabel className="w-1/2">
                    Service URL
                  </FormLabel>
                  <div className="w-1/2">
                    <FormControl>
                      <Input
                        placeholder="http://localhost:3004"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              errors.service_url,
                          },
                        )}
                        {...field}
                        // ref={input2Ref}
                        // onChange={onChangeInput}
                        // onClick={onChangeInput}
                        // onFocus={() =>
                        //   handleCurrentFocusField(
                        //     'service_url',
                        //   )
                        // }
                      />
                    </FormControl>
                    <FormDescription>
                      Your service url to retreive data
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="printer_url"
              render={({ field }) => (
                <FormItem className="flex w-full items-center">
                  <FormLabel className="w-1/2">
                    Printer URL
                  </FormLabel>
                  <div className="w-1/2">
                    <FormControl>
                      <Input
                        placeholder="http://localhost:3004"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              errors.printer_url,
                          },
                        )}
                        {...field}
                        // ref={input3Ref}
                        // onChange={onChangeInput}
                        // onClick={onChangeInput}
                        // onFocus={() =>
                        //   handleCurrentFocusField(
                        //     'printer_url',
                        //   )
                        // }
                      />
                    </FormControl>
                    <FormDescription>
                      Your printer url to print your
                      transaction
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="application_id"
              render={({ field }) => (
                <FormItem className="flex w-full items-center">
                  <FormLabel className="w-1/2">
                    Application ID
                  </FormLabel>
                  <div className="w-1/2">
                    <FormControl>
                      <Input
                        placeholder="01/04"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              errors.application_id,
                          },
                        )}
                        {...field}
                        // ref={input4Ref}
                        // onChange={onChangeInput}
                        // onClick={onChangeInput}
                        // onFocus={() =>
                        //   handleCurrentFocusField(
                        //     'application_id',
                        //   )
                        // }
                      />
                    </FormControl>
                    <FormDescription>
                      Your application ID
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fractional_digit"
              render={({ field }) => (
                <FormItem className="flex w-full items-center">
                  <FormLabel className="w-1/2">
                    Fractional Digit
                  </FormLabel>
                  <div className="w-1/2">
                    <FormControl>
                      <Input
                        placeholder="1"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              errors.fractional_digit,
                          },
                        )}
                        {...field}
                        // ref={input5Ref}
                        // onChange={onChangeInput}
                        // onClick={onChangeInput}
                        // onFocus={() =>
                        //   handleCurrentFocusField(
                        //     'fractional_digit',
                        //   )
                        // }
                      />
                    </FormControl>
                    <FormDescription>
                      Your fractional digit
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="implement_auto_save_time_weight_in_tolerance"
              render={({ field }) => (
                <FormItem className="flex w-full items-center">
                  <FormLabel className="w-1/2">
                    Implement Auto Save Time - Weight in
                    Tolerance
                  </FormLabel>
                  <div className="w-1/2">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a verified email to display" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">
                          Yes
                        </SelectItem>
                        <SelectItem value="no">
                          No
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Implement auto save when weight is in
                      tolerance
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auto_save_time_weight_in_tolerance"
              render={({ field }) => (
                <FormItem className="flex w-full items-center">
                  <FormLabel className="w-1/2">
                    Auto Save Time - Weight in Tolerance
                    <span className="text-gray-400">
                      {' '}
                      (
                      {getActualDurationSetting(
                        form.getValues(
                          'auto_save_time_weight_in_tolerance',
                        ) / 1000,
                      )}
                      )
                    </span>
                  </FormLabel>
                  <div className="w-1/2">
                    <FormControl>
                      <Input
                        placeholder="3000"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              errors.scale_url,
                          },
                        )}
                        {...field}
                        // ref={input6Ref}
                        // onChange={onChangeInput}
                        // onClick={onChangeInput}
                        // onFocus={() =>
                        //   handleCurrentFocusField(
                        //     'auto_save_time_weight_in_tolerance',
                        //   )
                        // }
                      />
                    </FormControl>
                    <FormDescription>
                      Auto save time when weight is in
                      tolerance, in milliseconds (ms)
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="implement_auto_save_time_weight_out_of_tolerance"
              render={({ field }) => (
                <FormItem className="flex w-full items-center">
                  <FormLabel className="w-1/2">
                    Implement Auto Save Time - Weight out of
                    Tolerance
                  </FormLabel>
                  <div className="w-1/2">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a verified email to display" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">
                          Yes
                        </SelectItem>
                        <SelectItem value="no">
                          No
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Implement auto save when weight is{' '}
                      <span className="font-bold text-red-500">
                        out of tolerance
                      </span>{' '}
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auto_save_time_weight_out_of_tolerance"
              render={({ field }) => (
                <FormItem className="flex w-full items-center">
                  <FormLabel className="w-1/2">
                    Auto Save Time - Weight in Tolerance{' '}
                    <span className="text-gray-400">
                      {' '}
                      (
                      {getActualDurationSetting(
                        form.getValues(
                          'auto_save_time_weight_out_of_tolerance',
                        ) / 1000,
                      )}
                      )
                    </span>
                  </FormLabel>
                  <div className="w-1/2">
                    <FormControl>
                      <Input
                        placeholder="3000"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              errors.scale_url,
                          },
                        )}
                        {...field}
                        // onChange={onChangeInput}
                        // onClick={onChangeInput}
                        // onFocus={() =>
                        //   handleCurrentFocusField(
                        //     'auto_save_time_weight_out_of_tolerance',
                        //   )
                        // }
                      />
                    </FormControl>
                    <FormDescription>
                      Auto save time when weight is{' '}
                      <span className="font-bold text-red-500">
                        out of tolerance,
                      </span>{' '}
                      in milliseconds (ms)
                    </FormDescription>
                    <FormMessage />
                  </div>
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
      </section>

      <VirtualKeyboard
        isVisible={isShowVirtualKeyboard && startFocus}
        onChange={handleVirtualKeyboardChange}
        // @ts-expect-error
        keyboardRef={keyboard}
        typeNumber={
          focusedField === 'fractional_digit' ||
          focusedField === 'application_id' ||
          focusedField ===
            'auto_save_time_weight_in_tolerance' ||
          focusedField ===
            'auto_save_time_weight_out_of_tolerance'
        }
      />
    </>
  );
}
