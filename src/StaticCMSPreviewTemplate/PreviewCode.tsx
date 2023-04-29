import React from "react";

type Props = {
  showPreview: boolean;
  pageCode: string | undefined;
  breakpoint: string;
};

function PreviewCode({ showPreview, pageCode, breakpoint }: Props) {
  return (
    <div className={showPreview ? "hidden" : "block"}>
      <pre
        className={`overflow-auto rounded-lg p-4 ring-2 ring-black ${breakpoint}`}
      >
        <code className="language-html">{pageCode}</code>
      </pre>
    </div>
  );
}

export default PreviewCode;
