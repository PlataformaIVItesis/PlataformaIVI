export function obtenerRiesgoDesempeno(puntaje) {
  const valor = Math.max(0, Math.min(100, Number(puntaje) || 0));

  if (valor >= 80) {
    return {
      nombre: "Riesgo bajo",
      clase: "bajo",
      recomendacion: "Buen desempeño en esta actividad."
    };
  }

  if (valor >= 60) {
    return {
      nombre: "Riesgo moderado",
      clase: "moderado",
      recomendacion: "Puede ser útil practicar esta habilidad y observar otros resultados."
    };
  }

  return {
    nombre: "Riesgo alto",
    clase: "alto",
    recomendacion: "Se observaron dificultades en esta actividad; considera revisar el resultado con un profesional si se repiten."
  };
}
