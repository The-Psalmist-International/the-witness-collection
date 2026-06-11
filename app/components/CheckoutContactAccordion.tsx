"use client";

import { useState } from "react";

type CheckoutContactAccordionProps = {
  fullName: string;
  email: string;
  phone: string;
  fieldErrors?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  };
};

export function CheckoutContactAccordion({
  fullName,
  email,
  phone,
  fieldErrors,
}: CheckoutContactAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(fullName);
  const [contactEmail, setContactEmail] = useState(email);
  const [contactPhone, setContactPhone] = useState(phone);

  return (
    <div className="rounded-md border border-neutral-200">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Contact details
          </p>
          <p className="mt-1 truncate text-sm font-medium text-black">{name}</p>
          <p className="truncate text-xs text-neutral-500">
            {contactEmail} · {contactPhone}
          </p>
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="shrink-0 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-purple-950 hover:text-purple-950"
        >
          Edit
        </button>
      </div>

      {isOpen ? (
        <div className="space-y-4 border-t border-neutral-100 px-4 py-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="customerName"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Name
            </label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-black"
            />
            {fieldErrors?.customerName ? (
              <p className="text-xs text-red-600">{fieldErrors.customerName}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="customerEmail"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Email
            </label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              required
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              className="h-10 rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-black"
            />
            {fieldErrors?.customerEmail ? (
              <p className="text-xs text-red-600">{fieldErrors.customerEmail}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="customerPhone"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Phone
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              required
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              className="h-10 rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-black"
            />
            {fieldErrors?.customerPhone ? (
              <p className="text-xs text-red-600">{fieldErrors.customerPhone}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs font-medium text-purple-950 hover:text-purple-900"
          >
            Done
          </button>
        </div>
      ) : (
        <>
          <input type="hidden" name="customerName" value={name} />
          <input type="hidden" name="customerEmail" value={contactEmail} />
          <input type="hidden" name="customerPhone" value={contactPhone} />
        </>
      )}
    </div>
  );
}
