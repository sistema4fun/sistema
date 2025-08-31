import './globals.css';
import ClientHeaderGate from '@/components/ClientHeaderGate';

// ⬇️ Providers novos
import ToastProvider from '@/components/ui/toast/ToastProvider';
import ConfirmProvider from '@/components/ui/modal/ConfirmProvider';

export const metadata = {
  title: '4FUN',
  description: 'Sistema 4FUN',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="font-minhafont text-neutral-100">
      {/* Sem bg-* aqui para não tampar a imagem do body */}
      <body className="antialiased">
        {/* Header só fora da home; inclui um espaçador equivalente ao pt-20 */}
        <ClientHeaderGate />

        {/* Providers globais para toasts e confirmação */}
        <ConfirmProvider>
          <ToastProvider>
            {/* main sem padding fixo; a home fica limpa e as outras rotas 
                ganham o espaçamento via ClientHeaderGate */}
            <main>{children}</main>
          </ToastProvider>
        </ConfirmProvider>
      </body>
    </html>
  );
}
