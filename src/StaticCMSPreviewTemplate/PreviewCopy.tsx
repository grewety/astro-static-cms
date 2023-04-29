import React from "react";
import { useState } from "react";
import { Button } from "@material-tailwind/react";
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

type Props = {
  pageCode: string;
};

function PreviewCopy({ pageCode }: Props) {
  const [buttonText, setButtonText] = useState("Copy");
  const [buttonIcon, setButtonIcon] = useState(
    <ClipboardDocumentListIcon strokeWidth={2} className="h-5 w-5" />
  );

  function copyToClipboard() {
    navigator.clipboard.writeText(pageCode).then(function () {
      setButtonIcon(
        <ClipboardDocumentCheckIcon strokeWidth={2} className="h-5 w-5" />
      );
      setButtonText("Copied");

      setTimeout(() => {
        setButtonIcon(
          <ClipboardDocumentListIcon strokeWidth={2} className="h-5 w-5" />
        );
        setButtonText("Copy");
      }, 3000);
    });
  }

  return (
    <Button
      variant="filled"
      size="sm"
      onClick={copyToClipboard}
      className="flex w-42 items-center gap-1 max-h-8"
    >
      {buttonIcon}
      {buttonText}
    </Button>
  );
}

export default PreviewCopy;
