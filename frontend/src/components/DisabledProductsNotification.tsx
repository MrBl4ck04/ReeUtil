import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { AlertTriangle, X, Eye } from 'lucide-react';
import { ventasApi } from '../services/ventasApi';

interface DisabledProductsNotificationProps {
  onClose?: () => void;
}

export const DisabledProductsNotification: React.FC<DisabledProductsNotificationProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Obtener productos deshabilitados del usuario
  const { data: disabledProducts, isLoading } = useQuery(
    'disabledProducts',
    ventasApi.obtenerProductosDeshabilitados,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const productosDeshabilitados = disabledProducts?.data?.data?.ventas || [];

  useEffect(() => {
    // Mostrar notificación solo si hay productos deshabilitados
    if (productosDeshabilitados.length > 0) {
      setIsVisible(true);
    }
  }, [productosDeshabilitados.length]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleShowDetails = () => {
    setShowDetails(!showDetails);
  };

  if (!isVisible || isLoading) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Productos Deshabilitados
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Tienes {productosDeshabilitados.length} producto{productosDeshabilitados.length !== 1 ? 's' : ''} que no cumple{productosDeshabilitados.length !== 1 ? 'n' : ''} con las reglas establecidas y ha{productosDeshabilitados.length !== 1 ? 'n' : ''} sido deshabilitado{productosDeshabilitados.length !== 1 ? 's' : ''} por el administrador.
                </p>
                
                {showDetails && (
                  <div className="mt-3 space-y-2">
                    <p className="font-medium">Productos afectados:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {productosDeshabilitados.map((producto: any) => (
                        <li key={producto._id} className="text-xs">
                          {producto.nombre} - ${producto.precio}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleShowDetails}
                  className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition-colors flex items-center"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {showDetails ? 'Ocultar' : 'Ver'} detalles
                </button>
                <button
                  onClick={handleClose}
                  className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={handleClose}
                className="bg-yellow-50 rounded-md inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisabledProductsNotification;
