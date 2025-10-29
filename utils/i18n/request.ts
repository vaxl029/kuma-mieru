import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './config';
import { getUserLocale } from './locale';

export default getRequestConfig(async () => {
  const locale = (await getUserLocale()) || defaultLocale;
  const timeZone = process.env.TIMEZONE || 'UTC';
  return {
    locale,
    timeZone,
    formats: {
      dateTime: {
        normal: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        },
      },
    },
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
