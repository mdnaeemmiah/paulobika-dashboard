import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

const settingsItems = [
  { label: "Privacy Policy", href: "/admin/settings/privacy" },
  { label: "Terms & Conditions", href: "/admin/settings/terms" },
  { label: "About Us", href: "/admin/settings/about" },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f3f4f6]">
        <div className="bg-[#b76424] px-4 py-2.5">
          
          <h2 className="text-[20px] leading-none font-semibold text-white sm:text-[24px]">Settings</h2>
        </div>

        <div className="p-3 sm:p-4">
          <div className="rounded-xl bg-[#f3f4f6] px-2 sm:px-3">
            {settingsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between border-b border-[#d0d4da] py-3 text-[#2f343a]"
              >
                <span className="text-[16px] font-medium sm:text-[18px]">{item.label}</span>
                <FiChevronRight className="text-[18px] text-[#545c68]" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
