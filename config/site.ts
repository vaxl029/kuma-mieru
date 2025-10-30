'use client';

import { env } from './env';

const baseConfig = {
  name: 'Kuma Mieru',
  description: 'A beautiful and modern uptime monitoring dashboard',
  icon: '/icon.svg',
} as const;

interface NavItem {
  label: string;
  href: string;
  external: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'page.main',
    href: '/',
    external: false,
  },
  {
    label: 'page.edit',
    href: `${env.config.baseUrl}/manage-status-page`,
    external: true,
  },
];

export const resolveIconUrl = (iconPath?: string, baseUrl?: string): string => {
  if (!iconPath) return baseConfig.icon;

  if (iconPath.startsWith('http')) {
    return iconPath;
  }

  if (iconPath === baseConfig.icon) {
    return baseConfig.icon;
  }

  const proxyEnabled =
    (typeof window !== 'undefined' && (window as any).__USE_IMAGE_PROXY__ === true) ||
    (typeof window === 'undefined' && process.env.USE_IMAGE_PROXY === 'true');

  if (proxyEnabled && iconPath.startsWith('/upload/')) {
    return `/api/image-proxy?path=${encodeURIComponent(iconPath)}`;
  }

  const effectiveBaseUrl = baseUrl || (typeof window === 'undefined' ? env.config.baseUrl : '');

  if (!effectiveBaseUrl) {
    console.warn('[resolveIconUrl] No baseUrl provided, returning relative path:', iconPath);
    return iconPath;
  }

  return `${effectiveBaseUrl}/${iconPath.replace(/^\//, '')}`;
};

export const resolveIconCandidates = (icons: string[], baseUrl?: string): string[] => {
  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const icon of icons) {
    const resolved = resolveIconUrl(icon, baseUrl);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    deduped.push(resolved);
  }

  if (deduped.length === 0) {
    const fallback = resolveIconUrl(undefined, baseUrl);
    deduped.push(fallback);
  }

  return deduped;
};

const getVisibleNavItems = (items: NavItem[]): NavItem[] => {
  return items.filter((item) => (item.label !== 'page.edit' ? true : env.config.isEditThisPage));
};

const iconCandidates = resolveIconCandidates(env.config.siteMeta.iconCandidates);

export const siteConfig = {
  name: env.config.siteMeta.title || baseConfig.name,
  description: env.config.siteMeta.description || baseConfig.description,
  icon: iconCandidates[0],
  iconCandidates,
  navItems: getVisibleNavItems(navItems),
  navMenuItems: getVisibleNavItems(navItems),
  links: {
    github: 'https://github.com/Alice39s/kuma-mieru',
    docs: 'https://github.com/Alice39s/kuma-mieru/blob/main/README.md',
  },
} as const;

export type SiteConfig = typeof siteConfig;
