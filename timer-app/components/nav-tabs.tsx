"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Timer" },
  { href: "/tasks", label: "Tasks" },
  { href: "/achievements", label: "Achievements" },
  { href: "/settings", label: "Settings" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Button
            key={item.href}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            render={<Link href={item.href} />}
            nativeButton={false}
            className={cn(isActive && "pointer-events-none")}
          >
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
