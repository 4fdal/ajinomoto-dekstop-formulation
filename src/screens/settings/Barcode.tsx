import Spinner from '~/components/Spinner';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Store } from 'tauri-plugin-store-api';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import { cn } from '~/lib/utils';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { getDefaultTauriStore } from '~/lib/helpers';

const FormSchema = z.object({
  scan_feature: z.boolean(),
});

export function Barcode() {
  const [isPendingSave, setIsPendingSave] = useState<boolean>(false) // prettier-ignore

  const store = new Store('.settings.dat');
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      scan_feature: false,
    },
  });

  async function onSubmit(
    data: z.infer<typeof FormSchema>,
  ) {
    setIsPendingSave(true);

    try {
      await store.set('tauri_formulation_scan_feature', {
        value: data.scan_feature,
      });
      await store.save();
      toast.success('Successfully saved settings!');
      setIsPendingSave(false);
    } catch (error) {
      toast.error('Something must be wrong!');
      setIsPendingSave(false);
    }
  }

  useEffect(() => {
    const getDefaultSettingsValue = async () => {
      const isUseScanFeature = await getDefaultTauriStore<{ value: boolean }>('tauri_formulation_scan_feature') // prettier-ignore
      form.setValue('scan_feature', isUseScanFeature.value);
    };

    getDefaultSettingsValue();
  }, []);

  return (
    <Form {...form}>
      <form
        autoComplete={'off'}
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-3 flex w-full flex-col gap-3 space-y-2 pr-3"
      >
        <FormField
          control={form.control}
          name="scan_feature"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Scan Feature
                </FormLabel>
                <FormDescription>
                  Feature to activate barcode scanner
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
  );
}
