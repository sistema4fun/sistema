// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative min-h-[100svh] flex items-center justify-center">
      {/* Fundo + overlay */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/fundo.png')" }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-black/50 backdrop-blur-sm" aria-hidden />

      {/* Conteúdo central */}
      <div className="w-full max-w-[520px] px-5 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <img
            src="/logo-4fun.svg"
            alt="Sistema 4FUN"
            className="w-64 md:w-80 h-auto drop-shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
          />
          <p className="mt-4 text-neutral-200 text-base md:text-lg font-semibold tracking-wide">
            Bem-vindo ao Sistema 4FUN
          </p>
        </div>

        {/* Botões */}
        <div className="mt-8 grid gap-3">
          <Link
            href="/dashboard"
            className="block w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 
                       text-white font-extrabold text-xl tracking-wide hover:bg-white/15 transition shadow-xl"
          >
            Dashboard
          </Link>
          <Link
            href="/metodos"
            className="block w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 
                       text-white font-extrabold text-xl tracking-wide hover:bg-white/15 transition shadow-xl"
          >
            Métodos
          </Link>
          <Link
            href="/esportes"
            className="block w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 
                       text-white font-extrabold text-xl tracking-wide hover:bg-white/15 transition shadow-xl"
          >
            Esportes
          </Link>
          <Link
            href="/notas"
            className="block w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 
                       text-white font-extrabold text-xl tracking-wide hover:bg-white/15 transition shadow-xl"
          >
            Anotações
          </Link>
          <Link
            href="/ferramentas/calculadora"
            className="block w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 
                       text-white font-extrabold text-xl tracking-wide hover:bg-white/15 transition shadow-xl"
          >
            Calculadora
          </Link>
        </div>

        {/* Rodapé */}
        <div className="mt-8">
          <p className="text-sm md:text-base text-white/70 font-semibold">
            © 2025 Sistema 4FUN — Todos os direitos reservados.
          </p>
        </div>
      </div>
    </main>
  );
}
