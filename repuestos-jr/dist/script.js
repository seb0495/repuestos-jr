const WHATSAPP_NUMBER = "50672161081";
document.body.classList.add("reveal-ready");
const form = document.querySelector("#formulario");
const errorBox = document.querySelector("#form-error");
const button = form.querySelector('[type="submit"]');
const names = ['nombre', 'telefono', 'marca', 'modelo', 'ano', 'motor', 'vin', 'repuesto', 'urgencia', 'preferencia', 'detalles'];
let pending = false;
let lastPayload = '';
let requestId;
let assignedNumber;
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (pending) return;
  const fields = Object.fromEntries(names.map(name => [name, form.elements[name].value.trim()]));
  const missing = ['nombre', 'marca', 'modelo', 'ano', 'repuesto'].find(name => !fields[name]);
  if (missing) {
    errorBox.textContent = 'Complete nombre, marca, modelo, año y repuesto.';
    form.elements[missing].focus();
    return;
  }
  if (!form.reportValidity()) return;
  if (names.some(name => fields[name].length > 2000)) {
    errorBox.textContent = 'Use como máximo 2000 caracteres por campo.';
    return;
  }
  const payload = JSON.stringify(fields);
  if (payload !== lastPayload) {
    requestId = crypto.randomUUID();
    lastPayload = payload;
    assignedNumber = undefined;
  }
  pending = true;
  button.disabled = true;
  button.textContent = 'Preparando solicitud…';
  form.setAttribute('aria-busy', 'true');
  errorBox.textContent = '';
  try {
    if (!assignedNumber) {
      try {
        const response = await fetch('/api/whatsapp', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId, fields }), signal: AbortSignal.timeout(7000)
        });
        if (response.status === 400 || response.status === 409) {
          errorBox.textContent = 'Revise los datos antes de volver a intentarlo.';
          return;
        }
        const data = await response.json();
        if (!response.ok || !['50672161081', '50672161161', '50688007211'].includes(data.number)) throw new Error();
        assignedNumber = data.number;
      } catch {
        console.warn('whatsapp_assignment_unavailable');
        assignedNumber = WHATSAPP_NUMBER;
      }
    }
    const labels = { nombre: 'Nombre', telefono: 'Teléfono', marca: 'Marca del vehículo', modelo: 'Modelo', ano: 'Año', motor: 'Motor / versión', vin: 'VIN / chasis', repuesto: 'Repuesto solicitado', urgencia: 'Urgencia', preferencia: 'Preferencia', detalles: 'Información adicional' };
    const message = ['Hola, me gustaría solicitar información sobre un repuesto.', '', ...names.filter(name => fields[name]).map(name => `${labels[name]}: ${fields[name]}`)].join('\n');
    // Same-tab navigation works after async processing without popup permissions.
    window.location.assign(`https://wa.me/${assignedNumber}?text=${encodeURIComponent(message)}`);
  } catch {
    errorBox.textContent = 'No pudimos abrir WhatsApp. Vuelva a intentarlo.';
  } finally {
    pending = false;
    button.disabled = false;
    button.textContent = 'Cotizar por WhatsApp';
    form.removeAttribute('aria-busy');
  }
});
const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
