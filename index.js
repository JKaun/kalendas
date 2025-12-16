// Almacena el dia seleccionado en el calendario
let diaSeleccionado = null;

// Esta función se ejecuta cuando la pagina se carga
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la aplicación
    cargarNotas();
    actualizarIndicadoresDias();
    cargarPaletaGuardada();
    
    // Seleccionar todos los elementos con clase 'dia' (los cuadros del calendario)
    const dias = document.querySelectorAll('.dia');
    
    // Agregar que se pueda hacer click a cada día del calendario
    dias.forEach(dia => {
        dia.addEventListener('click', function() {
            // Quitar selección visual del día anteriormente seleccionado (lo visual)
            dias.forEach(d => d.classList.remove('seleccionado'));
            
            // Obtener el número del día desde el elemento span dentro del cuadro del día
            const numeroDia = this.querySelector('span')?.textContent;
            
            // Si el día tiene un número (no está vacío)
            if (numeroDia) {
                // Actualizar la variable global con el día seleccionado
                diaSeleccionado = numeroDia;
                
                // Añadir clase CSS para resaltar visualmente el día seleccionado
                this.classList.add('seleccionado');
                
                // Depuracion
                // console.log(`Seleccionaste el día: ${diaSeleccionado} de Octubre`);
                
                // Mostrar las notas correspondientes al día seleccionado
                mostrarNotasDelDia(diaSeleccionado);
            }
        });
    });
});

// Función para guardar una nueva nota en el día seleccionado
async function guardarNota() {
    // Verificar que se haya seleccionado un día primero
    if (!diaSeleccionado) {
        await mostrarDialogo('Por favor, selecciona un día primero', 'Atención');
        return; // Salir de la función si no hay día seleccionado
    }
    
    // Obtener el elemento de entrada de texto donde el usuario escribe la nota
    const texto = document.getElementById('note-text');
    
    // Validar que la nota no esté vacía (solo espacios en blanco)
    if (texto.value.trim() === '') {
        await mostrarDialogo('Por favor, escribe una nota', 'Atención');
        return; // Salir de la función si la nota está vacía
    }
    
    // Crear una clave única para almacenar las notas de este día en localStorage
    const clave = `notas_octubre_${diaSeleccionado}`;
    
    // Obtener las notas existentes para este día, o un array vacío si no hay ninguna
    const notasGuardadas = JSON.parse(localStorage.getItem(clave)) || [];
    
    // Verificar si ya se alcanzó el límite de 9 notas por día
    if (notasGuardadas.length >= 9) {
        await mostrarDialogo('Ya tienes 9 notas para este día. Elimina alguna para agregar más.', 'Límite alcanzado');
        return; // Salir de la función si se alcanzó el límite
    }
    
    // Agregar la nueva nota al array de notas
    notasGuardadas.push(texto.value);
    
    // Guardar el array actualizado en localStorage (convertido a string JSON)
    localStorage.setItem(clave, JSON.stringify(notasGuardadas));
    
    // Limpiar el campo de texto para una nueva entrada
    texto.value = "";
    
    // Actualizar la visualización de notas y los indicadores del calendario
    mostrarNotasDelDia(diaSeleccionado);
    actualizarIndicadoresDias();
     await mostrarExito('Nota guardada correctamente');
    
    // Mensaje de depuración
    // console.log(`Nota guardada para el día ${diaSeleccionado}:`, notasGuardadas);
}

// Función para mostrar las notas de un día específico en el panel lateral
function mostrarNotasDelDia(dia) {
    // Actualizar el título del panel para mostrar qué día está seleccionado
    document.getElementById('dia-actual').textContent = dia;
    
    // Crear la clave para buscar las notas en localStorage
    const clave = `notas_octubre_${dia}`;
    
    // Obtener las notas del día, o un array vacío si no hay ninguna
    const notas = JSON.parse(localStorage.getItem(clave)) || [];
    
    // Obtener el contenedor donde se mostrarán las notas
    const listaNotas = document.getElementById('lista-notas');
    
    // Limpiar el contenido anterior del contenedor
    listaNotas.innerHTML = '';
    
    // Si no hay notas para este día, mostrar un mensaje
    if (notas.length === 0) {
        listaNotas.innerHTML = '<p>No hay notas para este día.</p>';
        return; // Salir de la función
    }
    
    // Para cada nota en el array, crear un elemento visual en el panel
    notas.forEach((nota, index) => {
        // Crear un nuevo elemento div para la nota
        const notaItem = document.createElement('div');
        notaItem.className = 'nota-item';
        
        // Estructura HTML de la nota: texto + botón de eliminar
        notaItem.innerHTML = `
            <div class="nota-texto">${nota}</div>
            <button class="btn-eliminar" onclick="eliminarNota(${dia}, ${index})">×</button>
        `;
        
        // Añadir la nota al contenedor
        listaNotas.appendChild(notaItem);
    });
}

