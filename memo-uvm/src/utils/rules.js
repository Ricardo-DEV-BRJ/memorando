export const reglas = {
    // 1. Requerido / No vacío
    required: v => (v !== null && v !== undefined && String(v).trim() !== '') || 'Este campo es obligatorio',

    // 2. Números positivos
    // Solo números mayores a 0 (acepta enteros y decimales)
    positive: v => (!v || (Number(v) > 0 && !isNaN(v))) || 'Debe ser un número mayor a 0',

    // Solo enteros positivos (sin decimales ni ceros)
    positiveInteger: v => (!v || /^[1-9]\d*$/.test(v)) || 'Debe ser un número entero positivo',

    // Números no negativos (incluye el 0)
    nonNegative: v => (!v || (Number(v) >= 0 && !isNaN(v))) || 'El valor no puede ser negativo',

    // 3. Identificaciones / Documentos de identidad
    // Solo dígitos con longitud específica (ej. Cédula / DNI entre 6 y 10 dígitos)
    idNumeric: v => (!v || /^\d{6,10}$/.test(v)) || 'La identificación debe contener entre 6 y 10 dígitos',

    // Alfanumérico sin espacios (ej. Pasaporte o identificaciones con letras y números)
    idAlphanumeric: v => (!v || /^[a-zA-Z0-9]{5,12}$/.test(v)) || 'La identificación debe tener entre 5 y 12 caracteres alfanuméricos'
}