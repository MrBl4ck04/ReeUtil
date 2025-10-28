import React from 'react';
import { useQuery } from 'react-query';
import { rulesApi } from '../services/api';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface Rule {
  _id: string;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

interface ActiveRulesBoxProps {
  className?: string;
}

export const ActiveRulesBox: React.FC<ActiveRulesBoxProps> = ({ className = '' }) => {
  // Fetch active rules
  const { data: rulesResponse, isLoading } = useQuery<any>('activeRules', rulesApi.getAll);
  const activeRules = Array.isArray(rulesResponse?.data?.data) 
    ? rulesResponse.data.data.filter((rule: Rule) => rule.estado) 
    : [];

  if (isLoading || activeRules.length === 0) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">Reglas Activas del Sistema</h3>
          <div className="space-y-2">
            {activeRules.map((rule: Rule) => (
              <div key={rule._id} className="flex gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">{rule.nombre}</p>
                  <p className="text-blue-700 text-xs">{rule.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