// Función para eliminar una nota específica de un día
async function eliminarNota(dia, indice) {
    const confirmado = await mostrarDialogo(
        '¿Estás seguro de que quieres eliminar esta nota?', 
        'Confirmar eliminación', 
        'confirm'
    );
    if (confirmado) {
        const clave = `notas_octubre_${dia}`;
        const notas = JSON.parse(localStorage.getItem(clave)) || [];
        
        if (indice >= 0 && indice < notas.length) {
            notas.splice(indice, 1);
            localStorage.setItem(clave, JSON.stringify(notas));
            
            mostrarNotasDelDia(dia);
            actualizarIndicadoresDias();
            await mostrarExito('Nota eliminada correctamente');
        }
    }
}

// Función de inicialización (puede expandirse para cargar datos al inicio)
function cargarNotas() {
    console.log('Página cargada - Listo para usar notas con localStorage');
}

// Función para actualizar los indicadores visuales en el calendario
function actualizarIndicadoresDias() {
    // Seleccionar todos los días del calendario
    const dias = document.querySelectorAll('.dia');
    
    // Para cada día en el calendario
    dias.forEach(dia => {
        // Obtener el número del día
        const numeroDia = dia.querySelector('span')?.textContent;
        
        // Solo procesar días que tengan número (no los vacíos)
        if (numeroDia) {
            // Limpiar contadores anteriores (si existen)
            const contadorAnterior = dia.querySelector('.contador-notas');
            if (contadorAnterior) {
                contadorAnterior.remove();
            }
            
            // Crear la clave para buscar notas de este día
            const clave = `notas_octubre_${numeroDia}`;
            
            // Obtener las notas del día
            const notas = JSON.parse(localStorage.getItem(clave)) || [];
            
            // Si el día tiene al menos una nota
            if (notas.length > 0) {
                // Añadir clase CSS para indicar visualmente que tiene notas
                dia.classList.add('con-notas');
                
                // Crear y añadir el contador de notas (círculo con número)
                const contador = document.createElement('div');
                contador.className = 'contador-notas';
                contador.textContent = notas.length;
                dia.appendChild(contador);
            } else {
                // Si no hay notas, quitar los indicadores visuales
                dia.classList.remove('con-notas');
            }
        }
    });
}

// Función para eliminar TODAS las notas de TODOS los días
async function limpiarTodasLasNotas() {
    const confirmado = await mostrarDialogo(
        '¿Estás seguro de que quieres eliminar TODAS las notas de TODOS los días? Esta acción no se puede deshacer.', 
        'Confirmar eliminación total', 
        'confirm'
    );
    
    if (confirmado) {
        for (let i = 1; i <= 31; i++) {
            const clave = `notas_octubre_${i}`;
            localStorage.removeItem(clave);
        }
        
        document.getElementById('lista-notas').innerHTML = '<p>No hay notas para este día.</p>';
        document.getElementById('dia-actual').textContent = '-';
        
        actualizarIndicadoresDias();
        
        await mostrarExito('Todas las notas han sido eliminadas');
    }
}

