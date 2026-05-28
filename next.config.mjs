import createNextIntlPlugin from "next-intl/plugin";

// Points the plugin at our request config so it can load the per-locale
// message catalog on every server render.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
