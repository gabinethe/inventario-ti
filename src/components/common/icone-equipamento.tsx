import React from "react";
import {
  Laptop,
  Monitor,
  Smartphone,
  Headphones,
  Mouse,
  Keyboard,
  Webcam,
  Usb,
  Plug,
  Printer,
  Package,
  Boxes,
} from "lucide-react";
import { TipoEquipamento } from "@/types";

export interface IconeEquipamentoProps {
  tipo?: TipoEquipamento | string;
  subtipo?: string | null;
  modelo?: string | null;
  className?: string;
}

/**
 * Retorna o ícone apropriado e específico com base no tipo, subtipo e modelo do equipamento.
 * Se for periférico, diferencia inteligentemente entre Mouse, Teclado, Headset, Webcam, Hub USB, Carregador, etc.
 */
export function getIconeEquipamento(
  item?: { tipo?: string; subtipo?: string | null; modelo?: string | null },
  className = "w-4 h-4"
): React.ReactElement {
  const tipoLimpo = item?.tipo?.toLowerCase() || "";
  const subtipoLimpo = item?.subtipo?.toLowerCase() || "";
  const modeloLimpo = item?.modelo?.toLowerCase() || "";

  if (tipoLimpo === "notebook") {
    return <Laptop className={className} />;
  }

  if (tipoLimpo === "monitor") {
    return <Monitor className={className} />;
  }

  if (tipoLimpo === "smartphone" || tipoLimpo === "celular") {
    return <Smartphone className={className} />;
  }

  // Identificação inteligente para Periféricos e Acessórios
  if (tipoLimpo === "periferico" || tipoLimpo === "acessorio" || tipoLimpo === "outro") {
    // 1. Mouse
    if (
      subtipoLimpo.includes("mouse") ||
      modeloLimpo.includes("mouse") ||
      modeloLimpo.includes("trackball") ||
      modeloLimpo.includes("mx master") ||
      modeloLimpo.includes("g502") ||
      modeloLimpo.includes("g305")
    ) {
      return <Mouse className={className} />;
    }

    // 2. Teclado
    if (
      subtipoLimpo.includes("teclado") ||
      subtipoLimpo.includes("keyboard") ||
      modeloLimpo.includes("teclado") ||
      modeloLimpo.includes("keyboard") ||
      modeloLimpo.includes("mx keys") ||
      modeloLimpo.includes("mechanical") ||
      modeloLimpo.includes("keychron")
    ) {
      return <Keyboard className={className} />;
    }

    // 3. Headset / Fone / Áudio
    if (
      subtipoLimpo.includes("headset") ||
      subtipoLimpo.includes("fone") ||
      subtipoLimpo.includes("headphone") ||
      subtipoLimpo.includes("earphone") ||
      subtipoLimpo.includes("audio") ||
      modeloLimpo.includes("headset") ||
      modeloLimpo.includes("fone") ||
      modeloLimpo.includes("vibe") ||
      modeloLimpo.includes("hyperx") ||
      modeloLimpo.includes("airpods")
    ) {
      return <Headphones className={className} />;
    }

    // 4. Webcam / Câmera
    if (
      subtipoLimpo.includes("webcam") ||
      subtipoLimpo.includes("camera") ||
      modeloLimpo.includes("webcam") ||
      modeloLimpo.includes("camera") ||
      modeloLimpo.includes("c920") ||
      modeloLimpo.includes("c922") ||
      modeloLimpo.includes("brio")
    ) {
      return <Webcam className={className} />;
    }

    // 5. Hub USB / Dock Station / Adaptador
    if (
      subtipoLimpo.includes("hub") ||
      subtipoLimpo.includes("dock") ||
      subtipoLimpo.includes("usb") ||
      subtipoLimpo.includes("adaptador") ||
      modeloLimpo.includes("hub") ||
      modeloLimpo.includes("dock") ||
      modeloLimpo.includes("da310") ||
      modeloLimpo.includes("wd19")
    ) {
      return <Usb className={className} />;
    }

    // 6. Carregador / Fonte / Energia
    if (
      subtipoLimpo.includes("carregador") ||
      subtipoLimpo.includes("fonte") ||
      subtipoLimpo.includes("cabo") ||
      modeloLimpo.includes("carregador") ||
      modeloLimpo.includes("fonte") ||
      modeloLimpo.includes("power")
    ) {
      return <Plug className={className} />;
    }

    // 7. Impressora
    if (
      subtipoLimpo.includes("impressora") ||
      subtipoLimpo.includes("printer") ||
      modeloLimpo.includes("impressora") ||
      modeloLimpo.includes("printer")
    ) {
      return <Printer className={className} />;
    }

    // Padrão de periférico / acessório se não especificado
    return <Package className={className} />;
  }

  return <Boxes className={className} />;
}

/**
 * Componente JSX para renderização direta do ícone.
 */
export function IconeEquipamento({
  tipo,
  subtipo,
  modelo,
  className = "w-4 h-4",
}: IconeEquipamentoProps) {
  return getIconeEquipamento({ tipo, subtipo, modelo }, className);
}
