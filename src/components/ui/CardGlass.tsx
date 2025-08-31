import React from 'react';
import Link from 'next/link';

type CardGlassProps = {
  /** Conteúdo do card */
  children: React.ReactNode;
  /** Classe extra opcional para ajustar espaçamento/layout */
  className?: string;
  /** Título simples opcional (aparece no topo do card) */
  title?: string;
  /** Subtítulo opcional (linha menor abaixo do título) */
  subtitle?: string;
  /** Se quiser que o card seja clicável e leve para uma rota */
  href?: string;
  /** Desabilita hover/efeito de clique */
  disabled?: boolean;
};

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/**
 * Card vidro (glassmorphism) reutilizável.
 * - Usa fundo translúcido + blur + borda suave.
 * - Pode ter título/subtítulo.
 * - Pode ser "clicável" passando `href`.
 */
export default function CardGlass({
  children,
  className,
  title,
  subtitle,
  href,
  disabled,
}: CardGlassProps) {
  const base = cx(
    // vidro
    'rounded-2xl bg-white/10 backdrop-blur',
    'border border-white/15 shadow-md',
    // espacamento padrão
    'p-4',
    // animações/hover
    !disabled && (href ? 'transition hover:bg-white/15 hover:shadow-lg' : 'transition'),
    // foco acessível quando clicável
    href && 'focus-within:ring-2 focus-within:ring-red-400/60',
    className
  );

  const content = (
    <>
      {(title || subtitle) && (
        <div className="mb-2">
          {title && <h3 className="text-base font-semibold leading-none">{title}</h3>}
          {subtitle && (
            <p className="text-xs text-neutral-300/80 mt-1 leading-none">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </>
  );

  // Se tiver href, vira um Link clicável
  if (href && !disabled) {
    return (
      <Link href={href} className={base}>
        {content}
      </Link>
    );
  }

  // Caso padrão (div)
  return <div className={base}>{content}</div>;
}
