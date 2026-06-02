"use client";

import Link from "next/link";
import React from "react";
import { FiChevronLeft } from "react-icons/fi";

export default function SendPromoPage() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-full">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f3f4f6]">
        <div className="bg-[#b76424] px-4 py-2.5">
          <div className="flex items-center gap-2 text-white">
            <Link href="/admin/emailList" aria-label="Back to email list" className="inline-flex">
              <FiChevronLeft size={22} />
            </Link>
            <h2 className="text-[20px] leading-none font-semibold sm:text-[24px] lg:text-[30px]">Send Promo Email</h2>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-[#d8dde4] bg-[#f7f7f8] p-4 sm:p-5"
          >
            <div className="space-y-1.5">
              <label htmlFor="promoTitle" className="text-[18px] font-medium text-[#2d323a] sm:text-[24px] lg:text-[30px]">
                Promo Title
              </label>
              <input
                id="promoTitle"
                type="text"
                placeholder="Enter promo title"
                className="h-11 w-full rounded-xl border border-[#d8dde4] bg-[#eceef2] px-3 text-[14px] text-[#3a4048] outline-none placeholder:text-[#a1a8b2]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="promoMessage" className="text-[18px] font-medium text-[#2d323a] sm:text-[24px] lg:text-[30px]">
                Message
              </label>
              <textarea
                id="promoMessage"
                rows={6}
                placeholder="Enter promo message"
                className="w-full resize-none rounded-xl border border-[#d8dde4] bg-[#eceef2] p-3 text-[14px] text-[#3a4048] outline-none placeholder:text-[#a1a8b2]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ctaLink" className="text-[18px] font-medium text-[#2d323a] sm:text-[24px] lg:text-[30px]">
                CTA Link
              </label>
              <input
                id="ctaLink"
                type="url"
                placeholder="https://..."
                className="h-11 w-full rounded-xl border border-[#d8dde4] bg-[#eceef2] px-3 text-[14px] text-[#3a4048] outline-none placeholder:text-[#a1a8b2]"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#b76424] px-8 text-[15px] font-medium text-white sm:min-w-40"
              >
                Send Promo
              </button>

              <Link
                href="/admin/emailList"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#d8dde4] bg-[#f7f7f8] px-8 text-[15px] font-medium text-[#2d323a] sm:min-w-32"
              >
                Back
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
