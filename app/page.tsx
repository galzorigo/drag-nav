import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { PhoneFrame } from "@/components/lab/phone-frame";

const EXPERIMENTS = [
  {
    href: "/drag-nav/a",
    title: "Drag nav",
    blurb: "Press, drag, release to switch pages.",
  },
];

export default function Home() {
  return (
    <PhoneFrame caption="mobile lab">
      <div
        className="absolute inset-x-0 px-[24px]"
        style={{ top: "calc(var(--chrome-top) + 40px)" }}
      >
        <h1 className="text-[32px] font-bold leading-none tracking-[-0.8px] text-black">
          Lab
        </h1>
        <ul className="mt-[24px] flex flex-col gap-[4px]">
          {EXPERIMENTS.map((experiment) => (
            <li key={experiment.href}>
              <Link
                href={experiment.href}
                className="smooth flex items-center justify-between rounded-[16px] bg-black/5 px-[12px] py-[12px] text-black transition-transform duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]"
              >
                <span>
                  <span className="block text-[14px] font-medium leading-tight">
                    {experiment.title}
                  </span>
                  <span className="block text-[12px] leading-tight text-black/45">
                    {experiment.blurb}
                  </span>
                </span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PhoneFrame>
  );
}
