"use client";

import Link from "next/link";
import { useState } from "react";

const rules = [
  "PRICES MAY CHANGE FROM TIME TO TIME",
  "NO CANCELLATIONS once payment is confirmed.",
  "NO RETURNS for change of mind, wrong size, wrong design, or buyer's mistake.",
  "WRONG / MISSING ITEMS",
  "Must be reported within 24 HOURS of delivery.",
  "A FULL unboxing video from start is REQUIRED.",
  "No unboxing video = NO replacement.",
  "DAMAGED ITEMS",
  "Crystal cases and minor earring flaws are NOT replaceable.",
  "Items are checked and packed securely before shipping.",
  "Courier mishandling is beyond our control and not our responsibility.",
  "LOST PARCELS",
  "Refund or resend ONLY after courier confirms the parcel is lost.",
  "Courier investigation and confirmation may take up to 15 working days.",
  "SHIPPING & DELAYS",
  "Once tracking is provided, delays are courier-related.",
  "Weather, holidays, peak seasons, or courier backlog may cause delays.",
  "Delivery timelines are ESTIMATES, not guarantees.",
  "PROCESSING TIME",
  "2-3 days allotted for sorting, packing, and shipping before dispatch.",
  "Payments made after cut-off are processed the next working day.",
  "OUT-OF-STOCK ITEMS",
  "If no backup design is provided, we will choose a replacement.",
  "Replacement will be selected from best-selling or in-demand designs.",
  "Notes will be added to your order if a replacement was chosen.",
  "REPLACEMENTS",
  "Replacements are usually shipped with your next order.",
  "Immediate shipment requires an additional shipping fee.",
  "PRICING",
  "Prices are FINAL once ordered.",
  "No price adjustments after purchase, even if prices change later.",
  "BUYER RESPONSIBILITY",
  "Incorrect address or contact details are the buyer's responsibility.",
  "Always double-check the order form before payment.",
  "COMMUNITY CONDUCT & COMMUNICATION",
  "This page is for WHOLESALE & RESELLERS only.",
  "Be respectful to admins and members at all times.",
  "No profanity, harassment, spam, fake orders, or disruptive behavior.",
  "Order concerns, delays, or issues must be raised PRIVATELY with admins.",
  "Public accusations, panic messages, or reputation-damaging statements are not allowed.",
  "Repeated follow-ups will not speed up processing.",
  "DISCIPLINARY SYSTEM (STRICTLY ENFORCED)",
  "FIRST OFFENSE: 24-hour mute",
  "SECOND OFFENSE: 48-hour mute",
  "THIRD OFFENSE: Permanent removal from the group",
  "This applies to:",
  "- Bad language or disrespect",
  "- Spam or flooding",
  "- Public accusations or false claims",
  "- Ignoring group rules or admin instructions",
  "ADMIN AUTHORITY",
  "Admin decisions regarding orders, delays, replacements, and enforcement are FINAL.",
  "Abuse of policies or repeated violations may result in immediate removal without further notice.",
];

export default function Footer() {
  const [open, setOpen] = useState(false);
  const [pricelistOpen, setPricelistOpen] = useState(false);

  return (
    <>
      <footer className="mt-16 border-t border-white/10 bg-black/60 px-6 py-8 text-center text-xs uppercase tracking-[0.3em] text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/track"
              className="rounded-full border border-white/20 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 hover:text-white"
            >
              Track Order
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full border border-white/20 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 hover:text-white"
            >
              Terms and Conditions
            </button>
            <button
              type="button"
              onClick={() => setPricelistOpen(true)}
              className="rounded-full border border-white/20 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 hover:text-white"
            >
              Delivery Pricelist
            </button>
          </div>
          <p>© All Rights Reserved Exist WorldWide</p>
        </div>
      </footer>

      {open && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel w-full max-w-3xl rounded-3xl border border-white/10 bg-[#111111]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/70">
                Terms and Conditions
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              <ul className="list-disc space-y-2 pl-5 text-xs text-white/70">
                {rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {pricelistOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setPricelistOpen(false)}
        >
          <div
            className="modal-panel w-full max-w-3xl rounded-3xl border border-white/10 bg-[#111111] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/70">
                Delivery Pricelist
              </h3>
              <button
                type="button"
                onClick={() => setPricelistOpen(false)}
                className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80"
              >
                Close
              </button>
            </div>
            <div className="mt-5">
              <button
                type="button"
                className="rounded-full bg-white px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-black"
              >
                J&T
              </button>
              <div className="mt-4 space-y-3 text-xs text-white/70">
                <p className="text-sm text-white">
                  J&T Fixed Shipping & Handling Fee
                </p>
                <p>Nationwide Shipping</p>
                <p>(Approx. 55g per boxer - for reference only)</p>
                <div className="space-y-2">
                  <p>• 10 pcs (≈ 550g) ₱130 Luzon | ₱130 Visayas | ₱130 Mindanao</p>
                  <p>• 11–25 pcs (≈ 0.6kg–1.4kg) ₱165 Luzon | ₱180 Visayas | ₱195 Mindanao</p>
                  <p>• 26–35 pcs (≈ 1.4kg–1.9kg) ₱190 Luzon | ₱210 Visayas | ₱230 Mindanao</p>
                  <p>• 36–45 pcs (≈ 1.9kg–2.5kg) ₱210 Luzon | ₱230 Visayas | ₱255 Mindanao</p>
                  <p>• 46–60 pcs (≈ 2.5kg–3.3kg) ₱235 Luzon | ₱260 Visayas | ₱290 Mindanao</p>
                  <p>• 61–80 pcs (≈ 3.3kg–4.4kg) ₱280 Luzon | ₱310 Visayas | ₱350 Mindanao</p>
                  <p>• 81–100 pcs (≈ 4.4kg–5.5kg) ₱340 Luzon | ₱380 Visayas | ₱430 Mindanao</p>
                  <p>• 101–150 pcs (≈ 5.5kg–7kg) ₱410 Luzon | ₱460 Visayas | ₱520 Mindanao</p>
                </div>
                <div className="mt-3 space-y-1">
                  <p>Includes:</p>
                  <p>• Courier fee</p>
                  <p>• Handling fee</p>
                  <p>• Packaging materials</p>
                  <p>• Secure packing for safer delivery</p>
                </div>
                <p className="mt-3">
                  Delivery Time: Please allow 2–3 days for the package to arrive.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
