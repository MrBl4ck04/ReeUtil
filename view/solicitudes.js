// Obtener elementos
const openModal = document.getElementById('openModal');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');

// Abrir modal
openModal.addEventListener('click', function (event) {
  event.preventDefault();
  modal.style.display = 'block';
});

// Cerrar modal
closeModal.addEventListener('click', function () {
  modal.style.display = 'none';
});

// Cerrar modal si se hace clic fuera del contenido
window.addEventListener('click', function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});
// Abrir modal
document.querySelectorAll('.btn-solicitar').forEach(function(button) {
    button.addEventListener('click', function() {
      document.getElementById('solicitudModal').style.display = 'block';
    });
  });
  
  // Cerrar modal
  document.getElementById('closeSolicitudModal').addEventListener('click', function() {
    document.getElementById('solicitudModal').style.display = 'none';
  });
  
  // Cerrar al hacer clic fuera del modal
  window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('solicitudModal')) {
      document.getElementById('solicitudModal').style.display = 'none';
    }
  });
  