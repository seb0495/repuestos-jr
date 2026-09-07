const WHATSAPP_NUMBER = "50688363251";

document.body.classList.add("reveal-ready");

const form = document.querySelector("#formulario");
const errorBox = document.querySelector("#form-error");

const value = (name) => form.elements[name].value.trim();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const required = ["nombre", "marca", "modelo", "ano", "repuesto"];
  const missing = required.filter((field) => !value(field));

  if (missing.length) {
    errorBox.textContent = "Complete nombre, marca, modelo, a\u00f1o y repuesto.";
    form.elements[missing[0]].focus();
    return;
  }

  errorBox.textContent = "";

  const message = `Hola, Repuestos J&R. Quiero cotizar un repuesto para un veh\u00edculo americano.

Nombre: ${value("nombre")}
Telefono: ${value("telefono")}
Veh\u00edculo: ${value("marca")} ${value("modelo")} ${value("ano")}
Motor / versi\u00f3n: ${value("motor")}
VIN / chasis: ${value("vin")}
Repuesto solicitado: ${value("repuesto")}
Preferencia: ${value("preferencia")}
Urgencia: ${value("urgencia")}
Detalles adicionales: ${value("detalles")}

Quedo atento, gracias.`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
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
