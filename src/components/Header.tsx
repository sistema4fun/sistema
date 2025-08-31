'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function PrimaryButton({
  href, children, onClick, className,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cx(
        'px-6 py-2.5 rounded-lg text-xl font-extrabold uppercase tracking-wide',
        'bg-[#db001b] text-white transition',
        'hover:bg-[#e00020] hover:scale-105 hover:shadow-lg',
        'active:bg-[#b80018]',
        'shadow-md shadow-red-900/30',
        className
      )}
    >
      {children}
    </Link>
  );
}

function MenuItem({
  href, svgSrc, label, onClick,
}: {
  href: string;
  svgSrc: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cx(
        'flex items-center gap-4',
        'px-4 py-3.5 rounded-lg',
        'hover:bg-white/10 transition-colors',
        'text-lg font-extrabold tracking-wide'
      )}
    >
      <img
        src={svgSrc}
        alt={label}
        width={30}
        height={30}
        loading="lazy"
        decoding="async"
        className="shrink-0 block h-[30px] w-[30px] object-contain"
      />
      <span className="leading-none translate-y-[1px]">{label}</span>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open || !menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-neutral-950/50 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Esquerda */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir menu"
              onClick={() => setOpen(v => !v)}
              className={cx(
                'relative inline-flex h-10 w-10 items-center justify-center',
                'rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur transition',
                'border border-white/15'
              )}
            >
              <img
                src={open ? '/btn/menu-white.svg' : '/btn/menu-red.svg'}
                alt="Menu"
                width={24}
                height={24}
                loading="eager"
                decoding="async"
              />
            </button>

            <Link href="/" className="flex items-center gap-2 select-none">
              <img
                src="/logo-4fun.svg"
                alt="4FUN"
                width={160}
                height={46}
                loading="eager"
                decoding="async"
              />
            </Link>
          </div>

          {/* Direita (sem botão extra de Dash Esportes) */}
          <nav className="hidden sm:flex items-center gap-4">
            <PrimaryButton href="/dashboard">Dashboard</PrimaryButton>
            <PrimaryButton href="/ferramentas/calculadora">Calculadora</PrimaryButton>
            <PrimaryButton href="/notas">Anotações</PrimaryButton>
          </nav>
        </div>
      </div>

      {/* Menu flutuante */}
      {open && (
        <div
          ref={menuRef}
          className="absolute left-3 top-[4.25rem] sm:left-6 z-50"
          role="menu"
          aria-label="Menu principal"
        >
        <div className="w-80 rounded-3xl bg-neutral-950/95 backdrop-blur border border-white/10 p-4 shadow-xl">
            {/* Mobile: ações */}
            <div className="sm:hidden grid gap-3 mb-3">
              <PrimaryButton href="/dashboard" onClick={() => setOpen(false)}>Dashboard</PrimaryButton>
              <PrimaryButton href="/ferramentas/calculadora" onClick={() => setOpen(false)}>Calculadora</PrimaryButton>
              <PrimaryButton href="/notas" onClick={() => setOpen(false)}>Notas</PrimaryButton>
              <div className="h-px bg-white/10" />
            </div>

            {/* Entradas */}
            <div className="mb-3">
              <p className="px-2 pb-1 text-base font-extrabold tracking-wider text-neutral-200 uppercase">
                Entradas
              </p>
              <div className="grid">
                <MenuItem href="/metodos" svgSrc="/icons/cassino.svg" label="Métodos" onClick={() => setOpen(false)} />
                <MenuItem href="/esportes" svgSrc="/icons/futebol.svg" label="Esportes" onClick={() => setOpen(false)} />
              </div>
            </div>

            <div className="h-px bg-white/10 my-3" />

            {/* Dashboards */}
            <div>
              <p className="px-2 pb-1 text-base font-extrabold tracking-wider text-neutral-200 uppercase">
                Dashboards
              </p>
              <div className="grid">
                <MenuItem href="/dashboard/metodos" svgSrc="/icons/grafico.svg" label="Métodos" onClick={() => setOpen(false)} />
                {/* ✅ atualizado: apontando para o NOVO dashboard de esportes */}
                <MenuItem href="/dashboard/esportes" svgSrc="/icons/linha.svg" label="Esportes" onClick={() => setOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
