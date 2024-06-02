import { hostname } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: hostname['uploadthing.com', 'utfs.io', 'img.clerk.com', 'subdomain', 'files.stripe.com']
    }
};

export default nextConfig;
