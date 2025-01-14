import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ["en", "de", "jp", "fr", "es", "it", "pt", "ru", "ko", "ch", "ar", "hi", "nl"],

    // Used when no locale matches
    defaultLocale: "en",
    localePrefix: "as-needed",
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
