import { z } from 'zod';
import { SmallSpinner } from '~/components/Spinner';
import { Input } from '~/components/ui/input';
import { MasterUserSchema } from '~/lib/types/schemas';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '~/components/ui/button';
import { UserRoundSearch } from 'lucide-react';
import { useEffect, useState } from 'react';
import { decodeObjectFromBase64 } from '~/lib/helpers';

import {
  createMasterUser,
  editMasterUser,
} from '~/actions/masters.action';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

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

export function DialogDetailUser() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [idUser, setIdUser] = useState('');
  const isOpenEditUser = searchParams.get('is_edit_user'); // prettier-ignore
  const initialDetailUser = searchParams.get('q') // prettier-ignore
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof MasterUserSchema>>({
    resolver: zodResolver(MasterUserSchema),
    defaultValues: {
      username: '',
      password: '',
      roleId: '',
    },
  });

  async function onSubmit(
    data: z.infer<typeof MasterUserSchema>,
  ) {
    console.log('data', data);
  }

  useEffect(() => {
    const initialValues = decodeObjectFromBase64(
      initialDetailUser,
    ) as any;

    form.setValue('username', initialValues.username);
    form.setValue('roleId', initialValues.Role.name);

    return () => setIdUser('');
  }, [initialDetailUser]);

  return (
    <Dialog defaultOpen onOpenChange={() => navigate(-1)}>
      <DialogContent
        className="min-w-[600px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRoundSearch />
            Detail User
          </DialogTitle>
          <DialogDescription>
            User information
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-3"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="Username"
                      readOnly
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            form.formState.errors.username,
                        },
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="Username"
                      readOnly
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            form.formState.errors.username,
                        },
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
