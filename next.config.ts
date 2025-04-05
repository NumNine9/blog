import type { NextConfig } from "next";
// import { URL } from "next/dist/compiled/@edge-runtime/primitives/url";

const nextConfig: NextConfig = {
  /* config options here */
  // images: {
  //   remotePatterns: [new URL('cseiulqqvcunztldwmnc.supabase.co')], 
  // },
  images: {
    // domains: ["cseiulqqvcunztldwmnc.supabase.co"],
    // For Next.js 13+, you can also use `remotePatterns`:
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cseiulqqvcunztldwmnc.supabase.co",
        pathname: "/storage/v1/object/public/blog-images/**",
      },
    ],
  },
};

export default nextConfig;
