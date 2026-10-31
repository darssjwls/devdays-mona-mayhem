<!-- l10n-sync: source-file="workshop/06-bonus.md" -->
# 🎉 Extras y extensiones

---

¡Has creado una aplicación de GitHub Battle totalmente funcional! Ahora puedes ir más allá con **retos abiertos**.

<!-- track:vscode:start -->
Usa **Agent Mode** para todos estos retos: describe lo que quieres y deja que Copilot te ayude a crearlo.
<!-- track:vscode:end -->

<!-- track:cli:start -->
Usa Copilot CLI para todos estos retos: combina el contexto de `@file`, `/plan`, el modo normal y `/review` según lo necesites.
<!-- track:cli:end -->

---

## 🏆 Reto 1: Anuncio del ganador

Cuando se hayan cargado los dos gráficos de contribuciones, compara los totales y muestra un anuncio dinámico del ganador.

**Qué crear:**
- Compara las contribuciones totales de ambos usuarios.
- Si hay un ganador claro, muestra **"🏆 {username} WINS! 🏆"** con un estilo festivo.
- Si las contribuciones son iguales, muestra **"🤝 IT'S A TIE! 🤝"**.
- Añade una animación o confeti para darle más efecto.

**Prompt sugerido:**
> After both users' contribution data loads, compare total contributions and display a winner banner. Show "🏆 {username} WINS! 🏆" if one user has more contributions, or "🤝 IT'S A TIE! 🤝" if equal. Make it visually exciting with CSS animations.

---

## 🏆 Reto 2: Contador de racha

Calcula y muestra la racha de contribuciones consecutivas más larga de cada usuario.

**Qué crear:**
- Analiza los datos de contribuciones día a día.
- Encuentra la secuencia más larga de días consecutivos con al menos una contribución.
- Muestra de forma destacada la duración de la racha de cada usuario.
- Resalta quién tiene la racha más larga.

**Prompt sugerido:**
> Add a streak counter feature that analyzes each user's contribution data to find their longest consecutive contribution streak. Display "🔥 Longest Streak: X days" for each user below their contribution graph.

---

## 🏆 Reto 3: Historial de batallas

Guarda los resultados de las batallas para que los usuarios puedan ver sus enfrentamientos anteriores.

**Qué crear:**
- Guarda cada resultado de batalla en `localStorage` (nombres de usuario, totales, ganador y fecha y hora).
- Añade una sección **"Recent Battles"** debajo del área principal de batalla.
- Muestra las últimas 5–10 batallas con sus resultados.
- Añade un botón «Clear History».

**Prompt sugerido:**
> Save battle results to localStorage after each comparison. Add a "Recent Battles" section that displays the last 10 battles with usernames, contribution totals, the winner, and when the battle happened. Include a "Clear History" button.

---

## 🏆 Reto 4: Efectos de sonido

Añade efectos de sonido de arcade retro con la Web Audio API, sin archivos externos.

**Qué crear:**
- Sonido de **moneda insertada** al hacer clic en el botón «Battle!».
- Sonido de **mejora de nivel** cuando se carguen correctamente los resultados.
- Sonido de **explosión** cuando haya un error (usuario no encontrado o fallo de la API).
- Un botón para silenciar o activar el sonido.

**Prompt sugerido:**
> Add retro arcade sound effects using the Web Audio API (no audio files). Play a coin insert sound on battle start, a power-up sound when results load, and an explosion sound on errors. Generate the sounds programmatically with oscillators and gain nodes. Include a mute toggle.

---

## 🏆 Reto 5: Secuencia de batalla animada

Crea expectación con una cuenta atrás dramática antes de revelar los resultados.

**Qué crear:**
- Al hacer clic en «Battle!», muestra una superposición a pantalla completa.
- Anima la secuencia: **"3..."** → **"2..."** → **"1..."** → **"⚡ FIGHT! ⚡"**.
- Después, muestra los gráficos de contribuciones con una entrada espectacular.
- Usa animaciones CSS o temporizadores de JavaScript.

**Prompt sugerido:**
> Add an animated battle sequence when the user clicks "Battle!". Show a countdown overlay: "3..." then "2..." then "1..." then "⚡ FIGHT! ⚡" with each step lasting about 1 second. After the countdown, reveal the results with a slide-in animation.

