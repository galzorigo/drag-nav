"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowVerticalIcon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
} from "motion/react";

import { NAV_ITEMS as ITEMS } from "./nav-items";



const LAST = ITEMS.length - 1;

/* Geometry — JS and CSS read the same numbers so the drag maths can't drift. */
const ROW_H = 44;
const ROW_GAP = 6;
const PITCH = ROW_H + ROW_GAP; // one menu item of travel
const CARD_PAD = 8;
const CARD_W = 200;
const CARD_H = CARD_PAD * 2 + ROW_H * 3 + ROW_GAP * 2;
const TRIGGER = 44;
/* Release inside this window without having left the first row and it was a tap,
   not a selection — the menu closes where it stands instead of navigating. */
const TAP_MS = 140;
const DOT = 5;
const PILL_W = 20;
const PILL_H = 44;

/* Horizontal layout, measured inward from the right edge of the screen.
   The indicator sits 24px off the trigger and 12px off the menu. */
const TRIGGER_RIGHT = 18;
const PILL_RIGHT = TRIGGER_RIGHT + TRIGGER + 24;
const CARD_RIGHT = PILL_RIGHT + PILL_W + 12;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Past the first/last item the highlight keeps moving, but less and less. */
function rubberband(overshoot: number, dimension = 30, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

export function DragNav() {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(0);

  const pointerIdRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const startedAtRef = useRef(0);
  const targetRef = useRef(0);

  // One spring drives both the highlight and the arrow pill, so they are
  // physically incapable of drifting out of line with each other.
  const offset = useSpring(
    0,
    reduce ? { duration: 0.12, bounce: 0 } : { stiffness: 380, damping: 30, mass: 0.85 },
  );
  const translate = useMotionTemplate`translateY(${offset}px)`;

  const currentIndex = ITEMS.findIndex((item) => pathname.startsWith(item.href));

  useEffect(() => {
    ITEMS.forEach((item) => router.prefetch(item.href));
  }, [router]);

  const moveTo = useCallback(
    (index: number, px = index * PITCH) => {
      offset.set(px);
      if (index !== targetRef.current) {
        targetRef.current = index;
        setTarget(index);
        navigator.vibrate?.(6); // snap confirmation, same frame as the visual
      }
    },
    [offset],
  );

  const expand = useCallback(() => {
    // Always opens on the first item, whatever page you are on.
    targetRef.current = 0;
    setTarget(0);
    offset.jump(0);
    setOpen(true);
  }, [offset]);

  const collapse = useCallback(
    (commit: boolean) => {
      setOpen(false);
      if (commit) {
        const href = ITEMS[targetRef.current].href;
        if (href !== pathname) router.push(href);
      }
    },
    [pathname, router],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== null) return; // a second finger must not hijack the drag
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    startYRef.current = e.clientY;
    startedAtRef.current = performance.now();
    expand();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;

    const travelled = (e.clientY - startYRef.current) / PITCH;
    const index = clamp(Math.round(travelled), 0, LAST);

    const over = travelled < 0 ? travelled : travelled > LAST ? travelled - LAST : 0;
    moveTo(index, index * PITCH + (over ? rubberband(over * PITCH) : 0));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    pointerIdRef.current = null;
    offset.set(targetRef.current * PITCH); // let any rubber-band settle home
    // A fast flick that already reached another row still counts as a choice —
    // only a quick release that never left the first row is treated as a tap.
    const tapped =
      targetRef.current === 0 && performance.now() - startedAtRef.current < TAP_MS;
    collapse(!tapped);
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    pointerIdRef.current = null;
    collapse(false);
  };

  // Keyboard equivalent of the gesture: open, arrow through, enter to commit.
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) collapse(true);
      else expand();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      moveTo(clamp(targetRef.current + (e.key === "ArrowDown" ? 1 : -1), 0, LAST));
    } else if (e.key === "Escape") {
      e.preventDefault();
      collapse(false);
    }
  };

  const enter = { duration: 0.25, ease: [0.23, 1, 0.32, 1] as const };
  // Leaves through the same states it arrived through, but eased so it moves from
  // the first frame — a strict time-reverse of `enter` held opacity above 0.99 for
  // 78ms, which read as the menu hanging after you let go.
  // This has to ride inside the `exit` target rather than the `transition` prop:
  // AnimatePresence replays the element as it was last rendered — while `open`
  // was still true — so a `transition={open ? ... : ...}` never sees the false
  // branch and the exit silently reuses the enter curve.
  const leave = { duration: 0.22, ease: [0.4, 0, 0.6, 1] as const };
  const dotEnter = { duration: 0.16, ease: [0.23, 1, 0.32, 1] as const };
  const dotLeave = { duration: 0.12, ease: [0.4, 0, 0.6, 1] as const };

  // The shell scales and fades. It must not carry a `filter` of its own — that
  // would make it a backdrop root and cancel the frosted blur beneath it.
  const shell = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: leave },
      }
    : {
        initial: { opacity: 0, transform: "scale(0.92)" },
        animate: { opacity: 1, transform: "scale(1)" },
        exit: { opacity: 0, transform: "scale(0.92)", transition: leave },
      };

  // So the blur rides on the contents instead — out to the same state it came from.
  const content = reduce
    ? {}
    : {
        initial: { filter: "blur(6px)" },
        animate: { filter: "blur(0px)" },
        exit: { filter: "blur(6px)", transition: leave },
      };

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            className="absolute"
            style={{
              top: "calc(var(--chrome-top) + 37px)",
              right: CARD_RIGHT,
              width: CARD_W,
              height: CARD_H,
            }}
          >
            <motion.div
              {...shell}
              transition={enter}
              className="z-10 material material-strong relative h-full w-full overflow-hidden rounded-[24px]"
              // Scales out of the trigger, which sits up and to the right of the card.
              style={{ transformOrigin: "139% 9.4%" }}
            >
              <motion.div
                {...content}
                transition={enter}
                className="absolute inset-0"
                style={{ padding: CARD_PAD }}
              >
                <motion.div
                  aria-hidden
                  className="absolute rounded-[16px] bg-black/5"
                  style={{
                    top: CARD_PAD,
                    left: CARD_PAD,
                    right: CARD_PAD,
                    height: ROW_H,
                    transform: translate,
                  }}
                />
                {currentIndex >= 0 && (
                  <motion.span
                    aria-hidden
                    className="absolute rounded-full bg-black"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)" }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
                    exit={
                      reduce
                        ? { opacity: 0, transition: dotLeave }
                        : { opacity: 0, filter: "blur(4px)", transition: dotLeave }
                    }
                    transition={dotEnter}
                    style={{
                      top: CARD_PAD + (ROW_H - DOT) / 2 + currentIndex * PITCH,
                      right: CARD_PAD + 12,
                      width: DOT,
                      height: DOT,
                    }}
                  />
                )}
                {ITEMS.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={reduce ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.18, delay: i * 0.025, ease: [0.23, 1, 0.32, 1] }}
                    className="relative flex items-center justify-between px-[12px] text-[14px] font-semibold leading-none tracking-[-0.04em] text-black"
                    style={{ height: ROW_H, marginBottom: i === LAST ? 0 : ROW_GAP }}
                  >
                    <span>{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="pill"
            className="absolute"
            style={{
              top: "calc(var(--chrome-top) + 45px)",
              right: PILL_RIGHT,
              transform: translate,
            }}
          >
            <motion.div
              {...shell}
              transition={enter}
              className="material flex items-center justify-center rounded-full text-black"
              style={{ width: PILL_W, height: PILL_H }}
            >
              <HugeiconsIcon icon={ArrowVerticalIcon} size={14} strokeWidth={2.5} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label={`Navigation — currently ${ITEMS[Math.max(currentIndex, 0)].label}. Press and drag down to switch.`}
        aria-expanded={open}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
        onBlur={() => open && collapse(false)}
        onContextMenu={(e) => e.preventDefault()}
        className="material pointer-events-auto absolute grid touch-none place-items-center rounded-full text-black transition-transform duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        style={{
          top: "calc(var(--chrome-top) + 30px)",
          right: TRIGGER_RIGHT,
          width: TRIGGER,
          height: TRIGGER,
        }}
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={20} strokeWidth={3.5} />
      </button>
    </div>
  );
}
