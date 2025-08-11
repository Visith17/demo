import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  direction?: "vertical" | "horizontal";
  children: React.ReactNode;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    { name, value, onValueChange, direction = "vertical", children, className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          direction === "horizontal" ? "flex flex-wrap gap-2" : "grid gap-2",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (
            React.isValidElement(child) &&
            child.type === RadioCard
          ) {
            return React.cloneElement(
              child as React.ReactElement<RadioCardProps>,
              {
                name,
                checked: value === child.props.value,
                onChange: () => onValueChange?.(child.props.value),
              }
            );
          }
          return child;
        })}
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";


export interface RadioCardProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  compact?: boolean;
  checked?: boolean;
  onChange?: () => void;
}

export const RadioCard = React.forwardRef<HTMLInputElement, RadioCardProps>(
  (
    {
      label,
      description,
      icon,
      compact = false,
      checked,
      onChange,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <label
        className={cn(
          "relative cursor-pointer transition-all rounded-xl border p-3 flex items-center gap-3",
          checked
            ? "border-primary bg-primary/10"
            : "border-muted hover:border-primary/40",
          disabled && "opacity-50 cursor-not-allowed",
          compact && "py-1 px-3 text-sm rounded-full",
          className
        )}
      >
        <input
          ref={ref}
          type="radio"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          {...props}
        />
        <div className="flex items-center gap-2">
          {/* Custom circle indicator */}
          {!compact && (
            <span
              className={cn(
                "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                checked ? "border-primary" : "border-gray-300"
              )}
            >
              {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
            </span>
          )}

          {/* Icon support */}
          {icon && <span className="text-xl">{icon}</span>}

          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-900">{label}</span>
            {!compact && description && (
              <span className="text-gray-500 text-xs">{description}</span>
            )}
          </div>
        </div>
      </label>
    );
  }
);
RadioCard.displayName = "RadioCard";
