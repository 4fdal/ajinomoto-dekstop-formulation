import Spinner from '~/components/Spinner';

import { zodResolver } from '@hookform/resolvers/zod';
import { GeneralVirtualKeyboard } from '~/components/VirtualKeyboard';
import { useForm } from 'react-hook-form';
import { UserLists } from '~/lib/types/responses';
import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import { InputPassword } from '~/components/ui/input-password';
import { AuthFormSchema } from '~/lib/types/schemas';
import { Store } from 'tauri-plugin-store-api';

import { useNavigate } from 'react-router-dom';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { parseJwt } from '~/lib/helpers';

import {
  useUserAuthStore,
  useUserDisplayStore,
} from '~/lib/store/store';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form';

import {
  useMutation,
  useQuery,
} from '@tanstack/react-query';

import {
  getAllUsersAction,
  loginAction,
} from '~/actions/auth.action';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';

interface UserLoggin {
  UserId: string;
  authorized: boolean;
  exp: number;
  role: string;
  username: string;
}

export default function FormAuth() {
  const store = new Store('.settings.dat');
  const navigate = useNavigate();
  const keyboard = useRef();
  const [isEnableVirtual, setIsEnableVirtual] = useState(false); // prettier-ignore
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null); // prettier-ignore
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { setUser } = useUserAuthStore((state) => state);

  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore((state) => state);

  const form = useForm<z.infer<typeof AuthFormSchema>>({
    resolver: zodResolver(AuthFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof AuthFormSchema>) => {
      return loginAction(data);
    },
    onSuccess: (response) => {
      const user: UserLoggin = parseJwt(response?.token!);

      setUser({
        access_token: response?.token,
        role: user.role,
        username: user.username,
        user_id: user.UserId,
      });

      toast.success('Successfully logged in!');
      navigate('/');
    },
    onError: (error) => {
      console.log(error);
      toast.error('Something went wrong!');
    },
  });

  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => getAllUsersAction(),
  });

  const handleChangeVirtualKeyboard = (txt: string) => {
    if (focusedField) {
      form.setValue(focusedField, txt); // Set the value for the focused field
    }
  };

  const handleCurrentFocusField = (
    field: 'username' | 'password',
  ): void => {
    const initialVal = form.getValues(field);
    // @ts-expect-error
    keyboard?.current?.setInput(initialVal?.toString());
    setFocusedField(field); // Set the focused field here
    setIsShowVirtualKeyboard(true);
  };

  async function onSubmit(
    data: z.infer<typeof AuthFormSchema>,
  ) {
    mutate(data);
  }

  useEffect(() => {
    const handleGetVirtualKeyboardActivation = async () => {
      const isEnableVirtualKeyboard = await store.get<{value: boolean}>('tauri_enable_virtual_keyboard') // prettier-ignore
      setIsEnableVirtual(isEnableVirtualKeyboard!.value);
    };

    handleGetVirtualKeyboardActivation();
  }, []);

  return (
    <>
      <section
        className={cn(
          'z-0 flex w-full items-center justify-center',
          {
            'pb-[280px]': isShowVirtualKeyboard,
          },
        )}
      >
        <Form {...form}>
          <form
            autoComplete={'off'}
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-3"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <Popover open={isPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          onClick={() =>
                            setIsPopoverOpen(
                              (prev) => !prev,
                            )
                          }
                          className={cn(
                            'h-[60px] w-full justify-between truncate text-[20px]',
                            !field.value &&
                              'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? data?.rows?.find(
                                (data: any) =>
                                  data.username ===
                                  field.value,
                              )?.username ?? field.value
                            : 'Select Username'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="z-0 w-[600px] p-0">
                      <Command>
                        <CommandInput
                          onFocus={() =>
                            handleCurrentFocusField(
                              'username',
                            )
                          }
                          value={form.getValues('username')}
                          className="text-[20px]"
                          placeholder="Search username..."
                          onInput={(e) =>
                            form.setValue(
                              'username',
                              e.currentTarget.value,
                            )
                          } // Update the value correctly
                        />

                        <CommandEmpty>
                          No formulation found.
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {data?.rows?.map((row: any) => {
                              return (
                                <CommandItem
                                  value={row.username}
                                  key={row.id}
                                  onSelect={() => {
                                    {
                                      form.setValue(
                                        'username',
                                        row.username,
                                      );
                                      setIsPopoverOpen(
                                        (prev) => !prev,
                                      );
                                    }
                                  }}
                                  className="z-0 text-[20px]"
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-6 w-6',
                                      row.username ===
                                        field.value
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                    )}
                                  />
                                  {row.username}
                                </CommandItem>
                              );
                            })}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputPassword
                      id="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      className="h-[60px] text-[20px] focus:border focus:border-yellow-400"
                      {...field}
                      onFocus={() =>
                        handleCurrentFocusField('password')
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className={cn(
                'w-full bg-blue-500 py-7 text-[18px] text-white hover:bg-blue-400',
                {
                  'border border-blue-500 bg-white hover:bg-white':
                    isPending,
                },
              )}
              type="submit"
            >
              {isPending ? <Spinner /> : 'Login'}
            </Button>
          </form>
        </Form>
      </section>
      {isEnableVirtual && (
        <GeneralVirtualKeyboard
          className="z-50"
          isVisible={isShowVirtualKeyboard}
          onChange={(e) => handleChangeVirtualKeyboard(e)}
          // @ts-expect-error
          keyboardRef={keyboard}
        />
      )}
    </>
  );
}
