import React from 'react';

interface ConfirmPurchaseModalProps {
  open: boolean;
  venta: any | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmPurchaseModal: React.FC<ConfirmPurchaseModalProps> = ({ open, venta, onCancel, onConfirm }) => {
  if (!open || !venta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Confirmar compra</h2>
        </div>
        <div className="px-6 py-4 space-y-2">
          <p className="text-sm text-gray-700">
            ¿Deseas comprar "<span className="font-medium">{venta.nombre}</span>" por <span className="font-semibold">${venta.precio?.toFixed(2)}</span>?
          </p>
          {venta.descripcion && (
            <p className="text-xs text-gray-500">{venta.descripcion}</p>
          )}
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button className="btn-outline" onClick={onCancel}>Cancelar</button>
          <button className="btn-primary" onClick={onConfirm}>Comprar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPurchaseModal;