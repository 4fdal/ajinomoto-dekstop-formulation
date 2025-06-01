import { z } from 'zod';
import { SmallSpinner } from '~/components/Spinner';
import { Input } from '~/components/ui/input';
import { useUserAuthStore } from '~/lib/store/store';
import { InputPassword } from '~/components/ui/input-password';
import { Play, UserCog, UserPlus } from 'lucide-react';
import { MasterUserSchema } from '~/lib/types/schemas';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '~/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import { decodeObjectFromBase64 } from '~/lib/helpers';
import { useUserDisplayStore } from '~/lib/store/store';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';
import { Store } from 'tauri-plugin-store-api';

import {
  createMasterUser,
  editMasterUser,
  getUserRolesAction,
} from '~/actions/masters.action';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  useMutation,
  useQuery,
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

type FocusedFieldType = 'username' | 'password';

export function FormCreateUser() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [idUser, setIdUser] = useState('');
  const [focusedField, setFocusedField] = useState('username'); // prettier-ignore
  const [isEnableVirtual, setIsEnableVirtual] = useState(false); // prettier-ignore
  const [tempField, setTempField] = useState('');

  const isOpenEditUser = searchParams.get('is_edit_user'); // prettier-ignore
  const initialValueEditUser = searchParams.get('q') // prettier-ignore
  const queryClient = useQueryClient();
  const store = new Store('.settings.dat');

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const usernameRef = useRef<HTMLInputElement>();
  const passwordRef = useRef<HTMLInputElement>();

  const { user, setUser } = useUserAuthStore();
  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore();

  const { mutate, isPending } = useMutation({
    // @ts-ignore
    mutationFn: (data: any) => {
      if (isOpenEditUser == 'true') {
        return editMasterUser(data, idUser);
      } else {
        return createMasterUser(data);
      }
    },
    onSuccess: (res) => {
      console.log('response', res);
      queryClient.invalidateQueries({
        queryKey: ['master_users'],
      });

      if (res.status == 201) {
        if (isOpenEditUser == 'true') {
          toast.success('Successfully edit user!');
          if (res?.data?.id === user.user_id) {
            // @ts-expect-error: cuz it doesn't set the new token
            setUser({
              ...user,
              username: res?.data?.username,
            }) as unknown as any;
          }
        } else {
          toast.success('Successfully create new user!');
        }
        navigate(-1);
      } else {
        toast.error('Something went wrong!');
        form.reset();
      }
    },
    onError: (_) => {
      toast.error('Failed to create new user!');
    },
  });

  const { data } = useQuery({
    queryKey: ['user_roles'],
    queryFn: () => getUserRolesAction(),
  });

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
    mutate(data);
  }

  const handleVirtualKeyboardChange = (
    txt: FocusedFieldType,
  ) => {
    // switch (focusedField) {
    //   case 'username':
    //     form.setValue('username', txt);
    //     break;
    //   case 'password':
    //     form.setValue('password', txt);
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

  const handleCurrentFocusField = (
    field: FocusedFieldType,
  ): void => {
    const initialVal = form.getValues(field);
    // @ts-expect-error
    keyboard?.current.setInput(initialVal?.toString());
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
      case 'username':
        if (usernameRef.current) {
          usernameRef.current.focus();
          usernameRef.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'password':
        if (passwordRef.current) {
          passwordRef.current.focus();
          passwordRef.current.setSelectionRange(
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
    if (usernameRef.current) {
      usernameRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }

    if (passwordRef.current) {
      passwordRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  }, [tempField]);

  useEffect(() => {
    if (isOpenEditUser) {
      const initialValues = decodeObjectFromBase64(
        initialValueEditUser,
      ) as any;

      setIdUser(initialValues?.id);
      form.setValue('username', initialValues.username);
      form.setValue('password', 'placeholders');
    }

    return () => setIdUser('');
  }, [initialValueEditUser]);

  useEffect(() => {
    if (data !== undefined) {
      const assignUserRoleNotAnAdmin = () => {
        const userRolesNotAdmin = data?.rows?.filter(
          (item: any) => item.name !== 'Admin',
        );

        if (Array.isArray(userRolesNotAdmin)) {
          form.setValue('roleId', userRolesNotAdmin[0]?.id);
        }
      };
      assignUserRoleNotAnAdmin();
    }
  }, [data?.rows]);

  useEffect(() => {
    const handleGetVirtualKeyboardActivation = async () => {
      const isEnableVirtualKeyboard = await store.get<{value: boolean}>('tauri_enable_virtual_keyboard') // prettier-ignore
      setIsEnableVirtual(isEnableVirtualKeyboard!.value);
    };

    handleGetVirtualKeyboardActivation();
  }, []);

  return (
    <Dialog defaultOpen onOpenChange={() => navigate(-1)}>
      <DialogContent
        className={cn('min-w-[600px]', {
          'flex min-h-[660px] flex-col':
            isShowVirtualKeyboard && isEnableVirtual,
          'min-h-[500px]': isOpenEditUser,
        })}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isOpenEditUser == 'true' ? (
              <UserCog />
            ) : (
              <UserPlus />
            )}
            {isOpenEditUser == 'true' ? 'Edit' : 'Add New'}{' '}
            User
          </DialogTitle>
          <DialogDescription>
            {isOpenEditUser == 'true' ? 'Edit' : 'Create'}{' '}
            user, Click save once you're done
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
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            form.formState.errors.username,
                        },
                      )}
                      {...field}
                      // @ts-expect-error
                      ref={usernameRef}
                      onChange={onChangeInput}
                      onClick={onChangeInput}
                      onFocus={() =>
                        handleCurrentFocusField('username')
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem
                  className={cn('w-full', {
                    hidden: isOpenEditUser == 'true',
                  })}
                >
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <InputPassword
                      placeholder="Password"
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            form.formState.errors.password,
                        },
                      )}
                      {...field}
                      // @ts-expect-error
                      ref={passwordRef}
                      onChange={onChangeInput}
                      onClick={onChangeInput}
                      onFocus={() =>
                        handleCurrentFocusField('password')
                      }
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
                <FormItem
                  className={cn('w-full', {
                    hidden: isOpenEditUser == 'true',
                  })}
                >
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input
                      readOnly
                      disabled
                      placeholder="user"
                      className={cn(
                        'w-full border border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                      )}
                      {...field}
                      value={field.value ? 'User' : ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl
                      className={cn('', {
                        'border border-pink-500 text-red-500':
                          form.formState.errors.role,
                      })}
                    >
                      <SelectTrigger>
                        {field.value ? (
                          <>
                            <span
                              className={cn('', {
                                hidden:
                                  isOpenEditUser == 'true',
                              })}
                            >
                              {field.value == '0'
                                ? 'User'
                                : 'Admin'}
                            </span>
                          </>
                        ) : (
                          'Select Role'
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">
                        User
                      </SelectItem>
                      <SelectItem value="1">
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
 */}
            <VirtualKeyboard
              isVisible={isShowVirtualKeyboard}
              // @ts-expect-error
              onChange={handleVirtualKeyboardChange}
              // @ts-expect-error
              keyboardRef={keyboard}
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
                ) : isOpenEditUser == 'true' ? (
                  'Edit User'
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
