import {defineRouting} from 'next-intl/routing';
import createMiddleware from 'next-intl/middleware';

export const routing = defineRouting({
  locales: ['th', 'en'],
  defaultLocale: 'th',
  localePrefix: 'as-needed',
  localeDetection: false
});

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(th|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
