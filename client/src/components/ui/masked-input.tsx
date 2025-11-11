import React from 'react';
import InputMask from 'react-input-mask';
import { cn } from '@/lib/utils';

interface MaskedInputProps extends React.ComponentProps<'input'> {
  mask: string;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, type, mask, ...props }, ref) => {
    return (
      <InputMask mask={mask} {...props}>
        {/* @ts-ignore */}
        {(inputProps: any) => (
          <input
            {...inputProps}
            type={type}
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              className
            )}
          />
        )}
      </InputMask>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';
