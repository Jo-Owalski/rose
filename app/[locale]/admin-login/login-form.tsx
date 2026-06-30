"use client";

import { LockKeyhole } from "lucide-react";
import { useActionState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { signInAdminAction, type SignInState } from "./actions";

const initialState: SignInState = {};

export function AdminLoginForm({ locale }: { locale: Locale }) {
  const copy = t(locale).admin;
  const [state, formAction, isPending] = useActionState(signInAdminAction, initialState);

  return (
    <form action={formAction} className="panel admin-login-form">
      <input name="locale" type="hidden" value={locale} />
      <label className="field">
        <span>{copy.loginEmail}</span>
        <input autoComplete="email" name="email" placeholder="admin@example.com" type="email" />
      </label>
      <label className="field">
        <span>{copy.loginPassword}</span>
        <input autoComplete="current-password" name="password" type="password" />
      </label>
      {state.error && <p className="form-error">{state.error}</p>}
      <button className="button primary" disabled={isPending} type="submit">
        <LockKeyhole size={17} />
        {isPending ? copy.signingIn : copy.signIn}
      </button>
    </form>
  );
}
