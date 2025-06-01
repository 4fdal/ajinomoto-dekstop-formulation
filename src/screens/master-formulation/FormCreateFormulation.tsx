import Spinner from '~/components/Spinner';

import { Button } from '~/components/ui/button';
import { EditFormulationReports } from '~/lib/types/responses';
import { useEffect, useState, useRef } from 'react';
import { Input } from '~/components/ui/input';
import { decodeObjectFromBase64 } from '~/lib/helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '~/lib/utils';
import { useUserDisplayStore } from '~/lib/store/store';
import { FormulationSchema } from '~/lib/types/schemas';
import { Checkbox } from '~/components/ui/checkbox';
import { IBodyFormulationLines } from '~/lib/types/types';
import { toast } from 'sonner';
import { useFormulationReport } from '~/lib/store/store';
import { useMutation } from '@tanstack/react-query';
import { FilePlus2 } from 'lucide-react';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';

import {
  createMasterFormulation,
  editMasterFormulation,
} from '~/actions/formulation.action';

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  Form,
  FormControl,
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

type FocusedFieldType =
  | 'formulation_code'
  | 'formulation_name';

export function FormCreateFormulation({
  filledFormulationLines,
  setFormulationLines,
}: {
  filledFormulationLines: IBodyFormulationLines[];
  setFormulationLines: React.Dispatch<
    React.SetStateAction<IBodyFormulationLines[]>
  >;
}) {
  const form = useForm<z.infer<typeof FormulationSchema>>({
    resolver: zodResolver(FormulationSchema),
    defaultValues: {
      formulation_code: '',
      formulation_name: '',
      total_mass: 0,
      total_ingredient: 0,
      must_follow_order: false,
      status: '0',
    },
  });

  const navigate = useNavigate();
  const [searchParams, setSearch] = useSearchParams();
  const [dataEditId, setDataEditId] = useState('');
  const [focusedField, setFocusedField] = useState('name');
  const [tempField, setTempField] = useState('');

  const isEditForm = searchParams.get('edit_formulation') // prettier-ignore
  const isCreateForm = searchParams.get('create_formulation_lines') // prettier-ignore
  const initialValueEditFormulationParam = searchParams.get('q') // prettier-ignore
  const newCollectedTargetMass = filledFormulationLines.map((item) => item.targetMass); // prettier-ignore
  const formErrors = form.formState.errors;

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>();
  const input2Ref = useRef<HTMLInputElement>();

  const {
    formulationReportsLines,
    setMustFollowOrder,
    setFormulationReports,
    tempFormulationCode: currentSelectedFormulationCode,
  } = useFormulationReport();

  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore();

  const { mutate, isPending } = useMutation({
    mutationFn: (body: any) => {
      if (isEditForm == 'true') {
        return editMasterFormulation(body, dataEditId);
      } else {
        return createMasterFormulation(body);
      }
    },
    onSuccess: (res: any) => {
      if (
        currentSelectedFormulationCode ===
        res?.formulationCode
      ) {
        setMustFollowOrder(res?.mustFollowOrder);
      }

      if (res?.edit) {
        // setFormulationReports(res?.FormulationLines);
        navigate(-1);
        return toast.success(
          'Successfully edit formulation!',
        );
      }

      if (res) {
        toast.success(
          'Successfully create new formulation!',
        );
        navigate(-1);
        form.reset();
        setFormulationLines([]);
      }
    },
    onError: (error: Error) => {
      console.log('error create formulation', error);
      toast.error('Failed creating new formulation!');
    },
  });

  const getSumOfTotalMass = () => {
    let sum = 0;
    for (
      let i = 0;
      i < newCollectedTargetMass.length;
      i++
    ) {
      sum += parseInt(newCollectedTargetMass[i]);
    }
    form.setValue('total_mass', sum);
  };

  const handleVirtualKeyboardChange = (
    txt: FocusedFieldType,
  ) => {
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
    keyboard?.current.setInput(initialVal);
    if (initialVal == '') {
      setTempField('');
      caretPositionRef.current = 1;
    }
    setFocusedField(field);
    setIsShowVirtualKeyboard(true);
    // clearPreviousInput();
  };

  async function onSubmit(
    data: z.infer<typeof FormulationSchema>,
  ) {
    const rebuildBody = {
      formulationCode: data.formulation_code,
      formulationName: data.formulation_name,
      totalMass: data.total_mass,
      totalIngredient: data.total_ingredient,
      mustFollowOrder: data.must_follow_order,
      status: parseInt(data.status as any),
      FormulationLines: filledFormulationLines.map(
        (line) => ({
          ...line,
          min: parseInt(line.min as any),
          max: parseInt(line.max as any),
          targetMass: parseInt(line.targetMass as any),
          maxAllowedWeighingQty: parseInt(
            line.maxAllowedWeighingQty as any,
          ),
        }),
      ),
    };

    mutate(rebuildBody);
  }

  const onChange = (newInput: string) => {
    updateCaretPosition(newInput);
    setTempField(newInput);
    // @ts-expect-error
    form.setValue(focusedField, newInput);

    switch (focusedField) {
      case 'formulation_code':
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'formulation_name':
        if (input2Ref.current) {
          input2Ref.current.focus();
          input2Ref.current.setSelectionRange(
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
  }, [tempField]);

  useEffect(() => {
    if (isEditForm == 'true') {
      const initialValues = decodeObjectFromBase64(initialValueEditFormulationParam) as EditFormulationReports; // prettier-ignore
      setFormulationLines(initialValues.FormulationLines as any); // prettier-ignore
      setDataEditId(initialValues.id);

      form.setValue('total_mass', initialValues.totalMass);
      form.setValue(
        'status',
        initialValues.status.toString(),
      );
      form.setValue(
        'formulation_code',
        initialValues.formulationCode,
      );
      form.setValue(
        'formulation_name',
        initialValues.formulationName,
      );
      form.setValue(
        'total_ingredient',
        initialValues.totalIngredient,
      );
      form.setValue(
        'must_follow_order',
        initialValues.mustFollowOrder,
      );
    }
  }, []);

  useEffect(() => {
    getSumOfTotalMass();
    form.setValue(
      'total_ingredient',
      filledFormulationLines.length,
    );
  }, [
    filledFormulationLines.length,
    newCollectedTargetMass,
  ]);

  return (
    <main className="mb-2">
      <Form {...form}>
        <form
          autoComplete={'off'}
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-3"
        >
          <section className="flex w-full justify-between gap-3">
            <FormField
              control={form.control}
              name="formulation_code"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Formulation Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Formulation Code"
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            formErrors.formulation_code,
                        },
                      )}
                      {...field}
                      // @ts-expect-error
                      ref={inputRef}
                      onChange={onChangeInput}
                      onClick={onChangeInput}
                      onFocus={() =>
                        handleCurrentFocusField(
                          'formulation_code',
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formulation_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Formulation Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Formulation Name"
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            formErrors.formulation_name,
                        },
                      )}
                      {...field}
                      // @ts-expect-error
                      ref={input2Ref}
                      onChange={onChangeInput}
                      onClick={onChangeInput}
                      onFocus={() =>
                        handleCurrentFocusField(
                          'formulation_name',
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
              name="total_mass"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Total Mass</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder="F123456"
                      className={cn(
                        'w-full focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500 disabled:border',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            formErrors.total_mass,
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
              name="total_ingredient"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Total Ingredient</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder="Total Ingredient"
                      className={cn(
                        'w-full border-gray-300 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:invalid:border-pink-500 disabled:border',
                        {
                          'focus:border-pink-500 focus:ring-pink-500':
                            formErrors.total_ingredient,
                        },
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="flex w-full items-center justify-between gap-3">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    {...field}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">
                        Active
                      </SelectItem>
                      <SelectItem value="1">
                        Archived
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-7 flex w-full">
              <FormField
                control={form.control}
                name="must_follow_order"
                render={({ field }) => (
                  <FormItem className="flex w-full items-center gap-2">
                    <FormControl className="mt-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">
                      Must Follow Order
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={
                  filledFormulationLines.length == 0
                }
                className={cn(
                  'absolute right-4 top-20 w-[100px] bg-blue-500 hover:bg-blue-400',
                  {
                    'border border-blue-500 bg-white':
                      isPending,
                  },
                )}
              >
                {isPending ? (
                  <Spinner />
                ) : isEditForm == 'true' ? (
                  'Edit'
                ) : (
                  'Save'
                )}
              </Button>

              <Button
                type="button"
                onClick={() =>
                  navigate('?create_formulation_lines=true')
                }
                className={cn(
                  'flex w-[140px] items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:cursor-not-allowed',
                  {
                    hidden: isEditForm,
                  },
                )}
              >
                <FilePlus2 size={20} />
                Add Material
              </Button>
            </div>
          </section>
        </form>
      </Form>
      <VirtualKeyboard
        isVisible={isShowVirtualKeyboard && !isCreateForm}
        // @ts-expect-error
        onChange={handleVirtualKeyboardChange}
        // @ts-expect-error
        keyboardRef={keyboard}
      />
    </main>
  );
}
