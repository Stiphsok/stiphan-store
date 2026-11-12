import { clsx } from "/vendor/clsx.js";
import { twMerge } from "/vendor/tailwind-merge.js";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
