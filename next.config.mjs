/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow the embeddable widget script/iframe to be loaded from other sites.
  async headers() {
    return [
      {
        source: "/widget.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=300" },
        ],
      },
    ];
  },
};

export default nextConfig;
