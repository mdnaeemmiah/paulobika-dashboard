"use client";
import { useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";

export default function SettingsAboutPage() {
    const router = useRouter();
  return (
    <div className="min-h-screen">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f3f4f6]">
        <div className="bg-[#b76424] px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="inline-flex items-center gap-1 text-white cursor-pointer"
                      aria-label="Go back"
                    >
                      <FiChevronLeft className="text-[18px]" />
                      <span className="text-[22px] font-semibold sm:text-[24px]">About Us</span>
                    </button>
          {/* <h2 className="text-[20px] leading-none font-semibold text-white sm:text-[24px]"></h2> */}
        </div>

        <div className="p-4 sm:p-5">
          <div className="rounded-xl border border-[#d8dde4] bg-[#f7f7f8] p-4 sm:p-5">
            <p className="text-[15px] leading-7 text-[#444c57] sm:text-[16px]">
              Everidog helps pet parents choose better nutrition through personalized food
              recommendations based on dog profile details like breed, age, activity, health
              conditions, and allergies.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}