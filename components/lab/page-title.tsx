"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { NAV_ITEMS } from "./nav-items";

const SHIFT = 14;
const IN = { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const };
const OUT = { duration: 0.2, ease: [0.4, 0, 0.6, 1] as const };

/**
 * Travels with you: going down the menu the old title leaves upward and the new
 * one arrives from below, and going back up it reverses.
 *
 * Lives in the layout rather than in each page, because a per-route component
 * would remount on navigation and AnimatePresence would never see the swap.
 */
export function PageTitle() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const index = Math.max(
    NAV_ITEMS.findIndex((item) => pathname.startsWith(item.href)),
    0,
  );

  // Direction has to be derived during render, not in an effect: the exiting
  // title needs it on the same commit it is removed on.
  const [nav, setNav] = useState({ index, dir: 1 });
  if (nav.index !== index) setNav({ index, dir: index > nav.index ? 1 : -1 });

  const variants = reduce
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1, transition: IN },
        exit: { opacity: 0, transition: OUT },
      }
    : {
        enter: (dir: number) => ({
          opacity: 0,
          y: dir > 0 ? SHIFT : -SHIFT,
          filter: "blur(4px)",
        }),
        center: { opacity: 1, y: 0, filter: "blur(0px)", transition: IN },
        exit: (dir: number) => ({
          opacity: 0,
          y: dir > 0 ? -SHIFT : SHIFT,
          filter: "blur(4px)",
          transition: OUT,
        }),
      };

  return (
    <div
      className="absolute inset-x-0 flex items-center justify-center"
      style={{ top: "var(--chrome-top)", bottom: "var(--chrome-bottom)" }}
    >
      {/* Fixed height so the absolutely placed titles can overlap mid-swap
          without the centring collapsing. */}
      <div className="relative h-[32px] w-full">
        {/* `custom` on AnimatePresence is what reaches the exiting title —
            it is replayed as last rendered, so its own props are already stale. */}
        <AnimatePresence initial={false} custom={nav.dir}>
          <motion.span
            key={pathname}
            custom={nav.dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-x-0 block text-center text-[32px] font-bold leading-none tracking-[-0.8px] text-black"
          >
            {NAV_ITEMS[index].label}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
