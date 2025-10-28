import React, { useState } from 'react';
import { repairApi } from '../../services/marketplaceApi';
import { X, Wrench } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const NuevaReparacionModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [tipoDispositivo, setTipoDispositivo] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [descripcionProblema, setDescripcionProblema] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tiposDispositivo = [
    'Smartphone',
    'Tablet',
    'Laptop',
    'PC de escritorio',
    'Consola de videojuegos',
    'Smartwatch',
    'Auriculares',
    'Otro'
  ];

  const reset = () => {
    setTipoDispositivo('');
    setMarca('');
    setModelo('');
    setDescripcionProblema('');
    setImagenUrl('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tipoDispositivo || !marca || !modelo || !descripcionProblema) {
      setError('Completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const requestData: any = {
        tipoDispositivo,
        marca,
        modelo,
        descripcionProblema
      };
      
      if (imagenUrl) {
        requestData.imagenes = [imagenUrl];
      }
      
      await repairApi.createRepairRequest(requestData);
      reset();
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo crear la solicitud de reparación');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Wrench className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Nueva Solicitud de Reparación</h2>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="text-gray-500 hover:text-gray-700">
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
            <label className="block text-sm font-medium text-gray-700">Tipo de Dispositivo</label>
            <select
              value={tipoDispositivo}
              onChange={(e) => setTipoDispositivo(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Selecciona el tipo</option>
              {tiposDispositivo.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marca</label>
            <input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej. Samsung, Apple, HP"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Modelo</label>
            <input
              type="text"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej. Galaxy S21, iPhone 12"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción del Problema</label>
            <textarea
              value={descripcionProblema}
              onChange={(e) => setDescripcionProblema(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe detalladamente el problema que presenta tu dispositivo"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Imagen del Equipo (URL)</label>
            <input
              type="url"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://ejemplo.com/imagen.jpg (opcional)"
            />
            <p className="mt-1 text-xs text-gray-500">Proporciona una URL de imagen del equipo dañado</p>
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
              className="btn-primary"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaReparacionModal;
