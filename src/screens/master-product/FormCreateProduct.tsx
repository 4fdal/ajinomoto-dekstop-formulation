import { z } from 'zod';
import { SmallSpinner } from '~/components/Spinner';
import { Input } from '~/components/ui/input';
import { useUserDisplayStore } from '~/lib/store/store';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';
import { ProductSchema } from '~/lib/types/schemas';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { Play, Package, FileCog } from 'lucide-react';
import { getUnits } from '~/actions/units.action';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { RUnits } from '~/lib/types/responses';
import { Button } from '~/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { decodeObjectFromBase64 } from '~/lib/helpers';
import { Store } from 'tauri-plugin-store-api';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  createProductWeightBridge,
  editProductWeightBridge,
} from '~/actions/product.action';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';

export function FormCreateProduct() {
  const store = new Store('.settings.dat');
  const navigate = useNavigate();

  const [focusedField, setFocusedField] = useState('name');
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEnableVirtual, setIsEnableVirtual] = useState(false); // prettier-ignore
  const [tempField, setTempField] = useState('');

  const isOpenEditProduct = searchParams.get('edit_product'); // prettier-ignore
  const initialValueEditFormulationParam = searchParams.get('q') // prettier-ignore
  const initialValueEditId = searchParams.get('id') // prettier-ignore
  const queryClient = useQueryClient();

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const inputProductNameRef = useRef<HTMLInputElement>();
  const inputProductCodeRef = useRef<HTMLInputElement>();

  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore();

  const { data } = useQuery({
    queryKey: ['units'],
    queryFn: () => getUnits(),
  });

  const { mutate, isPending } = useMutation({
    // @ts-ignore
    mutationFn: (data: {
      code: string;
      name: string;
      unit_id: string;
    }) => {
      if (isOpenEditProduct == 'true') {
        return editProductWeightBridge(data, initialValueEditId) // prettier-ignore
      } else {
        return createProductWeightBridge(data);
      }
    },
    onSuccess: (_) => {
      setIsShowVirtualKeyboard(false);
      if (isOpenEditProduct == 'true') {
        toast.success('Successfully edit material!');
        navigate(-1);
      } else {
        toast.success('Successfully created new material!');
        navigate(-1);
      }
      queryClient.invalidateQueries({
        queryKey: ['master_products'],
      });
      form.reset();
    },
    onError: (_) => {
      console.log(_);
      toast.error('Failed to create new material!');
    },
  });

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      code: '',
      unit_id: '',
    },
  });

  async function onSubmit(
    data: z.infer<typeof ProductSchema>,
  ) {
    mutate(data);
  }

  const handleVirtualKeyboardChange = (txt: string) => {
    // switch (focusedField) {
    //   case 'name':
    //     form.setValue('name', txt);
    //     break;
    //   case 'code':
    //     form.setValue('code', txt);
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
    field: 'name' | 'code',
  ): void => {
    const initialVal = form.getValues(field);
    // @ts-expect-error
    keyboard?.current.setInput(initialVal);
    if (initialVal == '') {
      setTempField('');
      caretPositionRef.current = 0;
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
      case 'name':
        if (inputProductNameRef.current) {
          inputProductNameRef.current.focus();
          inputProductNameRef.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'code':
        if (inputProductCodeRef.current) {
          inputProductCodeRef.current.focus();
          inputProductCodeRef.current.setSelectionRange(
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
    if (inputProductNameRef.current) {
      inputProductNameRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }

    if (inputProductCodeRef.current) {
      inputProductCodeRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  }, [tempField]);

  useEffect(() => {
    if (isOpenEditProduct) {
      const initialValues = decodeObjectFromBase64(
        initialValueEditFormulationParam,
      ) as any;

      form.setValue('name', initialValues.name);
      form.setValue('code', initialValues.code);
      form.setValue('unit_id', initialValues.Unit.id);
    }
  }, [initialValueEditFormulationParam]);

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
      <DialogContent
        className={cn('min-w-[600px]', {
          'flex min-h-[660px] flex-col':
            isShowVirtualKeyboard && isEnableVirtual,
        })}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isOpenEditProduct == 'true' ? (
              <FileCog />
            ) : (
              <Package />
            )}
            {isOpenEditProduct == 'true'
              ? 'Edit'
              : 'Add New'}{' '}
            Material
          </DialogTitle>
          <DialogDescription>
            {isOpenEditProduct == 'true'
              ? 'Edit'
              : 'Create'}{' '}
            material, Click save once you're done
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn('w-full space-y-3')}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Material Name</FormLabel>
                  <FormControl>
                    <Input
                      aria-autocomplete="none"
                      placeholder="Material Name"
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            form.formState.errors.name,
                        },
                      )}
                      {...field}
                      // @ts-expect-error
                      ref={inputProductNameRef}
                      onChange={onChangeInput}
                      onClick={onChangeInput}
                      onFocus={() =>
                        handleCurrentFocusField('name')
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Product Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Product Code"
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            form.formState.errors.code,
                        },
                      )}
                      {...field}
                      // @ts-expect-error
                      ref={inputProductCodeRef}
                      onChange={onChangeInput}
                      onClick={onChangeInput}
                      onFocus={() =>
                        handleCurrentFocusField('code')
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl
                      className={cn('', {
                        'border border-pink-500 text-red-500':
                          form.formState.errors.unit_id,
                      })}
                    >
                      <SelectTrigger>
                        {field.value ? (
                          <SelectValue placeholder="Select unit" />
                        ) : (
                          'Select unit'
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {data?.rows?.map((item: RUnits) => (
                        <SelectItem
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex w-full justify-end">
              <Button
                type="submit"
                className={cn(
                  'flex w-[160px] gap-2 bg-blue-500 hover:bg-blue-400',
                  {
                    'border border-blue-500 bg-white hover:bg-white':
                      isPending,
                  },
                )}
              >
                <Play
                  className={cn('w-5', {
                    hidden: isPending,
                  })}
                />
                {isPending ? (
                  <SmallSpinner />
                ) : isOpenEditProduct == 'true' ? (
                  'Edit Material'
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </form>
        </Form>
        <VirtualKeyboard
          isVisible={isShowVirtualKeyboard}
          onChange={handleVirtualKeyboardChange}
          // @ts-expect-error
          keyboardRef={keyboard}
          typeNumber={focusedField === 'order_qty'}
        />
      </DialogContent>
    </Dialog>
  );
}
