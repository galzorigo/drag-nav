import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Several lockfiles exist above this folder; pin the root so Turbopack stops guessing.
  turbopack: { root: __dirname },

  // Testing on a real phone means loading the dev server over the LAN, which Next
  // treats as a cross-origin request and blocks — HMR and the client chunks never
  // arrive, so the page renders but never hydrates. Allow the private ranges.
  allowedDevOrigins: ["192.168.1.80", "192.168.1.*", "10.*.*.*", "172.16.*.*"],
};

export default nextConfig;
