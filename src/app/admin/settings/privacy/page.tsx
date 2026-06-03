"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";

import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnUnderline,
  BtnUndo,
  BtnStyles,
  Editor,
  EditorProvider,
  Separator,
  Toolbar,
  createButton,
  createDropdown,
} from "react-simple-wysiwyg";

type PrivacyPolicyResponse = {
  content?: string;
  html?: string;
  body?: string;
  description?: string;
  data?: {
    content?: string;
    html?: string;
    body?: string;
    description?: string;
  };
};

const BtnFontSize = createDropdown("Font size", [
  ["12", "fontSize", "2"],
  ["14", "fontSize", "3"],
  ["18", "fontSize", "4"],
  ["24", "fontSize", "5"],
]);

const BtnAlignLeft = createButton("Align left", "L", "justifyLeft");
const BtnAlignCenter = createButton("Align center", "C", "justifyCenter");
const BtnAlignRight = createButton("Align right", "R", "justifyRight");
const BtnOutdent = createButton("Outdent", "<", "outdent");
const BtnIndent = createButton("Indent", ">", "indent");

const DEFAULT_POLICY_HTML = `<h2 style="color:#b76424;font-size:28px;font-weight:700;margin-bottom:16px;">Privacy Policy</h2>
<p><strong style="font-size:18px;color:#1f2937;">Effective Date:</strong> <span style="color:#b45309;font-weight:700;">April 2026</span></p>
<p>We value your <strong>privacy</strong> and work to protect the information you share with us. This policy explains how we collect, use, and safeguard your data when you use our services.</p>
<p><span style="font-size:20px;color:#0f766e;font-weight:700;">Information We Collect</span></p>
<ul>
  <li><strong>User profile data</strong> such as name, email, and account details.</li>
  <li><strong>Dog profile data</strong> such as breed, age, activity, health, and food preferences.</li>
  <li><strong>Usage data</strong> that helps us improve performance and recommendations.</li>
</ul>
<p><span style="font-size:20px;color:#1d4ed8;font-weight:700;">How We Use It</span></p>
<p>We use this information to provide personalized recommendations, maintain your account, and improve the app experience. Important updates may be shown in <strong style="color:#b76424;">bold</strong> or with <span style="color:#dc2626;font-weight:700;">highlighted text</span> when needed.</p>
<p><span style="font-size:20px;color:#7c3aed;font-weight:700;">Your Rights</span></p>
<p>You can review, update, or request deletion of your information according to applicable privacy rules and our service terms.</p>`;

const getPolicyHtml = (response: PrivacyPolicyResponse | unknown): string => {
  if (!response || typeof response !== "object") {
    return DEFAULT_POLICY_HTML;
  }

  const record = response as PrivacyPolicyResponse;
  return (
    record.content ||
    record.html ||
    record.body ||
    record.description ||
    record.data?.content ||
    record.data?.html ||
    record.data?.body ||
    record.data?.description ||
    DEFAULT_POLICY_HTML
  );
};

export default function SettingsPrivacyPage() {
  const router = useRouter();
  const [html, setHtml] = useState(DEFAULT_POLICY_HTML);

  return (
    <div className="min-h-screen">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f3f4f6]">
        <div className="flex  items-center justify-between gap-3 bg-[#b76424] px-3 py-1.5 sm:px-4 sm:py-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-white cursor-pointer"
            aria-label="Go back"
          >
            <FiChevronLeft className="text-[18px]" />
            <span className="text-[22px] font-semibold sm:text-[24px]">Privacy Policy</span>
          </button>

          <button
            type="button"
            className="rounded-md bg-white px-5 py-1.5 text-[15px] font-medium text-[#b76424] cursor-not-allowed opacity-60"
            disabled
            title="Static content - not editable"
          >
            Save
          </button>
        </div>

        <div className="p-3 sm:p-4">
          <div className="rounded-xl border border-[#d8dde4] bg-[#f7f7f8] p-2 sm:p-3">
            <EditorProvider>
              <Editor
                value={html}
                onChange={(event) => setHtml(event.target.value)}
                disabled={true}
                containerProps={{
                  style: {
                    minHeight: "620px",
                    border: "0",
                    borderRadius: "10px",
                    background: "#f7f7f8",
                  },
                }}
                style={{
                  minHeight: "560px",
                  fontSize: "18px",
                  lineHeight: "1.8",
                  color: "#454b54",
                  padding: "14px 16px",
                  border: "0",
                  background: "#f7f7f8",
                }}
              >
                <Toolbar>
                  <BtnFontSize />
                  <Separator />
                  <BtnStyles />
                  <Separator />
                  <BtnUndo />
                  <BtnRedo />
                  <Separator />
                  <BtnBold />
                  <BtnItalic />
                  <BtnUnderline />
                  <BtnStrikeThrough />
                  <Separator />
                  <BtnAlignLeft />
                  <BtnAlignCenter />
                  <BtnAlignRight />
                  <Separator />
                  <BtnOutdent />
                  <BtnIndent />
                  <Separator />
                  <BtnNumberedList />
                  <BtnBulletList />
                  <Separator />
                  <BtnLink />
                  <BtnClearFormatting />
                </Toolbar>
              </Editor>
            </EditorProvider>
          </div>
        </div>
      </section>
    </div>
  );
}