
import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function ClientOnly({ children, fallback = <div>Laster…</div> }) {
  return <BrowserOnly fallback={fallback}>{() => children}</BrowserOnly>;
}
