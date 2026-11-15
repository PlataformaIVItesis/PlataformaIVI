import { apiUrl, getOfficePatient } from "../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/pages/PruebaPage.css";

const PREGUNTAS = [
  { pregunta: "Escucha o lee las siguientes opciones. ¿Cuál de ellas es una LETRA?", opciones: ["4", "8", "M", "2"], correcta: 2 }, 
  { pregunta: "Ahora, observa estas opciones. ¿Cuál de ellas es un NÚMERO?", opciones: ["7", "P", "L", "S"], correcta: 0 },
  { pregunta: "Si decimos el abecedario: A, B, C, D..., ¿Qué letra sigue a continuación?", opciones: ["Z", "E", "M", "X"], correcta: 1 },
  { pregunta: "¿Cuál es la letra MINÚSCULA de la A mayúscula?", opciones: ["e", "o", "a", "u"], correcta: 2 },
  { pregunta: "¿Cuál de los siguientes grupos está formado SOLO por vocales?", opciones: ["A-E-I", "P-L-M", "1-2-3", "B-C-D"], correcta: 0 },
  { pregunta: "Si contamos del 1 al 5, ¿qué número va justo DESPUÉS del 3?", opciones: ["2", "4", "8", "1"], correcta: 1 },
  { pregunta: "De los siguientes números, ¿cuál representa la cantidad MAYOR (el más grande)?", opciones: ["2", "9", "4", "1"], correcta: 1 },
  { pregunta: "Si juntamos la letra M con la vocal A, ¿qué sonido se forma?", opciones: ["PE", "LA", "MA", "SO"], correcta: 2 },
  { pregunta: "Escucha con atención: ¿Con qué vocal TERMINA la palabra O - S - O?", opciones: ["A", "E", "I", "O"], correcta: 3 },
  { pregunta: "Observa estas palabras. ¿Cuál de ellas es la más CORTA?", opciones: ["MARIPOSA", "ELEFANTE", "PAN", "CARAMELO"], correcta: 2 }
];

export default function PruebaAlfabetoPage() {
  const navigate = useNavigate();
  const [respuestas, setRespuestas] = useState({});
  const [tiempoInicio] = useState(Date.now);
  const [guardando, setGuardando] = useState(false);
  const [puntaje, setPuntaje] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [errorGuardado, setErrorGuardado] = useState("");

  const handleSubmit = async () => {
    const aciertos = PREGUNTAS.filter((pregunta, index) => respuestas[index] === pregunta.correcta).length;
    const resultado = Math.round((aciertos / PREGUNTAS.length) * 100);
    const duracion = Math.max(0, Math.floor((Date.now() - tiempoInicio) / 1000));
    const respuestasDetalladas = PREGUNTAS.map((pregunta, index) => ({
      pregunta: pregunta.pregunta,
      opciones: pregunta.opciones,
      respuesta_seleccionada: pregunta.opciones[respuestas[index]],
      respuesta_correcta: pregunta.opciones[pregunta.correcta],
      es_correcta: respuestas[index] === pregunta.correcta,
    }));
    setGuardando(true);
    setErrorGuardado("");
    try {
      const token = localStorage.getItem("token");
      const targetUser = getOfficePatient();
      const response = await fetch(apiUrl('/resultados/'), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_prueba: "alfabeto",
          puntaje: resultado,
          duracion_segundos: duracion,
          detalles: {
            total_preguntas: PREGUNTAS.length,
            preguntas_respondidas: Object.keys(respuestas).length,
            correctas: aciertos,
            incorrectas: PREGUNTAS.length - aciertos,
            respuestas: respuestasDetalladas,
          },
          target_user_id: targetUser?.id
        })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setPuntaje(resultado);
        setResumen({ aciertos, duracion, respuestas: respuestasDetalladas });
      }
      else setErrorGuardado(data.error || data.detail || "No se pudo guardar el resultado. Intenta de nuevo.");
    } catch (error) {
      console.error("Error al guardar evaluación:", error);
      setErrorGuardado("No se pudo conectar con el servidor para guardar el resultado.");
    } finally {
      setGuardando(false);
    }
  };

  if (puntaje !== null) {
    return (
      <div className="prueba-resultado">
        <div className="resultado-container">
          <div className="resultado-score">
            <h1>¡Filtro completado!</h1>
            <div className="score-circle">{puntaje}%</div>
            <p className="score-text">Resultado del test de conocimiento del alfabeto</p>
          </div>
          <div className="resultado-stats">
            <div className="stat"><span className="stat-label">Respuestas correctas</span><span className="stat-value">{resumen?.aciertos ?? 0} / {PREGUNTAS.length}</span></div>
            <div className="stat"><span className="stat-label">Tiempo</span><span className="stat-value">{resumen?.duracion ?? 0}s</span></div>
          </div>
          <div className="respuestas-section">
            <h4>Revisión de respuestas</h4>
            <div className="respuestas-list">
              {resumen?.respuestas.map((resp, index) => (
                <div key={index} className={`respuesta-item ${resp.es_correcta ? 'correcta' : 'incorrecta'}`}>
                  <div className="respuesta-header"><span className="respuesta-numero">Pregunta {index + 1}</span><span className={`respuesta-estado ${resp.es_correcta ? 'correcto' : 'incorrecto'}`}>{resp.es_correcta ? '✓ Correcta' : '✗ Incorrecta'}</span></div>
                  <p className="respuesta-pregunta">{resp.pregunta}</p>
                  <div className="respuesta-opciones"><div className="opcion-seleccionada"><strong>Tu respuesta:</strong><p>{resp.respuesta_seleccionada}</p></div>{!resp.es_correcta && <div className="opcion-correcta"><strong>Respuesta correcta:</strong><p>{resp.respuesta_correcta}</p></div>}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => navigate("/resultados")} className="btn-resultados">Ver mis resultados</button>
          <button onClick={() => navigate("/pruebas")} className="btn-volver">Volver a pruebas</button>
        </div>
      </div>
    );
  }

  return (
    <div className="prueba-lectura prueba-alfabeto">
      <div className="prueba-container">
        <div className="prueba-header">
          <h1>Conocimiento del Alfabeto</h1>
          <h2>Responde las preguntas sobre las letras y su orden.</h2>
        </div>
        <div className="preguntas-section">
          {PREGUNTAS.map((pregunta, index) => (
            <div key={index} className="pregunta-card">
              <p className="pregunta-text">{index + 1}. {pregunta.pregunta}</p>
              <div className="opciones">
                {pregunta.opciones.map((opcion, opcionIndex) => (
                  <label key={opcion} className="opcion">
                    <input type="radio" name={`pregunta-${index}`} checked={respuestas[index] === opcionIndex} onChange={() => setRespuestas({ ...respuestas, [index]: opcionIndex })} />
                    <span>{opcion}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="prueba-actions">
          {errorGuardado && <div className="error-message" role="alert">{errorGuardado}</div>}
          <button onClick={handleSubmit} disabled={Object.keys(respuestas).length < PREGUNTAS.length || guardando} className="btn-submit">
            {guardando ? "Guardando..." : "Guardar resultados"}
          </button>
        </div>
      </div>
    </div>
  );
}
