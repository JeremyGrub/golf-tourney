import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HostChrome from "@/components/host/HostChrome";
import { createTournament } from "./actions";

type SearchParams = Promise<{ err?: string }>;

export default async function NewTournamentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sp = await searchParams;

  return (
    <HostChrome email={user.email ?? null}>
      <div className="mx-auto w-full max-w-3xl px-6 py-12 md:px-10 md:py-16">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-blueprint hover:text-ink"
        >
          ← back to dashboard
        </Link>

        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-blueprint">
          · / step 1 of 4 · basics
        </div>
        <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">
          Set the <span className="italic text-forest" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>course.</span>
        </h1>
        <p className="mt-4 max-w-xl text-ink/70">
          Give it a name, pick a venue and a date. You&apos;ll set pars, add players,
          and line up tee times on the next screens.
        </p>

        <form action={createTournament} className="mt-12 space-y-8">
          <Field
            label="tournament name"
            name="name"
            required
            placeholder="Autumn Scramble 2026"
            defaultValue=""
            autoFocus
            error={sp.err === "name_required" ? "required" : undefined}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field
              label="course name"
              name="course_name"
              placeholder="Wingfoot Country Club"
            />
            <Field
              label="location"
              name="course_location"
              placeholder="Mamaroneck, NY"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="start date" name="start_date" type="date" />
            <Field label="first tee time" name="start_time" type="time" />
          </div>

          <fieldset>
            <legend className="mb-3 block font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
              hole count
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <HoleCountOption value={18} defaultChecked label="18 holes" blurb="Classic weekend round." />
              <HoleCountOption value={9} label="9 holes" blurb="Quick after-work event." />
            </div>
          </fieldset>

          {sp.err === "create_failed" && (
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-topo">
              · something went wrong saving. try again?
            </p>
          )}

          <div className="flex items-center justify-between gap-4 pt-4">
            <Link
              href="/dashboard"
              className="font-mono text-xs uppercase tracking-[0.2em] text-ink/60 hover:text-ink"
            >
              cancel
            </Link>
            <button
              type="submit"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-chalk hover:bg-forest transition-colors"
            >
              Continue to holes
              <span aria-hidden>→</span>
            </button>
          </div>
        </form>
      </div>
    </HostChrome>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  autoFocus,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  autoFocus?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint"
      >
        {label}
        {error ? <span className="ml-2 text-topo">· {error}</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        className="w-full rounded-2xl border border-ink/15 bg-chalk px-5 py-4 font-sans text-lg text-ink placeholder:text-ink/30 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
      />
    </div>
  );
}

function HoleCountOption({
  value,
  label,
  blurb,
  defaultChecked,
}: {
  value: 9 | 18;
  label: string;
  blurb: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="group cursor-pointer">
      <input
        type="radio"
        name="hole_count"
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <div className="rounded-2xl border border-ink/15 bg-chalk p-5 transition peer-checked:border-topo peer-checked:bg-topo/5 peer-focus-visible:ring-2 peer-focus-visible:ring-forest/20">
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-semibold tracking-tight">{label}</span>
          <span className="h-4 w-4 rounded-full border border-ink/30 peer-checked:border-topo peer-checked:bg-topo" />
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-blueprint">
          {blurb}
        </p>
      </div>
    </label>
  );
}
