import Link from 'next/link';
import { API_URL, type LinkSummary } from '@/lib/api';

interface AdminLinksTableProps {
  links: LinkSummary[];
}

/** Tabela dos links mais acessados. Rola horizontalmente em telas pequenas. */
export function AdminLinksTable({ links }: AdminLinksTableProps) {
  if (links.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Nenhum link cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs tracking-wide text-zinc-500 uppercase dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">#</th>
            <th scope="col" className="px-4 py-3 font-medium">Link curto</th>
            <th scope="col" className="px-4 py-3 font-medium">Destino</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Acessos</th>
            <th scope="col" className="px-4 py-3 font-medium">Dono</th>
            <th scope="col" className="px-4 py-3 font-medium">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {links.map((link, index) => {
            const shortUrl = `${API_URL}/${link.id}`;
            const isAnonymous = link.user_id === null;
            return (
              <tr key={link.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                <td className="px-4 py-3 text-zinc-500 tabular-nums dark:text-zinc-400">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {shortUrl}
                  </a>
                </td>
                <td className="max-w-[18rem] px-4 py-3">
                  <span
                    className="block truncate text-zinc-600 dark:text-zinc-400"
                    title={link.destination_url}
                  >
                    {link.destination_url}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
                  {link.total_accesses.toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      isAnonymous
                        ? 'inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        : 'inline-flex rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                    }
                  >
                    {isAnonymous ? 'Anônimo' : 'De usuário'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/${link.id}`}
                    className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Estatísticas
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
