/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseHost = supabaseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

const remotePatterns = [
  {
    protocol: "https",
    hostname: "culgsgnvmmcdnfuoayok.supabase.co",
    pathname: "/storage/v1/object/public/**",
  },
];

if (supabaseHost && !remotePatterns.some((pattern) => pattern.hostname === supabaseHost)) {
  remotePatterns.push({
    protocol: "https",
    hostname: supabaseHost,
    pathname: "/storage/v1/object/public/**",
  });
}

const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns,
  },
};

export default nextConfig;
