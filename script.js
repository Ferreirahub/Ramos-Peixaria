// Header scroll effect
const menuIcon = document.querySelector(".menu-icon");
const menu = document.querySelector(".menu");

menuIcon.addEventListener("click", () => {
  menu.classList.toggle("active");
});

const header = document.getElementById("header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Smooth scroll for navigation links
document.querySelectorAll("nav a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      const headerHeight = header.offsetHeight;
      const targetPosition = targetSection.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  });
});

// Animate elements on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Add animation to product cards
document
  .querySelectorAll(".product-card, .feature-card, .contact-item")
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

// Coloque aqui o seu link do Google Sheets terminado em &output=csv
// Link corrigido com o seu ID de planilha
const urlPlanilha =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_1EvGryX7QGYXC4CKdtRu0ZkWItAS9DabGk4bWQ8GSmyBZDZv3NNFIZUlkq1_qqjcNJ2TRPAzHMyv/pub?output=csv&time=" +
  Date.now();

async function atualizarPrecos() {
  try {
    console.log("Tentando conectar à planilha...");
    const resposta = await fetch(urlPlanilha);

    if (!resposta.ok) {
      throw new Error(
        "Não foi possível encontrar a planilha. Verifique o link."
      );
    }

    const texto = await resposta.text();
    // Divide as linhas e remove a primeira (cabeçalho)
    const linhasDaTabela = texto.split("\n").slice(1);

    linhasDaTabela.forEach((linha) => {
      // Separa as colunas limpando espaços e aspas
      const colunas = linha.split(",").map((c) => c.replace(/"/g, "").trim());

      if (colunas.length >= 2) {
        // Prepara o ID (ex: "Salmão Fresco" vira "salmao-fresco")
        const nomeFormatado = colunas[0]
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-");

        const idElemento = `preco-${nomeFormatado}`;
        const elemento = document.getElementById(idElemento);

        if (elemento) {
          // Limpa o preço (tira R$ e troca vírgula por ponto para o cálculo)
          let valorLimpo = colunas[1]
            .replace("R$", "")
            .trim()
            .replace(",", ".");
          let numero = parseFloat(valorLimpo);

          if (!isNaN(numero)) {
            // Formata o preço no padrão brasileiro R$ 00,00
            elemento.innerText = `R$ ${numero.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}/kg`;
          }

          if (idElemento === "preco-ostra") {
            elemento.innerText = `R$ ${numero.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}/uni`;
          } else if (idElemento === "preco-caranguejo") {
            elemento.innerText = `R$ ${numero.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}/dz`;
          }
        }
      }
    });
    console.log("Preços atualizados com sucesso!");
  } catch (erro) {
    console.error("Erro detalhado no script:", erro.message);
  }
}

// Inicia a atualização
atualizarPrecos();

function verificarStatus() {
  const agora = new Date();
  const diaSemana = agora.getDay(); // 0 = Domingo, 1 = Segunda...
  const hora = agora.getHours();

  const textoStatus = document.getElementById("status-texto");
  const circuloStatus = document.getElementById("status-circulo");

  let aberto = false;

  if (diaSemana >= 1 && diaSemana <= 6) {
    // Segunda a Sábado
    if (hora >= 4 && hora < 12) aberto = true;
  } else if (diaSemana === 0) {
    // Domingo
    if (hora >= 5 && hora < 12) aberto = true;
  }

  if (aberto) {
    textoStatus.innerText = "Estamos Abertos! Faça seu pedido.";
    circuloStatus.className = "aberto-cor";
  } else {
    textoStatus.innerText = "Loja Fechada no momento.";
    circuloStatus.className = "fechado-cor";
  }
}

// Chame a função para ela funcionar
verificarStatus();
