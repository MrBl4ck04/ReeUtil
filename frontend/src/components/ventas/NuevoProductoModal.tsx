import React, { useState } from 'react';
import { ventasApi } from '../../services/ventasApi';
import { ActiveRulesBox } from '../ActiveRulesBox';
import { X, ShoppingBag } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const NuevoProductoModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [categoria, setCategoria] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lista de categorías sugeridas para dispositivos electrónicos
  const categorias = [
    { value: 'smartphone', label: 'Smartphone / Celular' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'laptop', label: 'Laptop / Portátil' },
    { value: 'desktop', label: 'PC de escritorio' },
    { value: 'accesorio', label: 'Accesorio' },
    { value: 'otro', label: 'Otros' },
  ];

  const reset = () => {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setCategoria('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre || !descripcion || precio === '' || Number(precio) <= 0 || !categoria) {
      setError('Completa todos los campos, selecciona una categoría y asegura un precio válido');
      return;
    }

    try {
      setLoading(true);
      await ventasApi.crearVenta({
        nombre,
        descripcion,
        precio: Number(precio),
        categoria,
        estado: 'venta',
      });
      reset();
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo crear el producto');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center">
            <ShoppingBag className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Nuevo Producto</h2>
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

          {/* Reglas Activas */}
          <ActiveRulesBox />

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej. iPhone 12 Pro"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Detalles del estado, accesorios, etc."
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej. 799.99"
              required
            />
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
              {loading ? 'Publicando...' : 'Publicar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoProductoModal;