import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { decodeObjectFromBase64 } from '~/lib/helpers';
import { FlaskConical, Ellipsis } from 'lucide-react';
import { useUserDisplayStore } from '~/lib/store/store';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { getToleranceAction } from '~/actions/tolerance.action';
import { getProductWeightBridgesAction } from '~/actions/product.action';
import { Button } from '~/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '~/components/ui/input';
import { FormulationLinesSchema } from '~/lib/types/schemas';
import { Switch } from '~/components/ui/switch';
import { Textarea } from '~/components/ui/textarea';
import { Store } from 'tauri-plugin-store-api';

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  IBodyFormulationLines,
  IProductWeightBridge,
  IToleranceGroupings,
} from '~/lib/types/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

type FieldInputType =
  | 'targetMass'
  | 'min'
  | 'max'
  | 'maxAllowedWeighingQty'
  | 'instruction';

export function FormFormulationLines({
  // filledFormulationLines,
  setFormulationLines,
}: {
  setFormulationLines: React.Dispatch<
    React.SetStateAction<IBodyFormulationLines[]>
  >;
  filledFormulationLines: any;
}) {
  const store = new Store('.settings.dat');
  const navigate = useNavigate();
  const location = useLocation();

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>();
  const input2Ref = useRef<HTMLInputElement>();
  const input3Ref = useRef<HTMLInputElement>();
  const input4Ref = useRef<HTMLInputElement>();
  const input5Ref = useRef<HTMLInputElement>();

  const [focusedField, setFocusedField] = useState('name');
  const [isEnableVirtual, setIsEnableVirtual] = useState(false); // prettier-ignore
  const [searchParams, setSearch] = useSearchParams();
  const [tempField, setTempField] = useState('');

  const isEditForm = searchParams.get('edit_formulation_lines') // prettier-ignore
  const linesId = searchParams.get('lines_id') // prettier-ignore
  const initialValuesEditFormulationParam = searchParams.get('q') // prettier-ignore
  const initialValueEditFormulationLineParam = searchParams.get('q_formulation_lines') // prettier-ignore

  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore();

  const form = useForm<
    z.infer<typeof FormulationLinesSchema>
  >({
    resolver: zodResolver(FormulationLinesSchema),
    defaultValues: {
      implementToleranceGrouping: false,
      productCode: '',
      productName: '',
      min: '',
      max: '',
      toleranceType: '',
      instruction: '',
      maxAllowedWeighingQty: '',
      targetMass: '',
      toleranceGroupingHeaderId: '',
    },
  });

  const { data: toleranceGroupings } = useQuery({
    queryKey: ['tolerance_grouping'],
    queryFn: () => getToleranceAction(),
  });

  const { data: productWeightBridge } = useQuery({
    queryKey: ['product-weight-bridge'],
    queryFn: () => getProductWeightBridgesAction(),
  });

  async function onSubmit(
    data: z.infer<typeof FormulationLinesSchema>,
  ) {
    if (isEditForm == 'true') {
      setFormulationLines((prevData: any) => {
        const filteredData = prevData.filter((_: any, i: number) => i !== parseInt(linesId!)); // prettier-ignore
        return [...filteredData, data];
      });

      toast.success(
        'Formulation lines edited successfully!',
      );
    } else {
      setFormulationLines((prevData: any) => [
        ...prevData,
        data,
      ]);

      toast.success(
        'Formulation lines added successfully!',
      );
    }
    form.reset();
    navigate(-1);
  }
  const isFilledProductCode = form.getValues();

  const handleVirtualKeyboardChange = (txt: string) => {
    if (txt == '' && focusedField !== 'instruction') {
      txt = '';
    }

    // switch (focusedField) {
    //   case 'targetMass':
    //     form.setValue('targetMass', txt);
    //     break;
    //   case 'min':
    //     form.setValue('min', txt);
    //     break;
    //   case 'max':
    //     form.setValue('max', txt);
    //     break;
    //   case 'maxAllowedWeighingQty':
    //     form.setValue('maxAllowedWeighingQty', txt);
    //     break;
    //   case 'instruction':
    //     form.setValue('instruction', txt);
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
      caretPositionRef.current = 1;
    }
    setFocusedField(field);
    setIsShowVirtualKeyboard(true);
    // clearPreviousInput();
  };

  const onChange = (newInput: string) => {
    updateCaretPosition(newInput);
    setTempField(newInput);
    // @ts-expect-error
    form.setValue(focusedField, newInput);

    switch (focusedField) {
      case 'targetMass':
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'min':
        if (input2Ref.current) {
          input2Ref.current.focus();
          input2Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'max':
        console.log('lorem ipsum');
        if (input3Ref.current) {
          input3Ref.current.focus();
          input3Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'maxAllowedWeighingQty':
        if (input4Ref.current) {
          input4Ref.current.focus();
          input4Ref.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'instruction':
        if (input5Ref.current) {
          input5Ref.current.focus();
          input5Ref.current.setSelectionRange(
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

    if (input4Ref.current) {
      input4Ref.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }

    if (input5Ref.current) {
      input5Ref.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  }, [tempField]);

  useEffect(() => {
    if (isFilledProductCode.productCode !== '') {
      // search productWeightBridge where productWeightBridge is equal to isFilledProductCode.productCode
      const val = productWeightBridge?.rows.find((item: IProductWeightBridge) => item.code == isFilledProductCode.productCode) // prettier-ignore
      form.setValue('productName', val?.name);
    }
  }, [isFilledProductCode]);

  useEffect(() => {
    if (isEditForm == 'true') {
      const initialValues = decodeObjectFromBase64(
        initialValueEditFormulationLineParam,
      ) as IBodyFormulationLines;

      form.setValue(
        'implementToleranceGrouping',
        initialValues.implementToleranceGrouping,
      );

      form.setValue(
        'toleranceGroupingHeaderId',
        initialValues.toleranceGroupingHeaderId,
      );

      form.setValue(
        'productName',
        initialValues.productName,
      );

      form.setValue(
        'productCode',
        initialValues.productCode,
      );

      form.setValue(
        'targetMass',
        initialValues.targetMass.toString(),
      );

      form.setValue(
        'toleranceType',
        initialValues.toleranceType,
      );

      form.setValue('min', initialValues.min.toString());
      form.setValue('max', initialValues.max.toString());

      form.setValue(
        'maxAllowedWeighingQty',
        initialValues.maxAllowedWeighingQty.toString(),
      );

      form.setValue(
        'instruction',
        initialValues.instruction,
      );
    }
  }, [initialValueEditFormulationLineParam]);

  useEffect(() => {
    const handleGetVirtualKeyboardActivation = async () => {
      const isEnableVirtualKeyboard = await store.get<{value: boolean}>('tauri_enable_virtual_keyboard') // prettier-ignore
      setIsEnableVirtual(isEnableVirtualKeyboard!.value);
    };

    handleGetVirtualKeyboardActivation();
  }, []);

  return (
    <Dialog
      defaultOpen
      onOpenChange={() => {
        setIsShowVirtualKeyboard(false);
        navigate(-1);
      }}
    >
      <DialogContent className={cn('min-w-[800px]')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical />
            {isEditForm == 'true'
              ? 'Edit Formulation Lines'
              : 'Formulation Lines'}
          </DialogTitle>
          <DialogDescription>
            {isEditForm == 'true'
              ? "Edit formulation lines, click save once you're done"
              : "Brand new formulation lines, Click save once you're done"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn('w-full space-y-3', {
              '': focusedField == 'max',
            })}
          >
            <section className="flex w-full justify-between gap-3">
              <FormField
                control={form.control}
                name="productCode"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Material</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder="Select Material" />
                          ) : (
                            'Select Material'
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productWeightBridge?.rows?.map(
                          (item: IProductWeightBridge) => (
                            <SelectItem
                              key={item.id}
                              value={item.code}
                            >
                              {item.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetMass"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Target Mass</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        className="w-full"
                        {...field}
                        onChange={onChangeInput}
                        onClick={onChangeInput}
                        // @ts-expect-error
                        ref={inputRef}
                        onFocus={() =>
                          handleCurrentFocusField(
                            'targetMass',
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="flex w-full justify-between gap-3">
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
                name="implementToleranceGrouping"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>
                      Implement Tolerance Grouping
                    </FormLabel>
                    <Select
                      onValueChange={(val) =>
                        field.onChange(val === 'yes')
                      }
                      value={field.value ? 'yes' : 'no'}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="flex w-full justify-between gap-3">
              <FormField
                control={form.control}
                name="min"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Minimum Tolerance</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="100"
                        className="w-full"
                        {...field}
                        onChange={onChangeInput}
                        onClick={onChangeInput}
                        // @ts-expect-error
                        ref={input2Ref}
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
                name="toleranceGroupingHeaderId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>
                      Tolerance Grouping Name
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder="Select Tolerance Grouping" />
                          ) : (
                            'Select Tolerance Grouping'
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="p0">
                        {toleranceGroupings?.rows?.map(
                          (item: IToleranceGroupings) => (
                            <SelectItem
                              key={item.id}
                              value={item.id}
                            >
                              {item.groupingName}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section
              className={cn('hidden w-full', {
                'flex w-full items-center justify-center':
                  isShowVirtualKeyboard &&
                  focusedField === 'instruction',
              })}
            >
              <Ellipsis />
            </section>

            <section
              className={cn(
                'flex w-full justify-between gap-3',
                {
                  'h-[120px]':
                    (isShowVirtualKeyboard &&
                      focusedField === 'max') ||
                    (isShowVirtualKeyboard &&
                      focusedField ===
                        'maxAllowedWeighingQty'),
                  hidden:
                    isShowVirtualKeyboard &&
                    focusedField === 'instruction',
                },
              )}
            >
              <FormField
                control={form.control}
                name="max"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Maximum Tolerance</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="200"
                        className="w-full"
                        {...field}
                        onChange={onChangeInput}
                        onClick={onChangeInput}
                        // @ts-expect-error
                        ref={input3Ref}
                        onFocus={() =>
                          handleCurrentFocusField('max')
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAllowedWeighingQty"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>
                      Max Allowed Weighing QTY
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Max Allowed Weighing Qty"
                        className="w-full"
                        {...field}
                        onChange={onChangeInput}
                        onClick={onChangeInput}
                        // @ts-expect-error
                        ref={input4Ref}
                        onFocus={() =>
                          handleCurrentFocusField(
                            'maxAllowedWeighingQty',
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section
              className={cn(
                'flex w-full justify-between gap-3',
                {
                  'h-[300px]':
                    isShowVirtualKeyboard &&
                    focusedField === 'instruction',
                },
              )}
            >
              <FormField
                control={form.control}
                name="instruction"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Instruction</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Weighing Instruction"
                        {...field}
                        onChange={onChangeInput}
                        onClick={onChangeInput}
                        // @ts-expect-error
                        ref={input5Ref}
                        onFocus={() =>
                          handleCurrentFocusField(
                            'instruction',
                          )
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
                {isEditForm == 'true' ? 'Edit' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
        <VirtualKeyboard
          isVisible={isShowVirtualKeyboard}
          onChange={handleVirtualKeyboardChange}
          // @ts-expect-error
          keyboardRef={keyboard}
          typeNumber={focusedField !== 'instruction'}
        />
      </DialogContent>
    </Dialog>
  );
}
