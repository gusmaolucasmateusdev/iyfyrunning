const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");

menuButton.addEventListener("click", () => {
const isOpen =
menuButton.getAttribute("aria-expanded") === "true";

menuButton.setAttribute("aria-expanded", String(!isOpen));
navigation.classList.toggle("open", !isOpen);
});

navigation.querySelectorAll("a").forEach((link) => {
link.addEventListener("click", () => {
navigation.classList.remove("open");
menuButton.setAttribute("aria-expanded", "false");
});
});

const newsletterForm = document.querySelector("#newsletter-form");
const formMessage = document.querySelector(".form-message");

newsletterForm.addEventListener("submit", (event) => {
event.preventDefault();

formMessage.textContent =
"Obrigado! Sua inscrição de demonstração foi recebida.";

newsletterForm.reset();
});
