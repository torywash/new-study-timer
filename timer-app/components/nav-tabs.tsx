"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useSessionLock } from "@/hooks/use-session-lock";

const NAV_ITEMS = [
  { href: "/", label: "Timer" },
  { href: "/tasks", label: "Tasks" },
  { href: "/achievements", label: "Achievements" },
  { href: "/settings", label: "Settings" },
];

type IndicatorRect = { left: number; width: number };

export function NavTabs() {
  const pathname = usePathname();
  const { isLocked } = useSessionLock();
  const containerRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLElement | null>>({});
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);

  // Measure the active tab's own position/width and slide a plain
  // background pill to match — a horizontal-only translate/width
  // transition, rather than relying on the browser's automatic view
  // transition group morph (which interpolates position and size together
  // and can look like it's scaling in diagonally when tab widths differ).
  useEffect(() => {
    const activeLink = linkRefs.current[pathname];
    const container = containerRef.current;
    if (!activeLink || !container) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeLink.getBoundingClientRect();
    setIndicator({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    });
  }, [pathname]);

  return (
    <nav ref={containerRef} className="relative flex items-center gap-1">
      {indicator && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 z-0 rounded-lg bg-secondary transition-[left,width] duration-200 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const className = cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "relative z-10",
          isActive && "text-secondary-foreground pointer-events-none"
        );

        if (isLocked && !isActive) {
          return (
            <span
              key={item.href}
              ref={(el) => {
                linkRefs.current[item.href] = el;
              }}
              className={cn(className, "cursor-not-allowed opacity-50")}
              onClick={() =>
                toast.add({
                  title: "Tab locked",
                  description:
                    "Finish or pause your session to switch tabs.",
                  type: "warning",
                })
              }
            >
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            ref={(el) => {
              linkRefs.current[item.href] = el;
            }}
            aria-current={isActive ? "page" : undefined}
            className={className}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