// Sistema de diálogos personalizados
function mostrarDialogo(mensaje, titulo = 'Atención', tipo = 'info') {
    return new Promise((resolve) => {
        const overlay = document.getElementById('dialogOverlay');
        const dialogTitulo = document.getElementById('dialogTitulo');
        const dialogMensaje = document.getElementById('dialogMensaje');
        const dialogBotones = document.getElementById('dialogBotones');
        
        // Configurar título y mensaje
        dialogTitulo.textContent = titulo;
        dialogMensaje.textContent = mensaje;
        
        // Limpiar botones anteriores
        dialogBotones.innerHTML = '';
        
        // Crear botones según el tipo de diálogo
        if (tipo === 'confirm') {
            // Diálogo de confirmación (Aceptar/Cancelar)
            const btnAceptar = document.createElement('button');
            btnAceptar.textContent = 'Aceptar';
            btnAceptar.className = 'dialog-btn aceptar';
            btnAceptar.onclick = () => {
                ocultarDialogo();
                resolve(true);
            };
            
            const btnCancelar = document.createElement('button');
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.className = 'dialog-btn cancelar';
            btnCancelar.onclick = () => {
                ocultarDialogo();
                resolve(false);
            };
            
            dialogBotones.appendChild(btnAceptar);
            dialogBotones.appendChild(btnCancelar);
        } else {
            // Diálogo simple (solo Cerrar)
            const btnCerrar = document.createElement('button');
            btnCerrar.textContent = 'Cerrar';
            btnCerrar.className = 'dialog-btn cerrar';
            btnCerrar.onclick = () => {
                ocultarDialogo();
                resolve(true);
            };
            
            dialogBotones.appendChild(btnCerrar);
        }
        
        // Mostrar diálogo
        overlay.classList.add('mostrar');
        
        // Cerrar al hacer clic fuera del diálogo
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                ocultarDialogo();
                resolve(false);
            }
        };
    });
}

function ocultarDialogo() {
    const overlay = document.getElementById('dialogOverlay');
    overlay.classList.remove('mostrar');
}

// Función para mostrar mensaje de éxito
function mostrarExito(mensaje) {
    return mostrarDialogo(mensaje, 'Éxito', 'success');
}

// Función para mostrar error
function mostrarError(mensaje) {
    return mostrarDialogo(mensaje, 'Error', 'error');
}

// Definir diferentes paletas de colores
const paletas = {
    original: {
        'color-1': '#95BADC', 'color-2': '#CCDFEE', 'color-3': '#3A405B',
        'color-4': '#566288', 'color-5': '#7589A2', 'color-6': '#909BBB',
        'color-7': '#F4F6FF', 'color-8': '#000000', 'color-9': '#00081eff',
        'color-10': '#000000'
    },
    oscura: {
        'color-1': '#2C3E50', 'color-2': '#34495E', 'color-3': '#1A252F',
        'color-4': '#2C3E50', 'color-5': '#566573', 'color-6': '#7F8C8D',
        'color-7': '#4f5e62', 'color-8': '#000000', 'color-9': '#9cacadff',
        'color-10': '#000000'
    },
    pastel: {
        'color-1': '#d9f3fdff', 'color-2': '#C4E0F9', 'color-3': '#ffffffff',
        'color-4': '#9FB4C7', 'color-5': '#B8CEE6', 'color-6': '#D4E2F0',
        'color-7': '#F9F7F7', 'color-8': '#3A405B', 'color-9': '#8ad4ffff',
        'color-10': '#000000'
    },
    calida: {
        'color-1': '#762326ff', 'color-2': '#FFDAC7', 'color-3': '#7D5A5A',
        'color-4': '#B5838D', 'color-5': '#E5989B', 'color-6': '#FFCDB2',
        'color-7': '#FFFAF0', 'color-8': '#da7150ff', 'color-9': '#ff9f9fff',
        'color-10': '#000000'
    }
};

// Función para cambiar la paleta
function cambiarPaleta(nombrePaleta) {
    const root = document.documentElement;
    const colores = paletas[nombrePaleta];
    
    for (const [variable, valor] of Object.entries(colores)) {
        root.style.setProperty(`--${variable}`, valor);
    }
    // Guardar preferencia en localStorage
    localStorage.setItem('paleta-seleccionada', nombrePaleta);
}

function cargarPaletaGuardada() {
    const paletaGuardada = localStorage.getItem('paleta-seleccionada') || 'original';
    cambiarPaleta(paletaGuardada);
    
    // Establecer la opción seleccionada en el select
    const select = document.getElementById('selector-paleta');
    if (select) {
        select.value = paletaGuardada;
    }
}

// Cargar paleta guardada al iniciar
document.addEventListener('DOMContentLoaded', function() {
    const paletaGuardada = localStorage.getItem('paleta-seleccionada') || 'original';
    cambiarPaleta(paletaGuardada);
});