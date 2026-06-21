"use client";
import { FormEvent, useState } from "react";

export function InquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setState("sending"); const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); setState(response.ok ? "sent" : "error"); if (response.ok) event.currentTarget.reset(); }
  if (state === "sent") return <p className="form-success">Your inquiry is received. You will hear back shortly.</p>;
  return <form className="setup-form" onSubmit={submit}><div className="form-grid"><label>Name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label><label>Company <span>(optional)</span><input name="company" /></label></div><label>What do you need?<textarea name="message" minLength={20} required placeholder="Tell me about your business, goals, and the website or web application you need." /></label>{state === "error" && <p className="form-error">Something went wrong. Please try again or send an email.</p>}<button className="button" disabled={state === "sending"}>{state === "sending" ? "Sending..." : "Send inquiry"}</button></form>;
}