---

## 🏆 Reto 6: Leyenda de contribuciones

Añade una leyenda de escala de colores que coincida con la paleta del gráfico de contribuciones.

**Qué crear:**
- Una leyenda horizontal con los niveles de intensidad de las contribuciones.
- Etiquetas desde **"Less"** hasta **"More"**.
- Usa la paleta de colores de la respuesta de la API de contribuciones de GitHub.
- Colócala junto a los gráficos de contribuciones.

**Prompt sugerido:**
> Add a contribution legend below the graphs showing the color scale from the API's color palette. Display a row of colored squares ranging from "Less" (lightest) to "More" (darkest), matching the actual contribution level colors returned by the API.

---

## 🏆 Reto 7: Comparte los resultados

Permite que los usuarios compartan los resultados de su batalla con un solo clic.

**Qué crear:**
- Un botón **"📋 Share Results"** que aparezca después de una batalla.
- Copia un resumen de texto con formato al portapapeles.
- Incluye los nombres de usuario, los totales de contribuciones y el ganador.
- Muestra brevemente el mensaje «Copied!».

**Prompt sugerido:**
> Add a "📋 Share Results" button that copies a formatted battle summary to the clipboard. The summary should include both usernames, their contribution totals, and who won. Use the Clipboard API and show a brief "Copied to clipboard!" confirmation.

---

<!-- track:cli:start -->
## 💻 Extras del CLI

Si quieres explorar más funciones de Copilot CLI después del taller:

- Usa `copilot -p "Write a conventional commit message for the current git diff"` para generar una respuesta única que puedes copiar en Git.
- Ejecuta `/share file` para guardar tu sesión como Markdown y consultarla más adelante.
- Usa `/session` y `/session plan` para ver cómo el CLI registra el trabajo actual.
<!-- track:cli:end -->

## 🎊 ¡Enhorabuena!

Has completado el taller **Mona Mayhem: GitHub Battle**. Esto es lo que has conseguido:

### Lo que has creado

- ✅ Una **aplicación web multipágina completa** a partir de una especificación de diseño
- ✅ Una **página de inicio** con tema de arcade retro y diseño adaptable
- ✅ Una **arena de batalla** que obtiene y compara datos reales de contribuciones de GitHub
- ✅ **Gráficos de contribuciones interactivos** con niveles de actividad diferenciados por colores
- ✅ **Manejo de errores, estados de carga y mejoras de accesibilidad**
- ✅ **Diseño adaptable** para distintos dispositivos

### Lo que has practicado

| Habilidad | Qué has practicado |
|---|---|
| **Ingeniería de contexto** | Proporcionar a Copilot los archivos, las instrucciones y las restricciones adecuadas |
| **Planificación** | Generar y perfeccionar planes de implementación antes de programar |
| **Programación agéntica** | Delegar a Copilot tareas de varios pasos en múltiples archivos |
| **Iteración de diseño** | Partir de una dirección visual y perfeccionarla hasta obtener un resultado pulido |
| **Disciplina de revisión** | Inspeccionar los cambios generados por IA antes de crear un commit |

### 🚀 Sigue aprendiendo

- 📺 [Canal de YouTube de VS Code](https://www.youtube.com/@code) — Consejos, tutoriales y novedades
- 📖 [Documentación de GitHub Copilot](https://docs.github.com/en/copilot) — Documentación y guías oficiales
- 💻 [Documentación de GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli) — Instalación, comandos slash y prácticas recomendadas
- 🌟 [Awesome GitHub Copilot](https://github.com/stefanprodan/awesome-github-copilot) — Recursos y ejemplos de la comunidad
- 🛠️ [Talleres Copilot Dev Days](https://github.com/github/copilot-dev-days) — Más talleres prácticos

---

## 🙏 ¡Gracias!

Gracias por participar en este taller. Has comprobado cómo GitHub Copilot puede acelerar todas las fases del desarrollo, desde la planificación y el diseño hasta la implementación y el pulido. Las técnicas que has practicado sirven para cualquier proyecto, framework o escala. ¡Ahora crea algo increíble! 🚀
