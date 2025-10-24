import React from 'react';
import { useQuery } from 'react-query';
import { logsApi, GetLogsParams, AuditLogDto, LogType } from '../../services/logsApi';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const LOG_TYPES: { value: LogType; label: string }[] = [
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'EMPLOYEE_CREATED', label: 'Empleado creado' },
  { value: 'PASSWORD_CHANGED', label: 'Cambio de contraseña' },
  { value: 'PASSWORD_RESET', label: 'Reseteo de contraseña' },
  { value: 'ACCOUNT_BLOCKED', label: 'Cuenta bloqueada' },
  { value: 'ACCOUNT_UNBLOCKED', label: 'Cuenta desbloqueada' },
];

export const SystemLogs: React.FC = () => {
  const [filters, setFilters] = React.useState<GetLogsParams>({ page: 1, limit: 20, sort: 'desc' });
  const [email, setEmail] = React.useState('');
  const [type, setType] = React.useState<string>('');
  const [userType, setUserType] = React.useState<'user' | 'employee' | undefined>(undefined);
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');

  const { data, isLoading } = useQuery(['audit-logs', filters], () => logsApi.getLogs(filters), { keepPreviousData: true });

  const items: AuditLogDto[] = data?.data?.data || [];
  const pagination = data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

  const applyFilters = () => {
    const f: GetLogsParams = {
      page: 1,
      limit: filters.limit,
      sort: filters.sort,
    };
    if (email) f.email = email;
    if (type) f.type = type;
    if (userType) f.userType = userType;
    if (start) f.start = start;
    if (end) f.end = end;
    setFilters(f);
  };

  const changePage = (delta: number) => {
    const next = Math.max(1, Math.min((pagination.totalPages || 1), (filters.page || 1) + delta));
    setFilters({ ...filters, page: next });
  };

  const toLocal = (iso: string) => new Date(iso).toLocaleString();

  const sessions = React.useMemo(() => {
    const map: Record<string, AuditLogDto[]> = {};
    for (const e of items) {
      const key = `${e.userType}:${e.email || e.userId || 'unknown'}`;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    const rows: { key: string; user: string; start?: string; end?: string; duration?: string }[] = [];
    Object.entries(map).forEach(([k, arr]) => {
      const sorted = [...arr].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      let currentLogin: AuditLogDto | null = null;
      for (const ev of sorted) {
        if (ev.type === 'LOGIN') currentLogin = ev;
        else if (ev.type === 'LOGOUT' && currentLogin) {
          const a = new Date(currentLogin.createdAt).getTime();
          const b = new Date(ev.createdAt).getTime();
          const ms = Math.max(0, b - a);
          const hours = Math.floor(ms / 3600000);
          const minutes = Math.floor((ms % 3600000) / 60000);
          const seconds = Math.floor((ms % 60000) / 1000);
          rows.push({
            key: `${k}:${currentLogin._id}:${ev._id}`,
            user: currentLogin.name || ev.name || `${ev.userType}`,
            start: toLocal(currentLogin.createdAt),
            end: toLocal(ev.createdAt),
            duration: `${hours}h ${minutes}m ${seconds}s`,
          });
          currentLogin = null;
        }
      }
    });
    return rows;
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logs del Sistema</h1>
        <p className="mt-1 text-sm text-gray-500">Auditoría de eventos: inicios y cierres de sesión, cambios de contraseña, bloqueos y creación de empleados.</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full input" placeholder="usuario@correo.com" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Tipo usuario</label>
            <select value={userType || ''} onChange={e => setUserType((e.target.value || undefined) as any)} className="w-full input">
              <option value="">Todos</option>
              <option value="employee">Empleado</option>
              <option value="user">Usuario</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Tipo evento</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full input">
              <option value="">Todos</option>
              {LOG_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Desde</label>
            <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className="w-full input" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Hasta</label>
            <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className="w-full input" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={applyFilters} className="btn-primary flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Aplicar filtros
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Eventos</h2>
        {isLoading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(ev => (
                <tr key={ev._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{toLocal(ev.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ev.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ev.name || ev.userType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ev.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-600">{ev.metadata ? JSON.stringify(ev.metadata) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Página {pagination.page} de {pagination.totalPages} • {pagination.total} eventos</div>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={(filters.page || 1) <= 1} onClick={() => changePage(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="btn-secondary" disabled={(filters.page || 1) >= (pagination.totalPages || 1)} onClick={() => changePage(1)}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sesiones (estimado)</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map(s => (
              <tr key={s.key}>
                <td className="px-6 py-4 whitespace-nowrap">{s.user}</td>
                <td className="px-6 py-4 whitespace-nowrap">{s.start}</td>
                <td className="px-6 py-4 whitespace-nowrap">{s.end}</td>
                <td className="px-6 py-4 whitespace-nowrap">{s.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemLogs;
