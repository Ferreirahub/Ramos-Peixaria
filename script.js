// 1. Seleção de Elementos Principais
const menuIcon = document.querySelector(".menu-icon");
const menu = document.querySelector(".menu");
const header = document.getElementById("header");
const headerMenu = document.getElementById("menu");

// 2. Menu Mobile com Acessibilidade (Aria-Attributes)
menuIcon.addEventListener("click", () => {
  const isExpanded = menu.classList.toggle("active");
  menuIcon.setAttribute("aria-expanded", isExpanded);
  menuIcon.setAttribute(
    "aria-label",
    isExpanded ? "Fechar menu" : "Abrir menu",
  );
});

// 3. Scroll Otimizado (Unificado com RequestAnimationFrame)
// Isso evita que o navegador tente processar o scroll centenas de vezes por segundo
let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const isScrolled = window.scrollY > 100;
        header.classList.toggle("scrolled", isScrolled);
        if (headerMenu) headerMenu.classList.toggle("scrolled", isScrolled);
        ticking = false;
      });
      ticking = true;
    }
  },
  { passive: true },
); // 'passive' melhora o desempenho do scroll em dispositivos móveis

// 4. Smooth Scroll para links internos
document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const headerOffset = header.offsetHeight;
      const elementPosition = targetElement.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Fecha o menu mobile ao clicar em um link (opcional, melhora UX)
      if (menu.classList.contains("active")) {
        menu.classList.remove("active");
        menuIcon.setAttribute("aria-expanded", "false");
      }
    }
  });
});

// 5. Intersection Observer Otimizado
// Adicione a classe 'hidden' ou estilos de opacidade 0 no CSS para esses elementos
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target); // Para de observar após a animação (ganho de performance)
    }
  });
}, observerOptions);

document
  .querySelectorAll(".product-card, .feature-card, .contact-item")
  .forEach((el) => {
    observer.observe(el);
  });

// 6. Lógica de Preços e Status (Carregados após o carregamento total da página)
async function atualizarPrecos() {
  const urlPlanilha = `https://docs.google.com/spreadsheets/d/e/2PACX-1vR_1EvGryX7QGYXC4CKdtRu0ZkWItAS9DabGk4bWQ8GSmyBZDZv3NNFIZUlkq1_qqjcNJ2TRPAzHMyv/pub?output=csv&time=${Date.now()}`;

  try {
    const response = await fetch(urlPlanilha);
    if (!response.ok) throw new Error("Erro ao buscar planilha");

    const data = await response.text();
    const rows = data.split("\n").slice(1);

    rows.forEach((row) => {
      const cols = row.split(",").map((c) => c.replace(/"/g, "").trim());
      if (cols.length >= 2) {
        const idBase = cols[0]
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-");
        const element = document.getElementById(`preco-${idBase}`);

        if (element) {
          const valorLimpo = cols[1].replace("R$", "").trim().replace(",", ".");
          const preco = parseFloat(valorLimpo);

          if (!isNaN(preco)) {
            let sufixo = "/kg";
            if (idBase === "ostra") sufixo = "/uni";
            if (idBase === "caranguejo") sufixo = "/dz";

            element.innerText = `R$ ${preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}${sufixo}`;
          }
        }
      }
    });
  } catch (error) {
    console.error("Erro na atualização de preços:", error);
  }
}

function verificarStatus() {
  const agora = new Date();
  const dia = agora.getDay();
  const hora = agora.getHours();
  const statusTexto = document.getElementById("status-texto");
  const statusCirculo = document.getElementById("status-circulo");

  if (!statusTexto || !statusCirculo) return;

  let aberto = false;
  // Seg-Sáb: 4h às 12h | Dom: 5h às 12h
  if (dia >= 1 && dia <= 6) {
    if (hora >= 4 && hora < 12) aberto = true;
  } else if (dia === 0) {
    if (hora >= 5 && hora < 12) aberto = true;
  }

  statusTexto.innerText = aberto
    ? "Estamos Abertos! Faça seu pedido."
    : "Loja Fechada no momento.";
  statusCirculo.className = aberto ? "aberto-cor" : "fechado-cor";
}

// 7. Inicialização Tardia (Deferred Execution)
// Espera o site carregar tudo antes de rodar scripts secundários

document.addEventListener("DOMContentLoaded", () => {
  atualizarPrecos();
  verificarStatus();
});

window.addEventListener("load", () => {
  setTimeout(() => {
    const s = document.createElement("script");
    s.src = "https://static.elfsight.com/platform.js";
    s.defer = true;
    document.body.appendChild(s);
  }, 4000);
});
