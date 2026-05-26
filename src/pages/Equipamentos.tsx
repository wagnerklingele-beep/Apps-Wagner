import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Package, Tag, Wrench, AlertCircle, Loader2, X } from 'lucide-react';

interface Componente {
  cod: number;
  desc: string;
  q: number;
  un: string;
  loc: string;
  sit: string;
  sal: number;
  obs: string;
}

interface Equipamento {
  d: string;
  f: string;
  cc: string;
  ccd: string;
  c: Componente[];
}

interface TagInfo {
  d: string;
  e: string[];
}

interface EquipData {
  tags: Record<string, TagInfo>;
  equip: Record<string, Equipamento>;
}

function EquipCard({ code, equip }: { code: string; equip: Equipamento }) {
  const [open, setOpen] = useState(false);
  const comps = equip.c;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Wrench className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-gray-900 text-sm">{code}</span>
            <span className="mx-2 text-gray-300">·</span>
            <span className="text-sm text-gray-600 truncate">{equip.d}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            <Package className="w-3 h-3" />
            {comps.length} componente{comps.length !== 1 ? 's' : ''}
          </span>
          {equip.f && (
            <span className="hidden md:inline text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {equip.f}
            </span>
          )}
          {open ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-200">
          {equip.ccd && (
            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 flex gap-4">
              <span><span className="font-medium">Família:</span> {equip.f}</span>
              <span><span className="font-medium">Centro de Custo:</span> {equip.ccd}</span>
            </div>
          )}
          {comps.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Nenhum componente cadastrado para este equipamento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Código</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Descrição</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Qtde</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">UN</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Localização</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-600">Saldo</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Situação</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comps.map((c, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-2 font-mono text-gray-700 whitespace-nowrap">{c.cod}</td>
                      <td className="px-3 py-2 text-gray-800 max-w-xs">{c.desc}</td>
                      <td className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">{c.q}</td>
                      <td className="px-3 py-2 text-gray-600">{c.un}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.loc || '—'}</td>
                      <td className={`px-3 py-2 text-right font-medium whitespace-nowrap ${
                        c.sal > 0 ? 'text-green-700' : c.sal === 0 ? 'text-gray-400' : 'text-red-600'
                      }`}>
                        {c.sal}
                      </td>
                      <td className="px-3 py-2">
                        {c.sit && (
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
                            c.sit.toUpperCase() === 'ATIVO'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {c.sit}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-500 italic max-w-xs">{c.obs || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Equipamentos() {
  const [data, setData] = useState<EquipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/equipamentos_data.json')
      .then(r => {
        if (!r.ok) throw new Error('Falha ao carregar dados');
        return r.json();
      })
      .then((d: EquipData) => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        suggestRef.current && !suggestRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const suggestions = useMemo(() => {
    if (!data || query.trim().length < 1) return [];
    const q = query.trim().toUpperCase();
    return Object.entries(data.tags)
      .filter(([tag, info]) =>
        tag.toUpperCase().includes(q) || info.d.toUpperCase().includes(q)
      )
      .slice(0, 12);
  }, [data, query]);

  const tagInfo = selectedTag && data ? data.tags[selectedTag] : null;

  const equipamentos = useMemo(() => {
    if (!tagInfo || !data) return [];
    return tagInfo.e.map(code => ({
      code,
      equip: data.equip[code] ?? null,
    })).filter(e => e.equip !== null) as { code: string; equip: Equipamento }[];
  }, [tagInfo, data]);

  const totalComponents = useMemo(
    () => equipamentos.reduce((sum, e) => sum + e.equip.c.length, 0),
    [equipamentos]
  );

  function selectTag(tag: string) {
    setSelectedTag(tag);
    setQuery(tag);
    setShowSuggestions(false);
  }

  function clearSearch() {
    setQuery('');
    setSelectedTag(null);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm">Carregando base de dados de equipamentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-6 h-6 text-blue-600" />
          Consulta de Componentes por TAG
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {data ? `${Object.keys(data.tags).length.toLocaleString('pt-BR')} TAGs · ${Object.keys(data.equip).length.toLocaleString('pt-BR')} equipamentos` : ''}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedTag(null);
              setShowSuggestions(true);
            }}
            onFocus={() => query.length >= 1 && setShowSuggestions(true)}
            placeholder="Digite o código ou descrição da TAG..."
            className="flex-1 outline-none text-gray-900 text-sm placeholder-gray-400 bg-transparent"
          />
          {query && (
            <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {suggestions.map(([tag, info]) => (
              <button
                key={tag}
                onClick={() => selectTag(tag)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0"
              >
                <Tag className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-gray-900 text-sm">{tag}</span>
                  {info.d && (
                    <span className="text-xs text-gray-500 ml-2 truncate block">{info.d}</span>
                  )}
                </div>
                <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                  {info.e.length} equip.
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {selectedTag && tagInfo && (
        <div className="space-y-4">
          {/* TAG summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">TAG</p>
              <p className="text-lg font-bold text-blue-900">{selectedTag}</p>
            </div>
            {tagInfo.d && (
              <div>
                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Descrição</p>
                <p className="text-sm font-medium text-blue-800">{tagInfo.d}</p>
              </div>
            )}
            <div className="ml-auto flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700">{equipamentos.length}</p>
                <p className="text-xs text-blue-500">Equipamentos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700">{totalComponents}</p>
                <p className="text-xs text-blue-500">Componentes</p>
              </div>
            </div>
          </div>

          {/* Equipment list */}
          <div className="space-y-2">
            {equipamentos.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhum equipamento encontrado para esta TAG.</p>
              </div>
            ) : (
              equipamentos.map(({ code, equip }) => (
                <EquipCard key={code} code={code} equip={equip} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedTag && !query && (
        <div className="text-center py-16 text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">Digite uma TAG para consultar</p>
          <p className="text-sm mt-1">Ex: 10CCM001, 28MSP005, 31MRO004...</p>
        </div>
      )}

      {!selectedTag && query && suggestions.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhuma TAG encontrada para "{query}"</p>
        </div>
      )}
    </div>
  );
}
