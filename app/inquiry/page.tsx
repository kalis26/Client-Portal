import Link from "next/link";
import { InquiryForm } from "@/components/inquiry-form";

export default function InquiryPage() {
  return <main className="sign-in"><section><p className="eyebrow">REZO</p><h1>Start a project.</h1><p>Share a concise overview. If the project is a fit, you will receive a secure portal invitation.</p><InquiryForm/><small>Already invited? <Link href="/sign-in">Sign in to your workspace.</Link></small></section></main>;
}
