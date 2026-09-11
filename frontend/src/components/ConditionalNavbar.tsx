"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function ConditionalNavbar() {
  // Always render the global Navbar; admin layout already excludes it
  return <Navbar />;
}
