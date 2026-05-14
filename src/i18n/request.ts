import { getRequestConfig } from 'next-intl/server';

export const locales = ['th', 'en'];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    locale = 'th';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
