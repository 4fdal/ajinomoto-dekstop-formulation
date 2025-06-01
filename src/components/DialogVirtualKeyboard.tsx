import Keyboard from 'react-simple-keyboard';
import { Input } from '~/components/ui/input';
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '~/components/ui/button';
import { VirtualKeyboard } from './VirtualKeyboard';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

const FormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  email: z.string().min(2, {
    message: 'Email must be at least 2 characters.',
  }),
});

export function DialogVirtualKeyboard() {
  const keyboard = useRef();

  const [input, setInput] = useState('');
  const [layout, setLayout] = useState('default');
  const [keyboardVisibility, setKeyboardVisibility] = useState(false); // prettier-ignore
  const [focusField, setFocusField] = useState<'username' | 'email'>('username'); // prettier-ignore

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });

  const onChange = (input: string) => {
    setInput(input);
    console.log('focus field', focusField);
    form.setValue(focusField, input);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const input = e.target.value;
    setInput(input);
    // @ts-ignore
    keyboard.current.setInput(input);
  };

  const onSubmit = (data: any) => {
    console.log('data', data);
  };

  return (
    <Dialog defaultOpen={true}>
      <DialogContent className="sm:min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Account Number"
                      value={field.value}
                      onChange={handleChange}
                      onFocus={() => {
                        setFocusField('username');
                        setKeyboardVisibility(true);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Account Number"
                      value={field.value}
                      onChange={handleChange}
                      onFocus={() => {
                        setFocusField('email');
                        setKeyboardVisibility(true);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
        {keyboardVisibility && (
          <Keyboard
            keyboardRef={(r) => (keyboard.current = r)}
            layoutName={layout}
            onChange={onChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
