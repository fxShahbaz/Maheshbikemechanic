import type { CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
  dark?: boolean;
};

export default function Skeleton({ className = "", style, dark }: Props) {
  return (
    <div
      aria-hidden
      style={style}
      className={`skeleton${dark ? " skeleton-dark" : ""} rounded-md ${className}`}
    />
  );
}
