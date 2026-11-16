/**
 * UI-REFERENCE.md §9 component patterns: MonoLabel, PrimaryButton, SecondaryButton,
 * ToggleButton, FormInput, FormCard, InlineCode.
 */
import { forwardRef } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export const MONO_LABEL = "font-mono text-[11px] tracking-widest text-brand-muted-2 uppercase";

/** §9 MonoLabel. For other elements (dt, h3, label) apply `MONO_LABEL` directly. */
export function MonoLabel({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn(MONO_LABEL, className)} {...props} />;
}

type PrimaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
};

export function PrimaryButton({ children, loading, loadingLabel, className, disabled, ...props }: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "flex min-h-12 shrink-0 items-center justify-center gap-2.5 rounded-sm border border-brand-cobalt bg-brand-cobalt px-6 font-mono text-[13px] tracking-widest text-white transition-colors hover:bg-brand-cobalt-hover disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (loadingLabel ?? children) : children}
      {loading ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <ArrowRight aria-hidden="true" className="size-4" />
      )}
    </button>
  );
}

/** Sample buttons, filters (inactive), secondary actions. */
export function SecondaryButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-brand-border-strong bg-white px-4 text-sm text-brand-dark transition-colors hover:border-brand-dark disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

/** Network toggle / filter button: active = dark fill (§3.1, §4.3). */
export function ToggleButton({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-sm border px-4 text-sm font-medium transition-colors",
        active
          ? "border-brand-dark bg-brand-dark text-white"
          : "border-brand-border-strong bg-white text-brand-dark hover:border-brand-dark",
        className,
      )}
      {...props}
    />
  );
}

export const FormInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function FormInput({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-invalid={invalid || undefined}
        className={cn(
          "min-h-12 min-w-0 flex-1 basis-64 rounded-sm border bg-brand-surface px-3.5 font-mono text-sm text-brand-dark placeholder:text-brand-muted focus:outline-2 focus:outline-offset-2 focus:outline-brand-cobalt",
          invalid ? "border-verdict-risk" : "border-brand-input-border",
          className,
        )}
        {...props}
      />
    );
  },
);

/** §3.1 form card. */
export function FormCard({ className, ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      noValidate
      className={cn("flex max-w-[760px] flex-col gap-5 border border-brand-border-strong bg-white p-6", className)}
      {...props}
    />
  );
}

/** §4.4 code snippet. */
export function InlineCode({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code className={cn("rounded-sm bg-brand-pill px-1.5 py-0.5 font-mono text-[13px] text-brand-dark", className)}>
      {children}
    </code>
  );
}

/** Field-level validation message under an input. */
export function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="font-mono text-[12px] text-verdict-risk">
      {children}
    </p>
  );
}
