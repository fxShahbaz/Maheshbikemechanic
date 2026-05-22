"use client";

import type { ReactNode } from "react";
import { useEnquiryDialog } from "./EnquiryDialog";

type Props = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export default function EnrollButton({
  children,
  className,
  ariaLabel,
}: Props) {
  const { open } = useEnquiryDialog();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </button>
  );
}
