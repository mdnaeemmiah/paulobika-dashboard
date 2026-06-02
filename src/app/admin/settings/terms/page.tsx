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
  BtnStyles,
  BtnUnderline,
  BtnUndo,
  Editor,
  EditorProvider,
  Separator,
  Toolbar,
  createButton,
  createDropdown,
} from "react-simple-wysiwyg";

const STORAGE_KEY = "dashboard_terms_html";

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

const DEFAULT_TERMS_HTML = `<p>lacus nulla eu netus pretium. Pellentesque scelerisque tellus nisl eu nisl sed senectus nunc. Porta sollicitudin vel elit varius nulla sit diam sed. Bibendum elit facilisi nulla viverra augue pellentesque gravida morbi.</p>
<p>Diam pellentesque orci eget gravida cursus. Ut ut nulla sapien eget vitae at eget pretium. Tristique nibh ipsum iaculis quam. Vestibulum magna cursus facilisis adipiscing cras dui. Risus auctor faucibus orci tortor tristique elit. Sit tincidunt id felis malesuada placerat ultricies enim. Purus ut congue ornare id sed. Enim libero tincidunt facilisis non facilisis mattis praesent. Magna volutpat at cras urna adipiscing vitae velit enim volutpat. Ac tincidunt et sed dolor ipsum. Purus nunc turpis scelerisque pellentesque lectus mauris imperdiet. Turpis orci consectetur enim posuere faucibus praesent.</p>
<p>Ut suscipit cursus id mauris. Accumsan egestas sit arcu sed. Feugiat tortor pharetra id ipsum elit diam viverra tortor. Mattis tincidunt eget ut nunc in. Mauris ipsum ut purus laoreet nisi eu viverra velit adipiscing. Diam sit cursus id semper sit. Urna morbi nisl est vel tincidunt.</p>`;

export default function SettingsTermsPage() {
  const router = useRouter();
  const [html, setHtml] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_TERMS_HTML;
    }

    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_TERMS_HTML;
  });

  const handleSave = () => {
    window.localStorage.setItem(STORAGE_KEY, html);
  };

  return (
    <div className="min-h-screen">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f3f4f6]">
        <div className="flex items-center justify-between gap-3 bg-[#b76424] px-3 py-1.5 sm:px-4 sm:py-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-white cursor-pointer"
            aria-label="Go back"
          >
            <FiChevronLeft className="text-[18px]" />
            <span className="text-[22px] font-semibold sm:text-[24px]">Terms & Conditions</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-white px-5 py-1.5 text-[15px] font-medium text-[#b76424]"
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