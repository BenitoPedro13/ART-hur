"use client"

import { useId, useState, type FormEvent } from "react"

import type { Dictionary } from "@/lib/i18n"
import type { Site } from "@/payload-types"

type FormConfig = NonNullable<Site["form"]>
type Status = "idle" | "submitting" | "success" | "error"

/**
 * The composed alternative to the raw contact rows.
 *
 * The submit contract is unchanged from the desktop-era form — same honeypot,
 * same `/api/contact` payload, same dictionary keys — because that part works.
 * What changed is the dress: shadcn's rounded fields carried the template's
 * look, so this uses ruled fields on the room surface instead, which is the
 * only treatment the spec allows here. Contact is task-bound UI: no sula, no
 * spectacle, nothing to admire.
 */
export function ContactForm({
  dictionary,
  form,
}: {
  dictionary: Dictionary
  form: FormConfig
}) {
  const formId = useId()
  const [status, setStatus] = useState<Status>("idle")
  const reasons = form.reasons ?? []

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // The browser nulls out `currentTarget` once the event finishes
    // dispatching, so it must be captured before the await below.
    const formEl = event.currentTarget
    const data = new FormData(formEl)

    setStatus("submitting")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          reason: data.get("reason"),
          message: data.get("message"),
          company: data.get("hp-topic"),
        }),
      })

      if (!response.ok) throw new Error("request_failed")

      setStatus("success")
      formEl.reset()
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <p className="contact-form-success" role="status">
        {form.successMessage}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      {/* Honeypot. Hidden with `display: none` (see globals.css) because an
          off-screen input still gets autofilled by Chrome and Edge, which
          trips the server's bot check and silently discards a real message.
          The name avoids "company"/"organization" for the same reason; the
          wire field stays `company` for the API. */}
      <input
        type="text"
        name="hp-topic"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="contact-form-honeypot"
      />

      <div className="contact-field">
        <label className="font-data" htmlFor={`${formId}-name`}>
          {dictionary.formName}
        </label>
        <input
          id={`${formId}-name`}
          name="name"
          required
          maxLength={200}
          autoComplete="name"
        />
      </div>

      <div className="contact-field">
        <label className="font-data" htmlFor={`${formId}-email`}>
          {dictionary.formEmail}
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </div>

      {reasons.length > 0 ? (
        <div className="contact-field">
          <label className="font-data" htmlFor={`${formId}-reason`}>
            {dictionary.formSubject}
          </label>
          <select id={`${formId}-reason`} name="reason" defaultValue="">
            <option value="" disabled>
              {dictionary.formSubjectPlaceholder}
            </option>
            {reasons.map((reason) => (
              <option key={reason.id ?? reason.label} value={reason.label}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="contact-field">
        <label className="font-data" htmlFor={`${formId}-message`}>
          {dictionary.formMessage}
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          required
          maxLength={4000}
          rows={5}
        />
      </div>

      {status === "error" ? (
        <p className="contact-form-error" role="alert">
          {dictionary.formError}
        </p>
      ) : null}

      <button
        type="submit"
        className="contact-submit font-data"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? dictionary.formSending : dictionary.formSend}
      </button>
    </form>
  )
}
