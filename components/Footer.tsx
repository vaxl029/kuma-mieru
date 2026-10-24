'use client';

import type { SiteConfig } from '@/types/config';
import { DEFAULT_SITE_TITLE } from '@/config/defaults';
import { Link } from '@heroui/react';

import packageJson from '@/package.json';

interface FooterProps {
  config?: SiteConfig;
  copyrightTitle?: string;
}

export function Footer({ config, copyrightTitle = DEFAULT_SITE_TITLE }: FooterProps) {
  const footerConfig = config;

  const showPoweredBy = footerConfig?.showPoweredBy ?? false;

  return (
    <footer className="w-full flex flex-col items-center justify-center py-4 px-4 mt-4 text-sm text-foreground-500 relative z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-2 md:mb-0 text-sm font-bold">
          © {new Date().getFullYear()} {copyrightTitle}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 text-sm font-bold [&>*]:whitespace-nowrap">
          <span>Powered by</span>
          {showPoweredBy ? (
            <>
              <Link
                href="https://github.com/louislam/uptime-kuma"
                isExternal
                className="text-primary text-xs"
              >
                Uptime Kuma
              </Link>
              <span>&</span>
              <Link
                href="https://github.com/alice39s/kuma-mieru"
                isExternal
                className="text-primary text-xs"
              >
                Kuma Mieru v{packageJson.version}
              </Link>
            </>
          ) : (
            <>
              <span>Uptime Kuma</span>
              <span>&</span>
              <span>Kuma Mieru v{packageJson.version}</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
