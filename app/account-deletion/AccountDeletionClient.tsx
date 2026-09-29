"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { contactAPI } from "@/lib/api";
import { AlertTriangle, Clock, Mail, ShieldCheck, Trash2, UserX } from "lucide-react";

const SUPPORT_EMAIL = "support@leiraindia.com";

const deletedItems = [
  "Your name, email, and phone number on your Leira account",
  "Saved billing and shipping addresses",
  "Wishlist and cart data",
  "Login credentials and OTP session history",
  "Marketing preferences linked to your account",
];

const retainedItems = [
  "Order and payment records required for tax, accounting, and legal compliance",
  "Transaction references shared with payment and logistics partners",
  "Anonymised analytics that cannot identify you personally",
];

export default function AccountDeletionClient() {
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const reason = String(formData.get("reason") || "").trim();

    if (!name || !email) {
      error("Please enter your name and registered email.");
      return;
    }
    if (!confirmed) {
      error("Please confirm that you understand account deletion is permanent.");
      return;
    }

    const message = [
      "ACCOUNT DELETION REQUEST",
      "",
      `Registered email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      reason ? `Reason: ${reason}` : null,
      "",
      "I confirm that I want my Leira account and associated personal data deleted, subject to legal retention requirements.",
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitting(true);
    try {
      await contactAPI.submitMessage({ name, email, message });
      success("Your deletion request has been submitted. Our team will respond within 7 business days.");
      form.reset();
      setConfirmed(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not submit your request.";
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <MiniNavbar />
      <main className="min-h-screen bg-[#FAF9F6] leira-underlap-nav-spacer pb-16">
        <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm md:p-10">
            <div className="mb-4">
              <BackButton />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-pink-600">Your data, your choice</p>
                <h1 className="mt-3 text-3xl font-semibold text-pink-600 md:text-4xl">Account Deletion</h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
                  Request permanent deletion of your Leira account and personal data. We process every request in line
                  with our{" "}
                  <Link href="/privacy-policy" className="font-medium text-pink-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
                <UserX className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Clock, title: "7-day response", text: "We confirm receipt and process within 7 business days." },
                { icon: ShieldCheck, title: "Secure handling", text: "Identity is verified before any account is removed." },
                { icon: Trash2, title: "Permanent removal", text: "Personal profile data is deleted after verification." },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-pink-100/80 bg-gradient-to-br from-white to-pink-50/40 p-5"
                >
                  <Icon className="h-5 w-5 text-pink-600" strokeWidth={1.75} aria-hidden />
                  <p className="mt-3 text-sm font-semibold text-gray-900">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">{text}</p>
                </div>
              ))}
            </div>

            <div className="my-10 h-px w-full bg-pink-100" />

            <div className="grid gap-8 lg:grid-cols-2">
              <section>
                <h2 className="text-lg font-semibold text-gray-900">What we delete</h2>
                <ul className="mt-4 space-y-2.5">
                  {deletedItems.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-gray-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-500" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>

                <h2 className="mt-8 text-lg font-semibold text-gray-900">What we may retain</h2>
                <ul className="mt-4 space-y-2.5">
                  {retainedItems.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-gray-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
                  <p className="text-xs leading-relaxed text-amber-900">
                    Deletion cannot be undone. Active orders must be completed or cancelled before your account can be
                    fully removed. Pending refunds, if any, will still be processed to your original payment method.
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-pink-100 bg-[#FFFBFD] p-6 md:p-7">
                <h2 className="text-lg font-semibold text-gray-900">Request account deletion</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Use the email address linked to your Leira account. We will verify ownership before deleting data.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="deletion-name" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Full name <span className="text-pink-500">*</span>
                    </label>
                    <input
                      id="deletion-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="deletion-email" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Registered email <span className="text-pink-500">*</span>
                    </label>
                    <input
                      id="deletion-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="deletion-phone" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Registered phone (optional)
                    </label>
                    <input
                      id="deletion-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label htmlFor="deletion-reason" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Reason (optional)
                    </label>
                    <textarea
                      id="deletion-reason"
                      name="reason"
                      rows={3}
                      className="mt-1.5 w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                      placeholder="Help us improve — why are you leaving?"
                    />
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-pink-100 bg-white p-4">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-xs leading-relaxed text-gray-700">
                      I understand that account deletion is permanent and that some order or legal records may be
                      retained as described above.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full rounded-full bg-pink-600 text-sm font-semibold uppercase tracking-wide hover:bg-pink-700"
                  >
                    {submitting ? "Submitting…" : "Submit deletion request"}
                  </Button>
                </form>

                <p className="mt-5 text-center text-xs text-gray-500">or email us directly</p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Account Deletion Request")}&body=${encodeURIComponent("Please delete my Leira account.\n\nRegistered email:\nPhone (if any):\n\nI confirm I want my account permanently deleted.")}`}
                  className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-pink-600 hover:underline"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  {SUPPORT_EMAIL}
                </a>
              </section>
            </div>

            <p className="mt-10 text-center text-xs text-gray-500">
              Leira is operated by AOMAN SERVICES PRIVATE LIMITED · Last updated: July 2026
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
