"use client";

import { useState } from "react";

const rules = [
  "PRICES MAY CHANGE FROM TIME TO TIME",
  "NO CANCELLATIONS once payment is confirmed.",
  "NO RETURNS for change of mind, wrong size, wrong design, or buyer’s mistake.",
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
  "2–3 days allotted for sorting, packing, and shipping before dispatch.",
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
  "Incorrect address or contact details are the buyer’s responsibility.",
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
  "– Bad language or disrespect",
  "– Spam or flooding",
  "– Public accusations or false claims",
  "– Ignoring group rules or admin instructions",
  "ADMIN AUTHORITY",
  "Admin decisions regarding orders, delays, replacements, and enforcement are FINAL.",
  "Abuse of policies or repeated violations may result in immediate removal without further notice.",
];

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer className="mt-16 border-t border-white/10 bg-black/60 px-6 py-8 text-center text-xs uppercase tracking-[0.3em] text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-white/20 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 hover:text-white"
          >
            Terms and Conditions
          </button>
          <p>© All Rights Reserved Exist WorldWide</p>
        </div>
      </footer>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#111111]">
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
    </>
  );
}
