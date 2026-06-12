"use client";

import { useState } from "react";

type Tab = "momo" | "bank" | "paypal";

export function CheckoutPaymentTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("momo");

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("momo")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${activeTab === "momo"
              ? "bg-white text-black shadow-sm"
              : "text-neutral-500 hover:text-black"
            }`}
        >
          <img src="/momo.jpg" alt="Mobile Money logo" className="h-4 w-auto object-contain" />
          MoMo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bank")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${activeTab === "bank"
              ? "bg-white text-black shadow-sm"
              : "text-neutral-500 hover:text-black"
            }`}
        >
          <img src="/calbank.jpg" alt="CalBank logo" className="h-4 w-auto object-contain" />
          CalBank
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("paypal")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${activeTab === "paypal"
              ? "bg-white text-black shadow-sm"
              : "text-neutral-500 hover:text-black"
            }`}
        >
          <img src="/paypal.png" alt="PayPal logo" className="h-4 w-auto object-contain" />
          PayPal
        </button>
      </div>

      {/* Tab Content */}
      <div className="rounded-md border border-purple-100 bg-purple-50 px-4 py-4 text-sm leading-6 text-purple-950">
        {activeTab === "momo" && (
          <div className="space-y-4">
            <div>
              <p className="font-semibold uppercase tracking-wider text-purple-900/80 text-xs mb-2">MTN Mobile Money</p>
              <dl className="space-y-1">
                <div className="flex justify-between gap-4 border-b border-purple-200/50 pb-1">
                  <dt className="text-purple-900/70">Merchant ID</dt>
                  <dd className="font-medium">029465</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-purple-900/70">Account Name</dt>
                  <dd className="font-medium">The Psalmist Int</dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="font-semibold uppercase tracking-wider text-purple-900/80 text-xs mb-2 mt-4">Telecel Cash</p>
              <dl className="space-y-1">
                <div className="flex justify-between gap-4 border-b border-purple-200/50 pb-1">
                  <dt className="text-purple-900/70">Till Number</dt>
                  <dd className="font-medium">404359</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-purple-900/70">Account Name</dt>
                  <dd className="font-medium">The Psalmist Int</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-purple-800 bg-purple-200/40 p-2 rounded">
                <span className="font-semibold">NB:</span> To use the Till Number use the Withdrawal method
              </p>
            </div>
          </div>
        )}

        {activeTab === "bank" && (
          <div className="space-y-4">
            <div>
              <p className="font-semibold uppercase tracking-wider text-purple-900/80 text-xs mb-2">Cedi Account</p>
              <dl className="space-y-1">
                <div className="flex justify-between gap-4 border-b border-purple-200/50 pb-1">
                  <dt className="text-purple-900/70">Account Number</dt>
                  <dd className="font-medium">1400008068676</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-purple-200/50 pb-1">
                  <dt className="text-purple-900/70">Account Name</dt>
                  <dd className="font-medium text-right">THE PSALMIST INTERNATIONAL</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-purple-900/70">Branch</dt>
                  <dd className="font-medium">Achimota</dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="font-semibold uppercase tracking-wider text-purple-900/80 text-xs mb-2 mt-4">Dollar Account</p>
              <dl className="space-y-1">
                <div className="flex justify-between gap-4 border-b border-purple-200/50 pb-1">
                  <dt className="text-purple-900/70">Account Number</dt>
                  <dd className="font-medium">1400008080714</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-purple-200/50 pb-1">
                  <dt className="text-purple-900/70">Account Name</dt>
                  <dd className="font-medium text-right">THE PSALMIST INTERNATIONAL</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-purple-900/70">Branch</dt>
                  <dd className="font-medium">Achimota</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === "paypal" && (
          <div className="space-y-4">
            <div>
              <p className="font-semibold uppercase tracking-wider text-purple-900/80 text-xs mb-2">Dollar Account Details</p>
              <div className="bg-purple-200/30 p-3 rounded-md font-medium text-center">
                mysticmartyrs@gmail.com
              </div>
            </div>

            <div>
              <p className="font-semibold uppercase tracking-wider text-purple-900/80 text-xs mb-2 mt-4">Pounds Account Details</p>
              <div className="bg-purple-200/30 p-3 rounded-md font-medium text-center">
                thepsalmistint@gmail.com
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
