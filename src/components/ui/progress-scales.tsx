import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '~/lib/utils';

// @ts-ignore
interface CustomProgressProps
  extends React.ComponentPropsWithoutRef<
    typeof ProgressPrimitive.Root
  > {
  value: number[]; // Array of values representing segment percentages
  indicatorColors: string[]; // Array of colors for each segment
}

const ProgressScale = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  CustomProgressProps
>(
  (
    { className, value, indicatorColors, ...props },
    ref,
  ) => {
    const totalValue = value.reduce(
      (sum, val) => sum + val,
      0,
    );

    const calculateSegmentWidth = (
      segmentValue: number,
      overallValue: number,
    ) => {
      return (segmentValue / overallValue) * 100 + '%';
    };

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative h-5 w-full overflow-hidden rounded-md border bg-secondary',
          className,
        )}
        {...props}
      >
        {value.map((segmentValue, index) => (
          <ProgressPrimitive.Indicator
            key={index}
            className={`absolute h-full transition-all ${indicatorColors[index]}`}
            style={{
              width: calculateSegmentWidth(
                segmentValue,
                totalValue,
              ),
              left: `${value.slice(0, index).reduce((sum, val) => sum + (val / totalValue) * 100, 0)}%`,
            }}
          />
        ))}
      </ProgressPrimitive.Root>
    );
  },
);

ProgressScale.displayName =
  ProgressPrimitive.Root.displayName;

export { ProgressScale };
