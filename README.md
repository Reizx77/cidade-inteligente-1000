# Cidade Inteligente 1000 — Painel SP

Painel web estático (HTML/CSS/JS) focado em **cidades inteligentes e sustentabilidade**, integrando **dados reais** de clima e qualidade do ar para **Guarulhos/SP**.

## ✨ Funcionalidades
- **PM2.5 e PM10 por estação (simulado)** — exemplo pedagógico por regiões da cidade.
- **Clima atual (real)** — Open‑Meteo: temperatura, sensação térmica, umidade e vento.
- **Histórico de qualidade do ar 2019–2024 (real + fallback)** — Open‑Meteo Air Quality. Se algum ano não estiver disponível, o sistema preenche com valores simulados e exibe aviso.
- **Portal de Transparência (simulado)** — exemplo de projetos públicos com orçamento e status.

## 🧱 Tecnologias
- HTML5, CSS3 (tema escuro), JavaScript
- [Chart.js 4.x](https://www.chartjs.org/)
- **APIs**: [Open‑Meteo](https://open-meteo.com), [Open‑Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) *(requisições reais no navegador)*
- Links de referência: [OpenAQ](https://openaq.org) (dados abertos globais de qualidade do ar)

## ▶️ Como rodar
1. Baixe e extraia o `.zip`.
2. **Clique duas vezes** no `index.html` para abrir no navegador **ou** rode com um servidor local (ex.: VS Code Live Server).
3. Garanta conexão com a internet para que as **APIs** funcionem.
4. Se algum ano falhar na API, os gráficos informam e usam valores de fallback.

## 📍 Localização
- Latitude: **−23.454**, Longitude: **−46.533** (Guarulhos/SP).  
  Altere em `script.js` (`LAT`/`LON`) para outra cidade.

## 🧩 Alinhamento ao I GranDSI‑BR (2016–2026)
- **Sistemas inteligentes e dados abertos:** consumo de APIs públicas para indicadores urbanos.
- **Transparência:** vitrine de dados e simulação de portal de projetos.
- **Visão sociotécnica:** aproximação de cidadãos, gestores e tecnologia.

> Sugestão de referência ABNT para o documento GranDSI‑BR:  
> SOCIEDADE BRASILEIRA DE COMPUTAÇÃO. *Grand Research Challenges in Information Systems in Brazil (2016–2026).* 2016.

## 📁 Estrutura
```
cidade-inteligente-1000/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🔐 Observações
- Algumas APIs possuem limites de taxa (rate limit). Recarregar muitas vezes pode causar falhas temporárias.
- O projeto é **estático** e pode ser hospedado facilmente no GitHub Pages, Vercel, Netlify etc.


## 🗣️ Conversa & Problemas
Formulário simples que salva relatos no **localStorage** (cliente). Ideal para testes em sala. Para produção, conecte a um backend (ex.: planilha Google via Apps Script, ou API própria).

## 💰 Transparência de Impostos (API)
O gráfico lê um endpoint **local** `data/transparencia.json` que simula uma API.
Para usar dados oficiais, substitua a URL no `script.js` (`carregarImpostos()`) por um endpoint real (ex.: Portal da Transparência municipal/estadual).

> Observação: Navegadores podem bloquear `fetch` de arquivo local com `file://`. Use um servidor local (VS Code **Live Server**) para que `fetch('data/transparencia.json')` funcione sem CORS.

## 📚 Guia do Site
Seção pedagógica que explica, em linguagem simples, o significado de cada indicador/área e como interpretar.


---

## 🚀 Versão SP Pro — Melhorias
- Integração real com **Prefeitura de São Paulo (APILIB)** para arrecadação (`/api/receita/arrecadacao`) com **fallback** local.
- Novos gráficos:
  - **Mensal (ano mais recente)** — barras.
  - **Anual 2019–2024** — tendência.
  - **Breakdown por tributo** — IPTU x ISS x Outros.
- Ícones **ℹ️** com explicações nos títulos.
- Link direto no rodapé para os **dados brutos (API)**.

## 🔗 Fontes oficiais
- Prefeitura de São Paulo — APILIB: `https://apilib.prefeitura.sp.gov.br/api/receita/arrecadacao`
- Dados Abertos (Gov.br): https://dados.gov.br/
- Portal da Transparência: https://portaldatransparencia.gov.br/

## 📘 Interpretação dos gráficos
- **Mensal:** ajuda a ver sazonalidade (ex.: picos de IPTU em início de ano).
- **Anual:** útil para discutir efeitos de políticas públicas e crescimento econômico.
- **Breakdown:** mostra relevância de impostos diretos (IPTU/ISS) vs. demais receitas.

## ⚠️ Notas
- Alguns endpoints podem variar nomes de campos/mês. O código normaliza a ordem dos meses e agrupa por ano/tributo.
- Caso a API não responda, o painel usa **dados locais** (pasta `data/`) e deixa claro no título do gráfico.


## 🗺️ Página de Histórico (2010–2024)
Abra `historico.html` para ver a evolução longa com interpretação automática (diferença percentual 2024 vs 2023). O gráfico usa a **API real** quando disponível e preenche anos faltantes com estimativas suaves para manter a visualização contínua (marcado na interface).

## 🔌 Status da API
O cabeçalho mostra um **indicador**:  
- ✅ *API conectada — dados reais*  
- ⚠️ *Offline — dados locais* (fallback)

