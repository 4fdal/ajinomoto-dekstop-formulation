import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FileCheck2, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { useEffect, useState, useRef } from 'react';
import { extractStringForProductCode } from '~/lib/helpers';

import {
  useFormulationReport,
  useUserDisplayStore,
} from '~/lib/store/store';

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

const FormSchema = z.object({
  product_code: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  product_name: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  product_scan_code: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
});

export default function DialogScanProductCodeManual() {
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef(null);
  const [input, setInput] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const [inputCode, setInputCode] = useState('');
  const [lastKeyTimeCode, setLastKeyTimeCode] = useState(0);
  const [newReactHookFormVal, setNewReactHookFormVal] = useState('') // prettier-ignore
  const BARCODE_THRESHOLD = 100;

  const {
    setIsAdminScannedProductCode,
    setIsOpenDialogScanProduct,
    isOpenDialogScanProduct,
  } = useUserDisplayStore();

  const {
    mustFollowOrder,
    selectedFormulationReportLines,
    productBatchNumber,

    setScanProductCode,
    setProductBatchNumber,
  } = useFormulationReport();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      product_code: '',
      product_name: '',
      product_scan_code: '',
    },
  });

  const handleClearScanProduct = () => {
    form.setValue('product_scan_code', '');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (selectedFormulationReportLines) {
      form.setValue(
        'product_name',
        selectedFormulationReportLines.productName,
      );
      form.setValue(
        'product_code',
        selectedFormulationReportLines.productCode,
      );
    }
  }, [selectedFormulationReportLines]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    setIsOpenDialogScanProduct(false);
    setScanProductCode('disabledScanProductCode');
    // toast.success('Success verify material code!');
    setIsAdminScannedProductCode(true);
  }, []);

  useEffect(() => {
    const processedStr = {productCode: newReactHookFormVal}; // prettier-ignore
    const isVerifiedProductCode = selectedFormulationReportLines.productCode === processedStr.productCode; // prettier-ignore

    form.setValue(
      'product_scan_code',
      processedStr.productCode,
    );

    if (newReactHookFormVal !== '') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // @ts-ignore
      timeoutRef.current = setTimeout(() => {
        if (isVerifiedProductCode) {
          setIsOpenDialogScanProduct(false);
          setScanProductCode(newReactHookFormVal);
          toast.success('Success verify material code!');
          setIsAdminScannedProductCode(true);
        } else {
          toast.error('Your material code is invalid!');
        }
      }, 800);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    newReactHookFormVal,
    selectedFormulationReportLines.productCode,
  ]);

  useEffect(() => {
    if (mustFollowOrder) {
      setIsOpenDialogScanProduct(true);
    }
  }, [mustFollowOrder]);

  return (
    <Dialog
      open={isOpenDialogScanProduct}
      defaultOpen
      onOpenChange={() => {
        setIsOpenDialogScanProduct(
          !isOpenDialogScanProduct,
        );
        setScanProductCode('');
      }}
    >
      <DialogContent className="py-8 pb-9 sm:min-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck2 />
            Verify Material Manual
          </DialogTitle>
          <DialogDescription>
            Verify your material code with material list card
            code.
          </DialogDescription>
        </DialogHeader>
        <div className="full">
          <Form {...form}>
            <form autoComplete="off" className="full">
              <FormField
                control={form.control}
                name="product_name"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormLabel className="w-1/2">
                      Material Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        readOnly
                        disabled
                        placeholder="PROD0013"
                        {...field}
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500 disabled:border-black disabled:font-semibold disabled:text-black',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              form.formState.errors
                                .product_code,
                          },
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="product_code"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormLabel className="w-1/2">
                      Material Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        readOnly
                        disabled
                        placeholder="PROD0013"
                        {...field}
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none disabled:border disabled:border-black disabled:font-semibold disabled:text-black',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              form.formState.errors
                                .product_code,
                          },
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="product_scan_code"
                render={({ field }) => {
                  setNewReactHookFormVal(field.value);
                  return (
                    <FormItem className="flex items-center">
                      <FormLabel className="w-1/2">
                        Scan Material Code
                      </FormLabel>
                      <FormControl>
                        <div className="-ml-1.5 flex w-full items-center gap-2">
                          <Input
                            disabled={selectedFormulationReportLines?.status !== 0} // prettier-ignore
                            {...field}
                            placeholder="Material Code"
                            id="autoFocusInput"
                            ref={inputRef}
                            // onKeyDown={(e) => {
                            //   const currentTime = new Date().getTime(); // prettier-ignore
                            //   const timeDiff = currentTime - lastKeyTime; // prettier-ignore
                            //   setLastKeyTime(currentTime);

                            //   if (
                            //     e.key === 'Backspace' ||
                            //     e.key === 'Delete' ||
                            //     e.key === 'Enter'
                            //   ) {
                            //     // Allow backspace and delete keys
                            //     setInput((prevInput) =>
                            //       prevInput.slice(0, -1),
                            //     );
                            //     return;
                            //   }

                            //   const whitelistedKey = '1234567890'; // prettier-ignore
                            //   if (
                            //     e.key !== 'Tab' &&
                            //     timeDiff >
                            //       BARCODE_THRESHOLD &&
                            //     !whitelistedKey.includes(
                            //       e.key,
                            //     )
                            //   ) {
                            //     e.preventDefault();
                            //   } else {
                            //     if (
                            //       e.key === 'Backspace' ||
                            //       e.key === 'Delete' ||
                            //       e.key === 'Enter'
                            //     ) {
                            //       // Allow backspace and delete keys
                            //       setInput((prevInput) =>
                            //         prevInput.slice(0, -1),
                            //       );
                            //       return;
                            //     } else {
                            //       setInput(
                            //         (prevInput) =>
                            //           prevInput + e.key,
                            //       );
                            //     }
                            //   }
                            // }}
                            className={cn(
                              'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                              {
                                'focus:border-pink-500 focus:ring-pink-500':
                                  form.formState.errors
                                    .product_scan_code,
                              },
                            )}
                          />

                          <Button
                            onClick={handleClearScanProduct}
                            type="button"
                            className="bg-red-100 hover:bg-red-50"
                          >
                            <Trash2 className="text-red-500" />
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
