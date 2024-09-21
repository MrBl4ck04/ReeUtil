 // Funciones para abrir y cerrar el modal de REGLAS
  function openRulesModal() {
    document.getElementById("modalReglas").style.display = "flex";
  }
  
  function closeRulesModal() {
    document.getElementById("modalReglas").style.display = "none";
  }
  
  // Función para mostrar las reglas basadas en el tipo de dispositivo seleccionado
  function mostrarReglas() {
    var dispositivo = document.getElementById("tipoDispositivo").value;
    var reglasTexto = "";
  
    if (dispositivo === "smartphones") {
      reglasTexto = "1. Reiniciar el dispositivo antes de entregarlo.\n2. Borrar todos los datos personales.";
    } else if (dispositivo === "televisores") {
      reglasTexto = "1. Empacar bien para evitar daños.\n2. Probar todas las entradas de video.";
    } else if (dispositivo === "electrodomesticos") {
      reglasTexto = "1. Limpiar a fondo antes de la entrega.\n2. Comprobar si todos los componentes están en su lugar.";
    } else {
      reglasTexto = "";
    }
  
    document.getElementById("reglas").innerText = reglasTexto;
  }
  window.onclick = function(event) {
    var modal = document.getElementById("modalSol");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  