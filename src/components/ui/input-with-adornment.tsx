import * as React from 'react';
import { cn } from '~/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  endAdornment?: React.ReactNode; // New prop for the end adornment
  endAdornmentFn?: () => void; // New prop for the end adornment action
}

const InputWithAdornment = React.forwardRef<
  HTMLInputElement,
  InputProps
>(
  (
    {
      className,
      type,
      endAdornment,
      endAdornmentFn,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative">
        <input
          type={type}
          aria-autocomplete="none"
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          ref={ref}
          {...props}
        />
        {endAdornment && props.value !== '' && (
          <button
            type="button"
            onClick={endAdornmentFn}
            className="absolute inset-y-0 right-0 flex items-center rounded-full px-2"
          >
            {endAdornment}
          </button>
        )}
      </div>
    );
  },
);

InputWithAdornment.displayName = 'InputWithAdornment';

export { InputWithAdornment };
