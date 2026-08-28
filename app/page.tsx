import { redirect } from "next/navigation";

// No index screen — the app opens straight onto the nav experiment's Home page.
export default function Root() {
  redirect("/drag-nav/a");
}
