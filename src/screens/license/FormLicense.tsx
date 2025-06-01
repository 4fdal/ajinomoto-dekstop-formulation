import Spinner from '~/components/Spinner';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { saveLicenseAction } from '~/actions/license.action';
import { CircleCheckBig, Ban } from 'lucide-react';
import { toast } from '~/components/ui/use-toast';
import { Input } from '~/components/ui/input';
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

const FormSchema = z.object({
  license_key: z.string().min(2, {
    message: 'Key must be filled.',
  }),
});

export function FormLicense() {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      license_key: '',
    },
  });

  const formErrors = form.formState.errors;

  const { mutate, isPending } = useMutation({
    mutationFn: (key: string) => {
      return saveLicenseAction({ license_key: key });
    },
    onSuccess: () => {
      toast({
        description: (
          <div className="flex items-center gap-2">
            <CircleCheckBig className="h-10 w-10 gap-2 text-green-500" />
            <div>
              <h1 className="font-semibold text-green-700">
                Heads up!
              </h1>
              <span>
                License key successfully registered!
              </span>
            </div>
          </div>
        ),
      });
      navigate('/auth');
    },
    onError: (err) => {
      console.log(err);
      toast({
        description: (
          <div className="flex items-center gap-2">
            <Ban className="h-10 w-10 gap-2 text-red-500" />
            <div>
              <h1 className="font-semibold text-red-700">
                Failed!
              </h1>
              <span>
                Invalid license, or deprecated or internal
                app error
              </span>
            </div>
          </div>
        ),
      });
    },
  });

  async function onSubmit(
    data: z.infer<typeof FormSchema>,
  ) {
    mutate(data.license_key);
  }

  return (
    <section className="flex h-full w-full flex-1 items-center justify-center">
      <Card className="w-[550px]">
        <CardHeader>
          <CardTitle>Enter License Key</CardTitle>
          <CardDescription>
            License key is necessary to run the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              autoComplete={'off'}
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <FormField
                control={form.control}
                name="license_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="key/xxxxJFHDK"
                        className={cn(
                          'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                          {
                            'focus:border-pink-500 focus:ring-pink-500':
                              formErrors.license_key,
                          },
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The key could be a random characters.
                      Click{' '}
                      <span className="cursor-pointer font-medium text-blue-500 underline">
                        here
                      </span>{' '}
                      for more informations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className={cn(
                  'w-full bg-blue-500 py-6 text-[18px] text-white hover:bg-blue-400',
                  {
                    'border border-blue-500 bg-white hover:bg-white':
                      isPending,
                  },
                )}
                type="submit"
              >
                {isPending ? <Spinner /> : 'Submit'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
