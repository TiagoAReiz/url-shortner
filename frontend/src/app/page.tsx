import { CreateLinkForm } from '@/components/CreateLinkForm';
import { LoginHint } from '@/components/LoginHint';

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8 py-8 sm:py-16">
      <section className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Encurte links em{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
            segundos
          </span>
        </h1>
        <p className="max-w-md text-base text-zinc-600 dark:text-zinc-400">
          Transforme qualquer endereço longo em um link curto e fácil de
          compartilhar.
        </p>
      </section>

      <CreateLinkForm />
      <LoginHint />
    </div>
  );
}
