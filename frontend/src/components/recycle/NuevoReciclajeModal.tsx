import React, { useState } from 'react';
import { recycleApi } from '../../services/marketplaceApi';
import { X, Recycle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const NuevoReciclajeModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [tipoDispositivo, setTipoDispositivo] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [estadoDispositivo, setEstadoDispositivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tiposDispositivo = [
    'Smartphone',
    'Tablet',
    'Laptop',
    'PC de escritorio',
    'Monitor',
    'Teclado',
    'Mouse',
    'Impresora',
    'Consola de videojuegos',
    'Smartwatch',
    'Auriculares',
    'Cargadores',
    'Cables',
    'Otro'
  ];

  const estadosDispositivo = [
    { value: 'funcional', label: 'Funcional' },
    { value: 'parcialmente_funcional', label: 'Parcialmente Funcional' },
    { value: 'no_funcional', label: 'No Funcional' }
  ];

  const reset = () => {
    setTipoDispositivo('');
    setMarca('');
    setModelo('');
    setEstadoDispositivo('');
    setDescripcion('');
    setImagenUrl('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tipoDispositivo || !marca || !modelo || !estadoDispositivo) {
      setError('Completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      const requestData: any = {
        tipoDispositivo,
        marca,
        modelo,
        estadoDispositivo,
        descripcion
      };
      
      if (imagenUrl) {
        requestData.imagenes = [imagenUrl];
      }
      
      await recycleApi.createRecycleRequest(requestData);
      reset();
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo crear la solicitud de reciclaje');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center">
            <Recycle className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold">Nueva Solicitud de Reciclaje</h2>
          </div>
          <button 
            onClick={() => { reset(); onClose(); }} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Dispositivo <span className="text-red-500">*</span>
            </label>
            <select
              value={tipoDispositivo}
              onChange={(e) => setTipoDispositivo(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
              aria-label="Tipo de dispositivo"
            >
              <option value="" disabled>Selecciona el tipo</option>
              {tiposDispositivo.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Marca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Ej. Samsung, Apple, HP"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Modelo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Ej. Galaxy S21, iPhone 12"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado del Dispositivo <span className="text-red-500">*</span>
            </label>
            <select
              value={estadoDispositivo}
              onChange={(e) => setEstadoDispositivo(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
              aria-label="Estado del dispositivo"
            >
              <option value="" disabled>Selecciona el estado</option>
              {estadosDispositivo.map((estado) => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Esto nos ayuda a determinar el valor de compensación
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Describe el estado general del dispositivo, accesorios incluidos, etc."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Imagen del Dispositivo (URL)</label>
            <input
              type="url"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="https://ejemplo.com/imagen.jpg (opcional)"
            />
            <p className="mt-1 text-xs text-gray-500">Proporciona una URL de imagen del dispositivo</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>💡 Tip:</strong> Los dispositivos en mejor estado reciben mayor compensación.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => { reset(); onClose(); }}
              className="btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoReciclajeModal;
