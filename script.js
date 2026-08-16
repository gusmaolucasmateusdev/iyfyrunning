const searchInput = document.getElementById("search");

if (searchInput) {

    searchInput.addEventListener("keyup", () => {

        const value = searchInput.value.toLowerCase();

        const articles = document.querySelectorAll(
            ".story-card, .latest-card, .science-item"
        );

        articles.forEach(article => {

            const text = article.innerText.toLowerCase();

            if (text.includes(value)) {
                article.style.display = "";
            } else {
                article.style.display = "none";
            }

        });

    });

}

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 100) {

        header.style.padding = "14px 5%";
        header.style.boxShadow = "0 4px 20px rgba(0,0,0,.06)";

    } else {

        header.style.padding = "22px 5%";
        header.style.boxShadow = "none";

    }

});

// ======================================
// ANIMAÇÃO AO SCROLL
// ======================================

const revealElements = document.querySelectorAll(
    ".story-card, .latest-card, .science-item, .feature-story, .newsletter"
);

const revealObserver = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    },

    {
        threshold: 0.15
    }

);

revealElements.forEach(el => {

    el.classList.add("hidden");

    revealObserver.observe(el);

});

// ======================================
// BOTÃO VOLTAR AO TOPO
// ======================================

const backToTop = document.createElement("button");

backToTop.innerHTML = "↑";

backToTop.classList.add("back-top");

document.body.appendChild(backToTop);

window.addEventListener("scroll", () => {

    if (window.scrollY > 500) {

        backToTop.classList.add("active");

    } else {

        backToTop.classList.remove("active");

    }

});

backToTop.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// ======================================
// MENU ATIVO
// ======================================

const navLinks = document.querySelectorAll(".nav a");

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navLinks.forEach(item => {
            item.classList.remove("active-link");
        });

        link.classList.add("active-link");

    });

});

// ======================================
// LAZY LOADING
// ======================================

const images = document.querySelectorAll("img");

const imageObserver = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const img = entry.target;

                img.style.opacity = "1";

                imageObserver.unobserve(img);

            }

        });

    }

);

images.forEach(img => {

    img.style.opacity = "0";
    img.style.transition = "opacity .8s ease";

    imageObserver.observe(img);

});

// ======================================
// CONTADOR DE LEITURA
// ======================================

const articleCards = document.querySelectorAll(".story-card");

articleCards.forEach(card => {

    card.addEventListener("click", () => {

        let views = localStorage.getItem("iyfyViews");

        views = views ? parseInt(views) : 0;

        views++;

        localStorage.setItem("iyfyViews", views);

        console.log(`Visualizações: ${views}`);

    });

});

// ======================================
// DATA ATUAL AUTOMÁTICA
// ======================================

const today = new Date();

console.log(
    "Iyfy Running carregado em:",
    today.toLocaleDateString("pt-BR")
);

// ======================================
// PRELOADER SIMPLES
// ======================================

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

});

// ======================================
// EFEITO PARALLAX NO HERO
// ======================================

const heroImage = document.querySelector(".hero img");

window.addEventListener("scroll", () => {

    if (!heroImage) return;

    const scroll = window.pageYOffset;

    heroImage.style.transform =
        `translateY(${scroll * 0.15}px)`;

});

// ======================================
// CONSOLE
// ======================================

console.log(
`
🏃 IYFY RUNNING

Portal carregado com sucesso.

Versão: 1.0
`
);