import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware Guardião de Segurança da Aplicação.
 * Intercepta todas as requisições para renovar tokens e proteger rotas privadas.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas da aplicação, exceto:
     * - _next/static (arquivos estáticos compilados)
     * - _next/image (imagens otimizadas)
     * - favicon.ico (ícone do navegador)
     * - arquivos com extensões comuns (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
