import { DragNav } from "@/components/lab/drag-nav";
import { PageTitle } from "@/components/lab/page-title";
import { PhoneFrame } from "@/components/lab/phone-frame";

// The nav and the title both live in the layout, so they survive navigation —
// the nav keeps its gesture state and the title can cross-fade instead of remounting.
export default function DragNavLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PhoneFrame>
      <PageTitle />
      {children}
      <DragNav />
    </PhoneFrame>
  );
}
