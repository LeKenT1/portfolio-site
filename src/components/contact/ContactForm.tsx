"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { sendContactEmail, type ContactState } from "@/app/actions/contact";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/context";

const inputBase =
  "w-full px-4 py-3 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-sm " +
  "text-[var(--foreground)] placeholder:text-[var(--border)] " +
  "focus:outline-none focus:border-[var(--accent)] transition-colors duration-200";

interface FieldProps {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, id, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-mono text-xs tracking-widest uppercase text-[var(--muted-foreground)]"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 font-mono mt-1">{error}</p>}
    </div>
  );
}

export function ContactForm() {
  const { T } = useTranslation();
  const [state, action, isPending] = useActionState<ContactState, FormData>(
    sendContactEmail,
    null
  );

  const errorCodes = state?.status === "validation" ? state.errors ?? {} : {};

  const errorMessages: Record<string, string> = {
    required: T.contact.formErrorRequired,
    invalid: T.contact.formErrorInvalid,
    too_short: T.contact.formErrorTooShort,
  };

  const getError = (code: string | undefined) =>
    code ? (errorMessages[code] ?? code) : undefined;

  return (
    <AnimatePresence mode="wait">
      {state?.status === "success" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center gap-4 py-16 text-center"
        >
          <CheckCircle size={32} className="text-[var(--accent)]" />
          <p className="text-[var(--foreground)] font-medium">{T.contact.formSuccessTitle}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{T.contact.formSuccessBody}</p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          action={action}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-5"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label={T.contact.formName} id="name" error={getError(errorCodes.name)}>
              <input
                id="name"
                name="name"
                type="text"
                placeholder={T.contact.formNamePlaceholder}
                autoComplete="name"
                className={cn(inputBase, errorCodes.name && "border-red-500/50")}
              />
            </Field>
            <Field label={T.contact.formEmail} id="email" error={getError(errorCodes.email)}>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={T.contact.formEmailPlaceholder}
                autoComplete="email"
                className={cn(inputBase, errorCodes.email && "border-red-500/50")}
              />
            </Field>
          </div>

          <Field label={T.contact.formMessage} id="message" error={getError(errorCodes.message)}>
            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder={T.contact.formMessagePlaceholder}
              className={cn(
                inputBase,
                "resize-none",
                errorCodes.message && "border-red-500/50"
              )}
            />
          </Field>

          {state?.status === "error" && (
            <div className="flex items-center gap-2 text-xs text-red-400 font-mono">
              <AlertCircle size={13} />
              {state.message ?? T.contact.formErrorFallback}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium
              bg-[var(--accent)] text-black rounded-sm
              hover:bg-[var(--foreground)] disabled:opacity-50
              transition-colors duration-200"
          >
            {isPending ? (
              <>
                <Loader size={14} className="animate-spin" />
                {T.contact.formSending}
              </>
            ) : (
              <>
                <Send size={14} />
                {T.contact.formSend}
              </>
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
