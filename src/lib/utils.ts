import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário para combinar classes CSS do Tailwind de forma condicional e segura.
 * Resolve conflitos automáticos de especificidade (ex: se passar 'p-2' e depois 'p-4', 'p-4' vence).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
