import { useState, useRef, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PageMorph, type PageMorphHandle } from "./components/PageMorph";
import { HorizontalWorkGallery } from "./components/HorizontalWorkGallery";
import { CapabilitiesPreview } from "./components/CapabilitiesPreview";
import { VaibesLogo } from "./components/VaibesLogo";
import { mediaObjectClass, mediaSrc, mediaThumbStyle } from "./utils/media";
import {
  ArrowRight, ArrowUpRight, ArrowLeft, Globe, FileText, Rocket,
  Smartphone, ShoppingBag, LayoutDashboard, Zap, Brain, Layers,
  Gauge, ChevronDown, ChevronLeft, ChevronRight, Check, Menu, X, MoveRight,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const F = {
  display: "'Inter', sans-serif",
  body: "'Roboto Mono', monospace",
  mono: "'Roboto Mono', monospace",
};
const P = "#F4F4F6";
const DARK = "#000000";
const INK = "#F5F5F7";
const GRID = "#353535";
const MUTED = "#6B7280";

// ─── Animation helpers ────────────────────────────────────────────────────────
const ease = [0, 0, 1, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const pageTrans = { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } };
const pageTransProps = { transition: { duration: 0.2, ease } };

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "home" | "portfolio" | "services" | "contact";
type View = { page: Page } | { page: "project"; id: string };

function viewsMatch(a: View, b: View) {
  if (a.page !== b.page) return false;
  if (a.page === "project" && b.page === "project") return a.id === b.id;
  return true;
}
type Lang = "pt" | "en";

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  pt: {
    nav: {
      portfolio: "Portfólio",
      services: "Serviços",
      contact: "Contato",
      cta: "Iniciar projeto",
    },
    footer: {
      tagline: "Construindo o que importa, uma ideia de cada vez.",
    },
    cta: {
      eyebrow: "Vamos construir algo que vale a pena",
      title: ["Construa o que", "importa."],
      body: "Se você tem algo que vale a pena construir, adoraríamos ajudar. Da estratégia e identidade a produtos e experiências.",
      btn1: "Iniciar projeto",
      btn2: "Fale conosco",
      note: "Resposta em até 24 horas · Sem compromisso",
    },
    home: {
      hero: {
        badge: "Estúdio de Experiências Digitais",
        h1: ["Construa o que", "importa."],
        sub: "Ajudamos empresas a transformar ideias em marcas, produtos e experiências digitais feitos para crescer.",
        support: "Da estratégia e identidade a websites, plataformas SaaS e aplicações, construímos soluções que merecem existir.",
        cta2: "Ver trabalhos",
        stats: [
          { v: "120+", l: "projetos entregues" },
          { v: "6 capacidades", l: "estratégia a produto" },
          { v: "100%", l: "remoto e assíncrono" },
        ],
      },
      about: {
        label: "Sobre",
        aboutTitle: ["Construir o que importa."],
        aboutP1: "Estúdio de produto. Estratégia, marca e software.",
        aboutP2: "",
        methodTitle: ["Método"],
        methodP: "01 Descoberta — 02 Estrutura — 03 Construção — 04 Validação — 05 Evolução",
      },
      work: {
        label: "Trabalhos selecionados",
        title: ["Produtos, marcas e", "experiências digitais"],
        btnAll: "Ver todos os projetos",
        btnMore: "Ver todos os trabalhos",
      },
      caps: {
        label: "Nossas capacidades",
        title: ["Da estratégia ao produto,", "de ponta a ponta"],
        btn: "Todas as capacidades",
        items: [
          { num: "01", title: "Estratégia", desc: "Pesquisa, workshops, posicionamento e mapeamento de oportunidades." },
          { num: "02", title: "Marca", desc: "Sistemas de identidade, linguagem visual e fundações de marca." },
          { num: "03", title: "Produto", desc: "Landing pages, websites, plataformas SaaS, apps e e-commerce." },
          { num: "04", title: "Experiência", desc: "Jornadas de usuário, interfaces e ecossistemas digitais." },
          { num: "05", title: "Evolução", desc: "Otimização, validação e melhoria contínua." },
        ],
      },
      tools: {
        label: "Ferramentas de suporte",
        title: ["Ferramentas que", "aceleram ideias."],
        desc: "Ferramentas modernas que aceleram o que construímos juntos",
      },
    },
    portfolio: {
      badge: "Vaibes · Portfólio",
      h1: ["Projetos", "Selecionados"],
      sub: "Produtos, marcas e experiências digitais construídos com intenção. Cada projeto começa com um propósito claro e termina com algo que as pessoas genuinamente usam.",
      stats: [
        { v: "7+", l: "anos" },
        { l: "projetos" },
        { v: "Sempre", l: "intencional" },
      ],
      viewCase: "Ver Caso",
      empty: "Nenhum projeto nesta categoria ainda.",
    },
    categories: {
      All: "Todos",
      "Landing Pages": "Landing Pages",
      "Institutional Websites": "Websites Institucionais",
      "E-commerce": "E-commerce",
      "Admin Dashboards": "Dashboards",
      SaaS: "SaaS",
      Apps: "Aplicativos",
      MVPs: "MVPs",
    },
    project: {
      back: "Voltar aos trabalhos",
      year: "Ano",
      tools: "Ferramentas",
      toolsCount: "tecnologias",
      goalLabel: "Objetivo",
      goalTitle: "Por que este projeto existiu",
      clientSegment: "Cliente",
      challenge: "Desafio",
      scopeLabel: "Escopo",
      scopeTitle: "O que entregamos",
      galleryLabel: "Galeria",
      galleryTitle: "Telas e vistas",
      techLabel: "Tecnologias",
      techTitle: "Feito com as ferramentas certas",
      resultsLabel: "Resultados",
      resultsTitle: "Números que importam",
      previous: "Anterior",
      next: "Próximo",
      openImage: "Ampliar imagem",
      screen: "Tela",
    },
    process: [
      { num: "01", title: "Descoberta", desc: "Objetivos, contexto, usuários e mapeamento de oportunidades — compreender antes de agir." },
      { num: "02", title: "Estrutura", desc: "Arquitetura de informação, fluxos de usuário e fundações do produto." },
      { num: "03", title: "Construção", desc: "Criando a experiência com precisão, velocidade e intencionalidade." },
      { num: "04", title: "Validação", desc: "Testando com usuários reais, refinando com base no que aprendemos." },
      { num: "05", title: "Evolução", desc: "Melhoria contínua à medida que o produto cresce e o mercado evolui." },
    ],
    services: {
      badge: "Vaibes · Capacidades",
      h1: ["Estratégia, identidade", "e produtos digitais."],
      sub: "Ajudamos empresas a transformar ideias em marcas, produtos e experiências digitais. Combinamos estratégia, identidade, experiência e tecnologia para construir soluções que merecem existir.",
      cta1: "Iniciar projeto",
      cta2: "Ver portfólio",
      stats: [
        { v: "120+", l: "projetos entregues" },
        { v: "6 capacidades", l: "estratégia a produto" },
        { v: "100%", l: "remoto e assíncrono" },
      ],
      caps: {
        label: "Nossas capacidades",
        title: ["O que construímos,", "e como pensamos"],
        desc: "Cada capacidade está fundamentada na mesma crença: a tecnologia só importa quando serve a um propósito real.",
      },
      method: {
        label: "Nosso método",
        title: ["Pense profundamente.", "Construa com intenção."],
        desc: "Um processo repetível que entrega rápido sem sacrificar profundidade.",
      },
      tools: {
        label: "Ferramentas de suporte",
        title: ["Ferramentas que", "aceleram ideias."],
        desc: "Utilizamos tecnologias modernas e workflows para avançar rapidamente e melhorar continuamente o que construímos.",
        metrics: [
          { label: "Websites e landing pages", value: "1–2 sem", note: "entrega típica" },
          { label: "Produtos e plataformas", value: "4–8 sem", note: "do brief ao lançamento" },
          { label: "Evolução contínua", value: "Sempre", note: "nunca verdadeiramente acabado" },
        ],
      },
      faq: {
        label: "Perguntas frequentes",
        title: ["Dúvidas", "comuns"],
        link: "Algo mais em mente? Vamos conversar.",
        items: [
          { q: "Quanto tempo leva um projeto?", a: "Depende do escopo e da complexidade. A maioria dos websites e landing pages são entregues em 1–2 semanas. Plataformas e produtos completos geralmente levam 4–8 semanas. Alinhamos os prazos antes de começar." },
          { q: "Vocês podem ajudar a validar uma ideia antes de construir?", a: "Sim — e acreditamos que isso é uma das coisas mais valiosas que podemos fazer. Ajudamos equipes a definir, estruturar e testar ideias antes de comprometer com um build completo." },
          { q: "Vocês oferecem suporte contínuo?", a: "Sim. Muitos dos nossos clientes escolhem trabalhar conosco de forma contínua — evoluindo seu produto, melhorando o que existe e construindo o que vem a seguir." },
          { q: "Como escolhem as ferramentas a utilizar?", a: "Escolhemos com base no que é certo para o projeto — não no que está na moda. O objetivo é sempre um produto que funciona bem, escala adequadamente e é fácil de manter." },
          { q: "Vocês podem melhorar algo que já existe?", a: "Com certeza. Frequentemente trabalhamos com produtos existentes para melhorar clareza, desempenho e experiência do usuário. Às vezes, o melhor build é um rebuild feito corretamente." },
          { q: "Vocês trabalham com equipes remotamente?", a: "Sim — totalmente remoto e preparado para isso. Trabalhamos com clientes em diferentes fusos horários com comunicação clara, feedback estruturado e total transparência." },
        ],
      },
      services: [
        {
          id: "websites", title: "Websites Institucionais",
          description: "Websites construídos para comunicar o que sua marca representa — com clareza, intenção e uma primeira impressão duradoura.",
          items: ["Design responsivo", "Estrutura SEO", "Formulários de contato", "Integração CMS", "Otimização de performance"],
          idealFor: "Empresas, consultores e negócios de serviços.",
        },
        {
          id: "landing", title: "Landing Pages",
          description: "Páginas projetadas para transformar atenção em ação — estruturadas em torno de mensagens claras, hierarquia forte e chamadas para ação com propósito.",
          items: ["Estrutura de copy", "Layouts responsivos", "Seções focadas em conversão", "Formulários de captação de leads", "Integração de analytics"],
          idealFor: "Campanhas de marketing e produtos digitais.",
        },
        {
          id: "saas", title: "Plataformas SaaS",
          description: "Plataformas de software construídas para crescer com seu negócio — arquitetadas com cuidado, criadas com esmero e prontas para escalar.",
          items: ["Autenticação", "Dashboards", "Gestão de usuários", "Operações CRUD", "Busca e upload de arquivos", "Permissões por perfil"],
          idealFor: "Startups e negócios digitais.",
        },
        {
          id: "apps", title: "Aplicações",
          description: "Aplicações web e MVPs construídos para validar ideias, acelerar o aprendizado e criar valor real para usuários reais.",
          items: ["Fluxos de usuário", "Interfaces responsivas", "Arquitetura de produto", "Fundações escaláveis"],
          idealFor: "Fundadores e inovadores.",
        },
        {
          id: "ecommerce", title: "E-commerce",
          description: "Lojas online projetadas em torno da experiência do cliente — onde usabilidade, confiança e conversão trabalham juntos.",
          items: ["Catálogo de produtos", "Carrinho de compras", "Fluxo de checkout", "Área do cliente", "Gestão de produtos"],
          idealFor: "Marcas e varejistas.",
        },
        {
          id: "dashboards", title: "Dashboards Administrativos",
          description: "Plataformas internas que trazem clareza à complexidade — ajudando equipes a tomar melhores decisões com melhores informações.",
          items: ["Métricas e KPIs", "Relatórios", "Gestão de usuários", "Busca e filtros", "Visualização de dados"],
          idealFor: "Equipes e empresas.",
        },
      ],
    },
    contact: {
      badge: "Vaibes · Contato",
      h1: ["Vamos construir", "o que importa."],
      sub: "Seja uma ideia, um novo projeto ou simplesmente explorar possibilidades, adoraríamos ouvir de você.",
      support: "A Vaibes opera entre o Brasil e Portugal, colaborando remotamente com clientes e times ao redor do mundo.",
      intro: {
        label: "Por onde começar",
        title: "Comece com uma conversa.",
        p1: "Todo projeto começa de forma diferente.",
        p2: "Alguns começam com um esboço, outros com um desafio, uma oportunidade de negócio ou simplesmente a intuição de que algo pode ser melhorado.",
        p3: "Independente do estágio em que você está, estamos felizes em explorar juntos.",
      },
      form: {
        label: "Formulário de contato",
        title: ["Conte-nos o que você", "está construindo."],
        name: "Nome",
        email: "E-mail",
        company: "Empresa ou projeto",
        projectType: "Tipo de projeto",
        selectType: "Selecione um tipo",
        projectOptions: ["Website Institucional", "Landing Page", "Plataforma SaaS", "Aplicação", "E-commerce", "Dashboard Administrativo", "Identidade de Marca", "Ainda não sei"],
        budget: "Faixa de investimento",
        budgetOptions: ["Até €2k", "€2k–€5k", "€5k–€10k", "€10k+"],
        message: "Mensagem",
        placeholder: "Conte-nos sobre seu projeto, ideia ou desafio...",
        btn: "Iniciar projeto",
        note: "Resposta em até 24 horas · Sem compromisso",
        successTitle: "Mensagem recebida.",
        successText: "Entraremos em contato em até 24 horas. Aguardamos a conversa.",
      },
      availability: {
        status: "Status",
        title: "Atualmente aceitando projetos selecionados.",
        text: "Trabalhamos intencionalmente com um número limitado de clientes para garantir foco, qualidade e colaboração significativa.",
      },
      connect: {
        label: "Formas de contato",
        title: "Fale conosco onde for mais natural.",
        items: [
          { label: "E-mail", detail: "hello@vaibes.studio" },
          { label: "LinkedIn", detail: "linkedin.com/company/vaibes" },
          { label: "Instagram", detail: "@vaibes.studio" },
          { label: "WhatsApp", detail: "Mensagem rápida" },
          { label: "Agendar reunião", detail: "Escolha um horário" },
        ],
      },
      locations: {
        label: "Nossa presença",
        title: ["Dois pontos de contato,", "um estúdio."],
        desc: "A Vaibes opera em dois países, combinando pensamento estratégico, experiência de produto e execução ágil.",
        portugal: {
          country: "Portugal",
          role: "Produto, Estratégia & Experiência",
          items: ["Descoberta", "Estratégia de Marca", "Design de Produto", "UX & Design de Serviço", "Experiência do Cliente"],
          city: "Porto, Portugal",
          tz: "GMT",
          resLabel: "Responsável por",
        },
        brazil: {
          country: "Brasil",
          role: "Operações de Projeto & Entrega",
          items: ["Gestão de Projetos", "Operações de Entrega", "Planejamento", "Acompanhamento", "Suporte ao Cliente"],
          city: "Brasil",
          tz: "GMT −3",
          resLabel: "Responsável por",
        },
      },
      faq: {
        label: "Perguntas frequentes",
        title: ["Dúvidas", "comuns"],
        items: [
          { q: "Quanto tempo leva um projeto normalmente?", a: "Depende do escopo e tipo. Websites e landing pages são tipicamente entregues em 1–2 semanas. Plataformas, aplicações e produtos mais complexos levam 4–8 semanas. Alinhamos prazos antes de começar." },
          { q: "Vocês trabalham com clientes fora do Brasil e Portugal?", a: "Sim — totalmente remoto e globalmente orientado. Trabalhamos com equipes em toda a Europa, América do Norte e além. Fusos horários raramente são uma barreira quando a comunicação é bem estruturada." },
          { q: "Podemos começar com uma sessão de descoberta?", a: "Com certeza. Para projetos maiores ou mais complexos, frequentemente recomendamos começar com uma sessão de descoberta estruturada para definir escopo, prioridades e alinhamento antes de comprometer com um build completo." },
          { q: "Vocês apoiam produtos existentes?", a: "Sim. Muitos dos nossos engajamentos começam com auditoria e melhoria do que já existe — refinando UX, reconstruindo arquitetura ou expandindo funcionalidades com intenção." },
          { q: "Os projetos podem ser executados totalmente de forma remota?", a: "Todos eles. Somos construídos para colaboração remota — async-first, documentação clara, ciclos de feedback estruturados e total transparência ao longo do processo." },
        ],
      },
      finalCta: {
        eyebrow: "Vamos começar",
        title: ["Construa o que", "importa."],
        body: "Se você tem algo que vale a pena construir, adoraríamos ouvir sobre isso.",
        btn: "Iniciar uma conversa",
        note: "Resposta em até 24 horas · Sem compromisso",
      },
      footerTagline: "Construindo o que importa, do Brasil a Portugal.",
    },
  },
  en: {
    nav: {
      portfolio: "Portfolio",
      services: "Services",
      contact: "Contact",
      cta: "Start a Project",
    },
    footer: {
      tagline: "Building what matters, one idea at a time.",
    },
    cta: {
      eyebrow: "Let's build something worth building",
      title: ["Build what", "matters."],
      body: "If you have something worth building, we'd love to help. From strategy and identity to products and experiences.",
      btn1: "Start a project",
      btn2: "Contact us",
      note: "Response within 24 hours · No commitment",
    },
    home: {
      hero: {
        badge: "Digital Experiences Studio",
        h1: ["Build what", "matters."],
        sub: "We help businesses transform ideas into brands, products and digital experiences built to grow.",
        support: "From strategy and identity to websites, SaaS platforms and applications, we build solutions that deserve to exist.",
        cta2: "View work",
        stats: [
          { v: "120+", l: "projects shipped" },
          { v: "6 capabilities", l: "strategy to product" },
          { v: "100%", l: "remote & async" },
        ],
      },
      about: {
        label: "About",
        aboutTitle: ["Build what matters."],
        aboutP1: "Product studio. Strategy, brand and software.",
        aboutP2: "",
        methodTitle: ["Method"],
        methodP: "01 Discovery — 02 Structure — 03 Build — 04 Validate — 05 Evolve",
      },
      work: {
        label: "Selected work",
        title: ["Products, brands and", "digital experiences"],
        btnAll: "See all projects",
        btnMore: "View all work",
      },
      caps: {
        label: "Our capabilities",
        title: ["Strategy to product,", "end to end"],
        btn: "All capabilities",
        items: [
          { num: "01", title: "Strategy", desc: "Research, workshops, positioning and opportunity mapping." },
          { num: "02", title: "Brand", desc: "Identity systems, visual language and brand foundations." },
          { num: "03", title: "Product", desc: "Landing pages, websites, SaaS platforms, apps and e-commerce experiences." },
          { num: "04", title: "Experience", desc: "User journeys, interfaces and digital ecosystems." },
          { num: "05", title: "Evolution", desc: "Optimization, validation and continuous improvement." },
        ],
      },
      tools: {
        label: "Tools & support",
        title: ["Tools that", "accelerate ideas."],
        desc: "Modern tools that accelerate what we build together",
      },
    },
    portfolio: {
      badge: "Vaibes · Portfolio",
      h1: ["Selected", "Projects"],
      sub: "Products, brands and digital experiences built intentionally. Every project starts with a clear purpose.",
      stats: [
        { v: "7+", l: "years" },
        { l: "projects" },
        { v: "Always", l: "intentional" },
      ],
      viewCase: "View Case",
      empty: "No projects in this category yet.",
    },
    categories: {
      All: "All",
      "Landing Pages": "Landing Pages",
      "Institutional Websites": "Institutional Websites",
      "E-commerce": "E-commerce",
      "Admin Dashboards": "Admin Dashboards",
      SaaS: "SaaS",
      Apps: "Apps",
      MVPs: "MVPs",
    },
    project: {
      back: "Back to work",
      year: "Year",
      tools: "Tools",
      toolsCount: "technologies",
      goalLabel: "Goal",
      goalTitle: "Why this project existed",
      clientSegment: "Client",
      challenge: "Challenge",
      scopeLabel: "Scope",
      scopeTitle: "What we delivered",
      galleryLabel: "Gallery",
      galleryTitle: "Screens & views",
      techLabel: "Technologies",
      techTitle: "Built with the right tools",
      resultsLabel: "Results",
      resultsTitle: "Numbers that matter",
      previous: "Previous",
      next: "Next",
      openImage: "Open image",
      screen: "Screen",
    },
    process: [
      { num: "01", title: "Discover", desc: "Goals, context, users and opportunity mapping — understanding before acting." },
      { num: "02", title: "Structure", desc: "Information architecture, user flows and product foundations." },
      { num: "03", title: "Build", desc: "Crafting the experience with precision, speed and intentionality." },
      { num: "04", title: "Validate", desc: "Testing with real users, refining based on what we learn." },
      { num: "05", title: "Evolve", desc: "Continuous improvement as the product grows and the market shifts." },
    ],
    services: {
      badge: "Vaibes · Capabilities",
      h1: ["Strategy, identity", "and digital products."],
      sub: "We help businesses transform ideas into brands, products and digital experiences.",
      cta1: "Start a project",
      cta2: "View work",
      stats: [
        { v: "120+", l: "projects shipped" },
        { v: "6 capabilities", l: "strategy to product" },
        { v: "100%", l: "remote & async" },
      ],
      caps: {
        label: "Our capabilities",
        title: ["What we build,", "and how we think"],
        desc: "Every capability is grounded in the same belief: technology only matters when it serves a real purpose.",
      },
      method: {
        label: "Our method",
        title: ["Think deeply.", "Build intentionally."],
        desc: "A repeatable process that delivers fast without sacrificing depth.",
      },
      tools: {
        label: "Tools & support",
        title: ["Tools that", "accelerate ideas."],
        desc: "We leverage modern technologies and workflows to move quickly and continuously improve what we build.",
        metrics: [
          { label: "Websites & landing pages", value: "1–2 wks", note: "typical delivery" },
          { label: "Products & platforms", value: "4–8 wks", note: "from brief to launch" },
          { label: "Ongoing evolution", value: "Always", note: "never truly finished" },
        ],
      },
      faq: {
        label: "FAQ",
        title: ["Common", "questions"],
        link: "Something else on your mind? Let's talk.",
        items: [
          { q: "How long does a project take?", a: "It depends on scope and complexity. Most websites and landing pages are delivered in 1–2 weeks. Platforms and full products typically take 4–8 weeks. We always align on timelines before starting." },
          { q: "Can you help validate an idea before building?", a: "Yes — and we believe this is one of the most valuable things we can do. We help teams define, structure and test ideas before committing to a full build." },
          { q: "Do you offer ongoing support?", a: "We do. Many of our clients choose to work with us on an ongoing basis — evolving their product, improving what exists and building what comes next." },
          { q: "How do you choose which tools to use?", a: "We choose based on what's right for the project — not what's trendy. The goal is always a product that works well, scales appropriately and is easy to maintain." },
          { q: "Can you improve something that already exists?", a: "Absolutely. We often work with existing products to improve clarity, performance and user experience. Sometimes the best build is a rebuild done right." },
          { q: "Do you work with teams remotely?", a: "Yes — fully remote and designed for it. We work with clients across different time zones with clear communication, structured feedback and full transparency throughout." },
        ],
      },
      services: [
        {
          id: "websites", title: "Institutional Websites",
          description: "Websites built to communicate what your brand stands for — with clarity, intention and a lasting first impression.",
          items: ["Responsive design", "SEO structure", "Contact forms", "CMS integration", "Performance optimization"],
          idealFor: "Companies, consultants and service businesses.",
        },
        {
          id: "landing", title: "Landing Pages",
          description: "Pages designed to turn attention into action — structured around clear messaging, strong hierarchy and purposeful calls to action.",
          items: ["Copy structure", "Responsive layouts", "Conversion-focused sections", "Lead capture forms", "Analytics integration"],
          idealFor: "Marketing campaigns and digital products.",
        },
        {
          id: "saas", title: "SaaS Platforms",
          description: "Software platforms built to grow with your business — thoughtfully architected, carefully crafted and ready to scale.",
          items: ["Authentication", "Dashboards", "User management", "CRUD operations", "Search & file uploads", "Role permissions"],
          idealFor: "Startups and digital businesses.",
        },
        {
          id: "apps", title: "Applications",
          description: "Web applications and MVPs built to validate ideas, accelerate learning and create real value for real users.",
          items: ["User flows", "Responsive interfaces", "Product architecture", "Scalable foundations"],
          idealFor: "Founders and innovators.",
        },
        {
          id: "ecommerce", title: "E-commerce",
          description: "Online stores designed around the customer experience — where usability, trust and conversion work together.",
          items: ["Product catalog", "Shopping cart", "Checkout flow", "Customer area", "Product management"],
          idealFor: "Brands and retailers.",
        },
        {
          id: "dashboards", title: "Admin Dashboards",
          description: "Internal platforms that bring clarity to complexity — helping teams make better decisions with better information.",
          items: ["Metrics & KPIs", "Reports", "User management", "Search & filters", "Data visualization"],
          idealFor: "Teams and businesses.",
        },
      ],
    },
    contact: {
      badge: "Vaibes · Contact",
      h1: ["Let's build", "what matters."],
      sub: "Whether you have an idea, a new project or simply want to explore possibilities, we'd love to hear from you.",
      support: "Vaibes operates between Brazil and Portugal, collaborating remotely with clients and teams around the world.",
      intro: {
        label: "Start here",
        title: "Start with a conversation.",
        p1: "Every project starts differently.",
        p2: "Some begin with a sketch, others with a challenge, a business opportunity or simply an intuition that something can be improved.",
        p3: "Whatever stage you're in, we're happy to explore it together.",
      },
      form: {
        label: "Contact form",
        title: ["Tell us what you're", "building."],
        name: "Name",
        email: "Email",
        company: "Company or project",
        projectType: "Type of project",
        selectType: "Select a type",
        projectOptions: ["Institutional Website", "Landing Page", "SaaS Platform", "Application", "E-commerce", "Admin Dashboard", "Brand Identity", "Not sure yet"],
        budget: "Budget range",
        budgetOptions: ["Up to €2k", "€2k–€5k", "€5k–€10k", "€10k+"],
        message: "Message",
        placeholder: "Tell us about your project, idea or challenge...",
        btn: "Start a project",
        note: "Response within 24 hours · No commitment",
        successTitle: "Message received.",
        successText: "We'll be in touch within 24 hours. Looking forward to the conversation.",
      },
      availability: {
        status: "Status",
        title: "Currently accepting selected projects.",
        text: "We intentionally work with a limited number of clients to ensure focus, quality and meaningful collaboration.",
      },
      connect: {
        label: "Ways to connect",
        title: "Reach us wherever feels natural.",
        items: [
          { label: "Email", detail: "hello@vaibes.studio" },
          { label: "LinkedIn", detail: "linkedin.com/company/vaibes" },
          { label: "Instagram", detail: "@vaibes.studio" },
          { label: "WhatsApp", detail: "Quick message" },
          { label: "Schedule a meeting", detail: "Pick a time that works" },
        ],
      },
      locations: {
        label: "Our presence",
        title: ["Two points of contact,", "one studio."],
        desc: "Vaibes operates across two countries, combining strategic thinking, product experience and agile execution.",
        portugal: {
          country: "Portugal",
          role: "Product, Strategy & Experience",
          items: ["Discovery", "Brand Strategy", "Product Design", "UX & Service Design", "Client Experience"],
          city: "Porto, Portugal",
          tz: "GMT",
          resLabel: "Responsible for",
        },
        brazil: {
          country: "Brazil",
          role: "Project Operations & Delivery",
          items: ["Project Management", "Delivery Operations", "Planning", "Follow-up", "Client Support"],
          city: "Brazil",
          tz: "GMT −3",
          resLabel: "Responsible for",
        },
      },
      faq: {
        label: "FAQ",
        title: ["Common", "questions"],
        items: [
          { q: "How long does a project usually take?", a: "It depends on scope and type. Websites and landing pages are typically delivered in 1–2 weeks. Platforms, applications and more complex products take 4–8 weeks. We align on timelines before starting." },
          { q: "Do you work with clients outside Brazil and Portugal?", a: "Yes — fully remote and globally oriented. We work with teams across Europe, North America and beyond. Time zones are rarely a barrier when communication is structured well." },
          { q: "Can we start with a discovery session?", a: "Absolutely. For larger or more complex projects, we often recommend starting with a structured discovery session to define scope, priorities and alignment before committing to a full build." },
          { q: "Do you support existing products?", a: "Yes. Many of our engagements begin with auditing and improving what already exists — refining UX, rebuilding architecture or expanding features with intention." },
          { q: "Can projects be executed entirely remotely?", a: "All of them. We are built for remote collaboration — async-first, clear documentation, structured feedback cycles and full transparency throughout the process." },
        ],
      },
      finalCta: {
        eyebrow: "Let's get started",
        title: ["Build what", "matters."],
        body: "If you have something worth building, we'd love to hear about it.",
        btn: "Start a conversation",
        note: "Response within 24 hours · No commitment",
      },
      footerTagline: "Building what matters, from Brazil to Portugal.",
    },
  },
} as const;

// ─── Language context ─────────────────────────────────────────────────────────
type LangCtx = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<LangCtx>({ lang: "pt", setLang: () => {} });
function useLang() {
  const { lang, setLang } = useContext(LangContext);
  return { lang, setLang, t: T[lang] };
}

// ─── Static icon arrays ───────────────────────────────────────────────────────
const PROCESS_ICONS = [Brain, Layers, Zap, Gauge, Rocket];
const SERVICE_ICONS = [Globe, FileText, Rocket, Smartphone, ShoppingBag, LayoutDashboard];
const SERVICE_LARGE = [true, false, false, true, false, false];

// ─── Shared data ──────────────────────────────────────────────────────────────
const TECHNOLOGIES = [
  "Framer", "Claude Code", "Lovable", "Mocha",
  "Supabase", "OpenAI", "n8n", "Figma", "Stripe", "Vercel",
];

type Category = "All" | "Landing Pages" | "Institutional Websites" | "E-commerce" | "Admin Dashboards" | "SaaS" | "Apps" | "MVPs";
const CATEGORIES: Category[] = ["All", "Institutional Websites", "E-commerce"];

interface Project {
  id: string; name: string; tagline: string;
  category: Exclude<Category, "All">; year: number; description: string;
  imageId: string; heroId: string; goal: string; clientSegment: string; challenge: string;
  deliverables: { section: string; items: string[] }[];
  technologies: string[];
  results: { label: string; value: string; note?: string }[];
  galleryIds: string[]; featured?: boolean; thumbScale?: number;
}

const PROJECTS: Project[] = [
  {
    id: "amplafica", name: "Amplafica", tagline: "Arquitetura infantil — site institucional",
    category: "Institutional Websites", year: 2026,
    description: "Site institucional para a Amplafica, estúdio de arquitetura infantil. Uma presença digital lúdica e clara — do hero ao portfólio em modal — feita para transformar visita ao site em visita ao espaço.",
    imageId: "/work/amplafica/thumb-amplafica-vaibes.png", heroId: "/work/amplafica/1.png",
    goal: "Dar à Amplafica um site à altura da marca: comunicar a filosofia de espaços onde a infância floresce e converter pais exigentes em agendamentos.",
    clientSegment: "Estúdio de arquitetura e interiores para espaços infantis.",
    challenge: "Traduzir uma prática presencial, sensorial e afetiva numa experiência digital que transmita o mesmo cuidado — sem parecer um portfólio genérico de arquitetura.",
    deliverables: [{ section: "Website Institucional", items: ["Hero e navegação", "Sobre e método", "Portfólio com modal de projeto", "Depoimentos", "Formulário de contato", "Identidade azul e amarelo", "Layout responsivo"] }],
    technologies: ["Figma", "React", "Tailwind CSS"],
    results: [
      { label: "Tipo", value: "Institucional", note: "presença de marca" },
      { label: "Portfólio", value: "Modal", note: "casos em detalhe" },
      { label: "Seções", value: "8", note: "hero ao contato" },
      { label: "CTA", value: "Visita", note: "agendamento no site" },
    ],
    galleryIds: ["/work/amplafica/1.png", "/work/amplafica/montanhas.png", "/work/amplafica/colorido.png"],
    featured: true,
  },
  {
    id: "bellarosa", name: "Rodolfo Bellarosa Jr.", tagline: "Portfólio de ator — site institucional",
    category: "Institutional Websites", year: 2026,
    description: "Site institucional e portfólio para o ator Rodolfo Bellarosa Jr. Uma presença digital cinematográfica — do hero ao VideoBook, trabalhos e contato — feita para casting, direção e quem precisa encontrar o ator com clareza.",
    imageId: "/work/bellarosa/mockup-portfolio-rodolfo-vaibes.png", heroId: "/work/bellarosa/1.png",
    goal: "Dar ao ator um site à altura da carreira: apresentar trajetória, reel e trabalhos numa experiência dark editorial que converta visita em contato.",
    clientSegment: "Ator, diretor e preparador corporal.",
    challenge: "Traduzir uma presença de palco e câmera — dramática, sensorial — numa experiência digital com o mesmo peso, sem parecer um portfólio genérico de ator.",
    deliverables: [{ section: "Website Institucional", items: ["Hero cinematográfico", "Sobre com retrato e números", "VideoBook em destaque", "Trabalhos selecionados", "Galeria de momentos", "Visão e processo", "Formulário de contato", "Identidade dark e dourado", "Layout responsivo"] }],
    technologies: ["Figma", "React", "Tailwind CSS"],
    results: [
      { label: "Tipo", value: "Portfólio", note: "presença do ator" },
      { label: "VideoBook", value: "Embed", note: "reel em destaque" },
      { label: "Seções", value: "8", note: "hero ao contato" },
      { label: "CTA", value: "Contato", note: "form + WhatsApp" },
    ],
    galleryIds: ["/work/bellarosa/1.png"],
  },
  {
    id: "brecholimeira", name: "Brechó Limeira", tagline: "E-commerce de móveis usados — WhatsApp integrado",
    category: "E-commerce", year: 2026,
    description: "E-commerce para o Brechó Limeira, marketplace de móveis usados em Limeira e região. Catálogo, busca, anúncio e contato — o atendimento fecha no WhatsApp, não num checkout genérico.",
    imageId: "/work/brecholimeira/thumb-brecho-limeira-vaibes.png", heroId: "/work/brecholimeira/1.png",
    goal: "Dar ao brechó um canal de venda digital: compradores garimpam peças únicas, quem tem móvel parado anuncia, e a conversa termina no WhatsApp.",
    clientSegment: "Comércio de móveis usados em Limeira e região.",
    challenge: "Vender peças únicas, sem estoque padronizado, sem forçar um checkout de e-commerce tradicional — o fechamento é humano, local e por conversa.",
    deliverables: [{ section: "E-commerce", items: ["Hero e navegação", "Catálogo com filtros", "Busca inteligente", "Categorias", "Anúncio de peças", "WhatsApp integrado", "Formulário via WhatsApp", "FAQ", "Painel admin de produtos", "Layout responsivo"] }],
    technologies: ["Figma", "React", "Tailwind CSS", "WhatsApp"],
    results: [
      { label: "Tipo", value: "Marketplace", note: "compra e venda local" },
      { label: "Atendimento", value: "WhatsApp", note: "conversa no fechamento" },
      { label: "Catálogo", value: "Filtros", note: "categoria, preço, cidade" },
      { label: "Gestão", value: "Admin", note: "painel de produtos" },
    ],
    galleryIds: [
      "/work/brecholimeira/1.png",
      "/work/brecholimeira/2.png",
      "/work/brecholimeira/3.png",
      "/work/brecholimeira/4.png",
      "/work/brecholimeira/5.png",
      "/work/brecholimeira/6.png",
      "/work/brecholimeira/7.png",
      "/work/brecholimeira/8.png",
    ],
  },
];

// ─── Shared: Label ────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="ed-meta uppercase tracking-[0.18em] text-[11px] mb-4">
      {children}
    </p>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center border border-[#353535]" style={{ fontFamily: F.mono }}>
      {(["pt", "en"] as Lang[]).map((l, i) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="uppercase tracking-wider transition-colors duration-200"
          style={{
            fontFamily: F.mono,
            fontSize: "9.8px",
            fontWeight: 400,
            lineHeight: 1,
            padding: "2.8px 7px",
            background: lang === l ? P : "transparent",
            color: lang === l ? "#000" : MUTED,
            borderRight: i === 0 ? `1px solid ${GRID}` : undefined,
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function CTASection({ onStart, tone = "dark" }: { onStart: () => void; tone?: "dark" | "pink" }) {
  const { t } = useLang();
  return (
    <section id="cta" className={`ed-band ed-band--${tone} py-16 md:py-24 px-2 md:px-4`}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-8">
          <p className="ed-meta uppercase tracking-[0.18em] text-[11px] mb-6">{t.cta.eyebrow}</p>
          <h2 className="ed-heading mb-6" style={{ fontSize: "clamp(2.8rem,6vw,5.5rem)" }}>
            {t.cta.title[0]}<br /><span className="opacity-40">{t.cta.title[1]}</span>
          </h2>
          <p className="text-[14px] leading-[1.5] max-w-xl opacity-70">{t.cta.body}</p>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-3">
          <button onClick={onStart} className="ed-btn w-full">
            {t.cta.btn1} <ArrowRight size={14} />
          </button>
          <button className="ed-btn-ghost w-full">
            {t.cta.btn2} <ArrowUpRight size={14} />
          </button>
          <p className="ed-meta text-center mt-1">{t.cta.note}</p>
        </div>
      </div>
    </section>
  );
}

function Footer({ onNav, tone = "dark" }: { onNav: (v: View) => void; tone?: "dark" | "pink" }) {
  const { t } = useLang();
  const invert = tone === "pink";
  return (
    <footer className={`ed-band ed-band--${tone} px-2 md:px-4 py-12 border-t`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <button onClick={() => onNav({ page: "home" })} className="text-left">
          <VaibesLogo height={26.4} invert={invert} />
          <p className="ed-meta text-xs mt-0.5">{t.footer.tagline}</p>
        </button>
        <div className="flex flex-wrap gap-6">
          {[
            { label: t.nav.portfolio, page: "portfolio" },
            { label: t.nav.services, page: "services" },
            { label: t.nav.contact, page: "contact" },
          ].map((l) => (
            <button key={l.page} onClick={() => onNav({ page: l.page as Page })} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
              {l.label}
            </button>
          ))}
        </div>
        <p className="ed-meta text-xs">© 2026 Vaibes. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ currentPage, onNav }: { currentPage: string; onNav: (v: View) => void }) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  const navLinks = [
    { label: t.nav.portfolio, page: "portfolio" as Page },
    { label: t.nav.services, page: "services" as Page },
    { label: t.nav.contact, page: "contact" as Page },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#353535]" style={{ height: "var(--header-height)", fontFamily: F.body }}>
      <div className="h-full px-2 md:px-4 flex items-center justify-between">
        <button onClick={() => { onNav({ page: "home" }); setOpen(false); }} className="flex items-center" aria-label="Home">
          <VaibesLogo height={26.4} />
        </button>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => {
            const isActive = currentPage === l.page;
            return (
              <button
                key={l.page}
                onClick={() => onNav({ page: l.page })}
                className="text-[13px] uppercase tracking-wide transition-opacity duration-200"
                style={{ color: isActive ? INK : MUTED, textDecoration: isActive ? "underline" : "none", textUnderlineOffset: 6 }}
              >
                {l.label}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <LangToggle />
          <button className="md:hidden p-1.5 text-[#F5F5F7]" onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-[#353535] px-2 py-4 flex flex-col"
          >
            {navLinks.map((l) => (
              <button key={l.page} onClick={() => { onNav({ page: l.page }); setOpen(false); }}
                className="text-left px-2 py-3 text-[13px] uppercase tracking-wide"
                style={{ color: currentPage === l.page ? INK : MUTED }}
              >
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Portfolio: Gallery ───────────────────────────────────────────────────────
function MediaLightbox({
  src,
  alt,
  onClose,
  onPrev,
  onNext,
  indexLabel,
}: {
  src: string;
  alt: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  indexLabel?: string;
}) {
  return (
    <motion.div
      key="lb"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] bg-black/92 overflow-y-auto"
      onClick={onClose}
    >
      <button type="button" className="fixed top-5 right-5 z-[101] text-white/70 hover:text-white bg-white/10 rounded-full p-2" onClick={onClose}><X size={20} /></button>
      {onPrev && (
        <button type="button" className="fixed left-5 top-1/2 -translate-y-1/2 z-[101] text-white/70 hover:text-white bg-white/10 rounded-full p-2" onClick={(e) => { e.stopPropagation(); onPrev(); }}><ChevronLeft size={22} /></button>
      )}
      {onNext && (
        <button type="button" className="fixed right-5 top-1/2 -translate-y-1/2 z-[101] text-white/70 hover:text-white bg-white/10 rounded-full p-2" onClick={(e) => { e.stopPropagation(); onNext(); }}><ChevronRight size={22} /></button>
      )}
      <div className="min-h-full w-full flex flex-col items-center px-4 py-16 md:px-16">
        <motion.img
          key={src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          src={mediaSrc(src)}
          alt={alt}
          className="block w-full max-w-5xl h-auto object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      {indexLabel && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[101] text-white/40 text-xs" style={{ fontFamily: F.mono }}>{indexLabel}</div>
      )}
    </motion.div>
  );
}

function Gallery({ ids }: { ids: string[] }) {
  const [lb, setLb] = useState<number | null>(null);
  const { t } = useLang();
  const prev = useCallback(() => lb !== null && setLb((lb - 1 + ids.length) % ids.length), [lb, ids.length]);
  const next = useCallback(() => lb !== null && setLb((lb + 1) % ids.length), [lb, ids.length]);
  const hasNav = ids.length > 1;
  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
        {ids.map((id, i) => (
          <button key={id} type="button" onClick={() => setLb(i)} className="relative shrink-0 overflow-hidden rounded-xl group" style={{ width: "calc(60vw - 3rem)", maxWidth: 520 }}>
            <img src={mediaSrc(id)} alt={`${t.project.screen} ${i + 1}`} className={`w-full h-72 object-cover ${mediaObjectClass(id)} bg-[#111] transition-transform duration-500 group-hover:scale-105`} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#F4F4F6] backdrop-blur-sm rounded-full p-2.5"><ArrowUpRight size={16} /></div>
            </div>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {lb !== null && (
          <MediaLightbox
            src={ids[lb]}
            alt={`${t.project.screen} ${lb + 1}`}
            onClose={() => setLb(null)}
            onPrev={hasNav ? prev : undefined}
            onNext={hasNav ? next : undefined}
            indexLabel={`${lb + 1} / ${ids.length}`}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Portfolio: Project Card ──────────────────────────────────────────────────
function ProjectCard({ project, onClick, className = "" }: { project: Project; onClick: () => void; className?: string }) {
  const { t } = useLang();
  return (
    <motion.article variants={fadeUp} className={`group cursor-pointer ${className}`} onClick={onClick}>
      <div className="relative overflow-hidden rounded-none bg-[#111]" style={{ aspectRatio: project.featured ? "16/9" : "4/3" }}>
        <img src={mediaSrc(project.imageId, 1400, project.featured ? 790 : 900)} alt={project.name} className={`w-full h-full object-cover ${mediaObjectClass(project.imageId)} origin-center transition-transform duration-500 ease-out group-hover:scale-[1.05]`} style={mediaThumbStyle(project.thumbScale)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 bg-[#F4F4F6] text-black text-xs px-3 py-1.5" style={{ fontFamily: F.mono }}>
            {t.categories[project.category]}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-2 bg-[#F4F4F6] text-black px-5 py-2.5 rounded-full text-sm font-normal ">
            {t.portfolio.viewCase} <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between mt-4 px-0.5">
        <div>
          <h3 className="text-xl font-normal text-[#F5F5F7] group-hover:text-[#F5F5F7] transition-colors leading-tight" style={{ fontFamily: F.display }}>{project.name}</h3>
          <p className="text-sm text-[#6B7280] mt-0.5">{project.tagline}</p>
        </div>
        <span className="text-xs text-[#6B7280] shrink-0 mt-1 tabular-nums" style={{ fontFamily: F.mono }}>{project.year}</span>
      </div>
    </motion.article>
  );
}

// ─── Portfolio: Project Detail ────────────────────────────────────────────────
function ProjectDetail({ project, prev, next, onBack, onNavigate }: {
  project: Project; prev: Project | null; next: Project | null;
  onBack: () => void; onNavigate: (id: string) => void;
}) {
  const { t } = useLang();
  const pd = t.project;
  const [heroOpen, setHeroOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <section className="ed-band ed-band--dark pt-[calc(var(--header-height)+2rem)] pb-16 px-2 md:px-4">
        <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#F5F5F7] transition-colors mb-12">
          <ArrowLeft size={14} /> {pd.back}
        </button>
        <div className="grid lg:grid-cols-12 gap-12 items-end mb-16">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-normal px-3 py-1.5 rounded-full mb-6" style={{ fontFamily: F.mono, color: DARK, backgroundColor: P }}>
              {t.categories[project.category]}
            </span>
            <h1 className="text-[#F5F5F7] font-normal mb-6" style={{ fontFamily: F.display, fontSize: "clamp(2.8rem,7vw,5.5rem)", lineHeight: "0.94" }}>
              {project.name}
            </h1>
            <p className="text-xl text-[#6B7280] leading-relaxed max-w-xl">{project.description}</p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {[{ l: pd.year, v: project.year }, { l: pd.tools, v: `${project.technologies.length} ${pd.toolsCount}` }].map((s) => (
              <div key={s.l} className="bg-black border border-[#353535] rounded-none px-5 py-4">
                <p className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-1" style={{ fontFamily: F.mono }}>{s.l}</p>
                <p className="text-lg font-normal text-[#F5F5F7]" style={{ fontFamily: F.display }}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setHeroOpen(true)}
          className="w-full overflow-hidden rounded-none bg-[#111] text-left"
          style={{ aspectRatio: "16/9" }}
          aria-label={pd.openImage}
        >
          <img src={mediaSrc(project.heroId)} alt={`${project.name} hero`} className={`w-full h-full object-cover ${mediaObjectClass(project.heroId)}`} />
        </button>
        </div>
      </section>
      <AnimatePresence>
        {heroOpen && (
          <MediaLightbox src={project.heroId} alt={project.name} onClose={() => setHeroOpen(false)} />
        )}
      </AnimatePresence>

      {[
        {
          label: pd.goalLabel, title: pd.goalTitle,
          content: (
            <div className="lg:col-span-8 space-y-4">
              <p className="text-lg text-[#6B7280] leading-relaxed">{project.goal}</p>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                {[{ l: pd.clientSegment, v: project.clientSegment }, { l: pd.challenge, v: project.challenge }].map((c) => (
                  <div key={c.l} className="bg-black border border-[#353535] rounded-none p-5">
                    <p className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-2" style={{ fontFamily: F.mono }}>{c.l}</p>
                    <p className="text-sm text-[#F5F5F7] leading-relaxed">{c.v}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      ].map((s) => (
        <section key={s.label} className="ed-band ed-band--dark py-20 px-2 md:px-4 border-t">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <Label>{s.label}</Label>
              <h2 className="text-3xl font-normal text-[#F5F5F7] leading-tight" style={{ fontFamily: F.display }}>{s.title}</h2>
            </div>
            {s.content}
          </div>
        </section>
      ))}

      <section className="ed-band ed-band--dark py-20 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4"><Label>{pd.scopeLabel}</Label><h2 className="text-3xl font-normal text-[#F5F5F7] leading-tight" style={{ fontFamily: F.display }}>{pd.scopeTitle}</h2></div>
          <div className="lg:col-span-8">
            {project.deliverables.map((d) => (
              <div key={d.section} className="mb-6">
                <p className="text-xs font-normal mb-4 inline-flex items-center px-2 py-0.5 rounded" style={{ fontFamily: F.mono, backgroundColor: P, color: DARK }}>{d.section}</p>
                <div className="flex flex-wrap gap-2">
                  {d.items.map((item) => <span key={item} className="bg-black border border-[#353535] text-[#F5F5F7] text-sm px-4 py-2 rounded-xl font-normal">{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ed-band ed-band--dark py-20 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto">
        <Label>{pd.galleryLabel}</Label>
        <h2 className="text-3xl font-normal text-[#F5F5F7] mb-10" style={{ fontFamily: F.display }}>{pd.galleryTitle}</h2>
        <Gallery ids={project.galleryIds} />
        </div>
      </section>

      <section className="ed-band ed-band--dark py-20 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4"><Label>{pd.techLabel}</Label><h2 className="text-3xl font-normal text-[#F5F5F7] leading-tight" style={{ fontFamily: F.display }}>{pd.techTitle}</h2></div>
          <div className="lg:col-span-8 flex flex-wrap gap-3 items-center">
            {project.technologies.map((tech) => <span key={tech} className="inline-flex items-center bg-black border border-[#353535] text-[#F5F5F7] px-5 py-2.5 rounded-full text-sm font-normal hover:border-[#F5F5F7] hover:text-[#F5F5F7] transition-colors">{tech}</span>)}
          </div>
        </div>
      </section>

      <section className="ed-band ed-band--dark py-20 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto">
        <Label>{pd.resultsLabel}</Label>
        <h2 className="text-3xl font-normal text-[#F5F5F7] mb-10" style={{ fontFamily: F.display }}>{pd.resultsTitle}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {project.results.map((r, i) => (
            <div key={i} className="bg-black border border-[#353535] rounded-none p-6 hover:border-[#F5F5F7]/40  transition-all">
              <p className="font-normal text-[#F5F5F7] leading-none mb-2" style={{ fontFamily: F.display, fontSize: "clamp(2rem,5vw,3rem)" }}>{r.value}</p>
              <p className="text-sm font-normal text-[#F5F5F7] mb-1">{r.label}</p>
              {r.note && <p className="text-xs text-[#6B7280]" style={{ fontFamily: F.mono }}>{r.note}</p>}
            </div>
          ))}
        </div>
        </div>
      </section>

      <section className="ed-band ed-band--dark py-16 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4">
          {prev ? (
            <button onClick={() => onNavigate(prev.id)} className="group flex flex-col gap-2 bg-black border border-[#353535] rounded-none p-6 hover:border-[#F5F5F7]/40 transition-all text-left">
              <span className="text-[10px] uppercase tracking-widest text-[#6B7280]" style={{ fontFamily: F.mono }}>← {pd.previous}</span>
              <span className="text-lg font-normal text-[#F5F5F7] group-hover:text-[#F5F5F7] transition-colors" style={{ fontFamily: F.display }}>{prev.name}</span>
              <span className="text-xs text-[#6B7280]">{t.categories[prev.category]}</span>
            </button>
          ) : <div />}
          {next ? (
            <button onClick={() => onNavigate(next.id)} className="group flex flex-col gap-2 bg-black border border-[#353535] rounded-none p-6 hover:border-[#F5F5F7]/40 transition-all text-right ml-auto w-full">
              <span className="text-[10px] uppercase tracking-widest text-[#6B7280]" style={{ fontFamily: F.mono }}>{pd.next} →</span>
              <span className="text-lg font-normal text-[#F5F5F7] group-hover:text-[#F5F5F7] transition-colors" style={{ fontFamily: F.display }}>{next.name}</span>
              <span className="text-xs text-[#6B7280]">{t.categories[next.category]}</span>
            </button>
          ) : <div />}
        </div>
      </section>
    </div>
  );
}

// ─── Page: Home ───────────────────────────────────────────────────────────────
function HomePage({ onNav, onGoToForm }: { onNav: (v: View) => void; onGoToForm: () => void }) {
  const { t } = useLang();
  const h = t.home;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="ed-band ed-band--dark relative pt-[calc(var(--header-height)+2rem)] pb-16 px-2 md:px-4 border-b">
        <div className="max-w-none">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="py-8 md:py-12">
            <motion.p variants={fadeUp} className="ed-meta mb-8 uppercase tracking-[0.18em] text-[11px]">{h.hero.badge}</motion.p>
            <motion.h1 variants={fadeUp} className="ed-heading text-[#F5F5F7] mb-10" style={{ fontSize: "clamp(2.8rem,8vw,5.96rem)" }}>
              {h.caps.items.map((cap, i) => (
                <span key={cap.num}>
                  <sup className="ed-meta align-super text-[0.28em] tracking-normal mr-1">{String(i + 1).padStart(2, "0")}</sup>
                  {cap.title}
                  {i < h.caps.items.length - 1 ? <span className="text-[#6B7280]"> — </span> : null}
                  {i === 1 || i === 3 ? <br /> : null}
                </span>
              ))}
            </motion.h1>
            <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-6 border-t border-[#353535] pt-6">
              <p className="text-[14px] text-[#6B7280] max-w-xl leading-[1.5]">{h.hero.sub}</p>
              <button onClick={() => onNav({ page: "portfolio" })} className="ed-btn-ghost">{h.hero.cta2} <ArrowUpRight size={14} /></button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured work */}
      <HorizontalWorkGallery
        projects={PROJECTS.map((p) => ({ ...p, category: t.categories[p.category] }))}
        label={h.work.label}
        title={h.work.title}
        viewAllLabel={h.work.btnMore}
        viewAllCta={h.work.btnAll.replace("projetos", `${PROJECTS.length} projetos`).replace("projects", `${PROJECTS.length} projects`)}
        viewCaseLabel={t.portfolio.viewCase}
        onOpenProject={(id) => onNav({ page: "project", id })}
        onViewAll={() => onNav({ page: "portfolio" })}
      />

      {/* Capabilities */}
      <section className="ed-band ed-band--dark py-20 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-12 flex-wrap gap-6">
              <div>
                <Label>{h.caps.label}</Label>
                <h2 style={{ fontFamily: F.display, fontSize: "clamp(2rem,4.5vw,3.5rem)", fontWeight: 400, lineHeight: "0.96" }}>
                  {h.caps.title[0]}<br /><span className="text-[#6B7280]">{h.caps.title[1]}</span>
                </h2>
              </div>
              <button onClick={() => onNav({ page: "services" })} className="inline-flex items-center gap-2 text-sm font-normal text-[#6B7280] hover:text-[#F5F5F7] transition-colors">
                {h.caps.btn} <ArrowRight size={14} />
              </button>
            </motion.div>
            <motion.div variants={fadeUp}>
              <CapabilitiesPreview items={h.caps.items} onSelect={() => onNav({ page: "services" })} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tools */}
      <section className="ed-band ed-band--dark py-20 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}>
            <motion.div variants={fadeUp} className="grid lg:grid-cols-12 gap-10 mb-12">
              <div className="lg:col-span-5">
                <Label>{h.tools.label}</Label>
                <h2 style={{ fontFamily: F.display, fontSize: "clamp(2rem,4.5vw,3.5rem)", fontWeight: 400, lineHeight: "0.96" }}>
                  {h.tools.title[0]}<br /><span className="text-[#6B7280]">{h.tools.title[1]}</span>
                </h2>
              </div>
              <div className="lg:col-span-7 flex items-end">
                <p className="text-base text-[#6B7280] leading-relaxed max-w-lg">
                  {h.tools.desc}
                </p>
              </div>
            </motion.div>
            <motion.div variants={stagger} className="flex flex-wrap gap-2">
              {TECHNOLOGIES.map((tech) => (
                <motion.span key={tech} variants={fadeUp} className="inline-flex items-center bg-black border border-[#353535] text-[#F5F5F7] px-4 py-2 rounded-full text-sm font-normal hover:border-[#F5F5F7] hover:text-[#F5F5F7] transition-all cursor-default">
                  {tech}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <CTASection onStart={onGoToForm} tone="dark" />
      <Footer onNav={onNav} tone="dark" />
    </div>
  );
}

// ─── Page: Portfolio ──────────────────────────────────────────────────────────
function PortfolioPage({ onNav, onGoToForm }: { onNav: (v: View) => void; onGoToForm: () => void }) {
  const [filter, setFilter] = useState<Category>("All");
  const { t } = useLang();
  const pt = t.portfolio;
  const heroProject = PROJECTS[0];
  const filtered = (filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter))
    .filter((p) => p.id !== heroProject.id);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="ed-band ed-band--dark pt-[calc(var(--header-height)+2rem)] pb-16 px-2 md:px-4">
        <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
            <span className="text-[10px] uppercase tracking-widest text-[#6B7280]" style={{ fontFamily: F.mono }}>{pt.badge}</span>
            <div className="h-px bg-black/10 w-16" />
          </motion.div>
          <motion.h1 variants={fadeUp} style={{ fontFamily: F.display, fontSize: "clamp(3.5rem,9vw,8rem)", lineHeight: "0.92", fontWeight: 400 }} className="mb-8">
            {pt.h1[0]}<br /><span className="text-[#F5F5F7]/25">{pt.h1[1]}</span>
          </motion.h1>
          <motion.div variants={fadeUp} className="grid lg:grid-cols-2 gap-8 mb-16">
            <p className="text-lg text-[#6B7280] leading-relaxed max-w-lg">
              {pt.sub}
            </p>
            <div className="flex items-end justify-start lg:justify-end">
              <div className="flex gap-6">
                {pt.stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-3xl font-normal text-[#F5F5F7]" style={{ fontFamily: F.display }}>{s.v ?? `${PROJECTS.length}+`}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5" style={{ fontFamily: F.mono }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Featured hero card */}
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-none cursor-pointer group" style={{ aspectRatio: "16/8" }} onClick={() => onNav({ page: "project", id: PROJECTS[0].id })}>
            <img src={mediaSrc(PROJECTS[0].imageId, 2000, 1000)} alt={PROJECTS[0].name} className={`w-full h-full object-cover ${mediaObjectClass(PROJECTS[0].imageId)} origin-center transition-transform duration-700 ease-out group-hover:scale-[1.05]`} style={mediaThumbStyle(PROJECTS[0].thumbScale)} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-normal text-white/70 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full mb-3" style={{ fontFamily: F.mono }}>
                  {t.categories[PROJECTS[0].category]}
                </span>
                <h2 className="text-3xl lg:text-5xl font-normal text-white leading-tight" style={{ fontFamily: F.display }}>{PROJECTS[0].name}</h2>
                <p className="text-white/60 mt-1">{PROJECTS[0].tagline}</p>
              </div>
              <div className="flex items-center gap-2 bg-[#F4F4F6] text-black px-5 py-2.5 rounded-full text-sm font-normal opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0 ml-6">
                {pt.viewCase} <ArrowUpRight size={14} />
              </div>
            </div>
          </motion.div>
        </motion.div>
        </div>
      </section>

      <div className="ed-band ed-band--dark">
      {/* Filter */}
      <div className="sticky top-[66px] z-30 px-2 md:px-4 py-3 border-b" style={{ background: "var(--band-bg)", borderColor: "var(--band-grid)" }}>
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`ed-tag shrink-0 ${filter === cat ? "is-active" : ""}`}>
              {t.categories[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="py-16 px-2 md:px-4">
        <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={filter} initial="hidden" animate="visible" variants={stagger} className="grid md:grid-cols-2 gap-8">
            {filtered.length === 0
              ? <motion.p variants={fadeUp} className="md:col-span-2 text-center py-24 text-[#6B7280] text-sm" style={{ fontFamily: F.mono }}>{pt.empty}</motion.p>
              : filtered.map((p) => <ProjectCard key={p.id} project={p} onClick={() => onNav({ page: "project", id: p.id })} className={p.featured ? "md:col-span-2" : ""} />)
            }
          </motion.div>
        </AnimatePresence>
        </div>
      </section>
      </div>

      <CTASection onStart={onGoToForm} tone="dark" />
      <Footer onNav={onNav} tone="dark" />
    </div>
  );
}

// ─── Page: Services ───────────────────────────────────────────────────────────
function ServicesPage({ onNav, onGoToForm }: { onNav: (v: View) => void; onGoToForm: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { t } = useLang();
  const sv = t.services;
  const processSteps = t.process;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="ed-band ed-band--dark relative pt-[calc(var(--header-height)+2rem)] pb-24 px-2 md:px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#353535] text-[#6B7280]" style={{ fontFamily: F.mono }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P }} /> {sv.badge}
                </span>
              </motion.div>
              <motion.h1 variants={fadeUp} style={{ fontFamily: F.display, fontSize: "clamp(3rem,8.5vw,7.5rem)", lineHeight: "0.91", fontWeight: 400 }}>
                {sv.h1[0]}<br /><span className="text-[#F5F5F7]/25">{sv.h1[1]}</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-[#6B7280] max-w-2xl leading-relaxed mt-8 mb-10">
                {sv.sub}
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <button className="ed-btn"
                  onClick={onGoToForm}>
                  {sv.cta1} <ArrowRight size={14} />
                </button>
                <button onClick={() => onNav({ page: "portfolio" })} className="inline-flex items-center gap-2 text-[#F5F5F7] bg-black border border-[#353535] px-6 py-3.5 rounded-xl text-sm font-normal hover:border-[#F5F5F7]  transition-all">
                  {sv.cta2} <ArrowUpRight size={14} />
                </button>
              </motion.div>
            </div>
            <motion.div variants={fadeUp} className="lg:col-span-4 flex flex-col gap-3">
              {sv.stats.map((s) => (
                <div key={s.l} className="bg-black border border-[#353535] rounded-none px-5 py-4 ">
                  <p className="text-2xl font-normal text-[#F5F5F7]" style={{ fontFamily: F.display }}>{s.v}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5" style={{ fontFamily: F.mono }}>{s.l}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none" style={{ background: `radial-gradient(circle at 70% 30%, ${P}0d, transparent 65%)` }} />
      </section>

      {/* Services grid */}
      <section id="services" className="ed-band ed-band--dark py-24 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger} className="mb-14">
            <motion.div variants={fadeUp}><Label>{sv.caps.label}</Label></motion.div>
            <motion.div variants={fadeUp} className="flex items-end justify-between gap-8 flex-wrap">
              <h2 style={{ fontFamily: F.display, fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 400, lineHeight: "0.96" }}>
                {sv.caps.title[0]}<br /><span className="text-[#6B7280]">{sv.caps.title[1]}</span>
              </h2>
              <p className="text-sm text-[#6B7280] max-w-xs">{sv.caps.desc}</p>
            </motion.div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sv.services.map((svc, i) => {
              const Icon = SERVICE_ICONS[i];
              const isLarge = SERVICE_LARGE[i];
              return (
                <motion.div key={svc.id} variants={fadeUp} className={`relative bg-black border border-[#353535] p-8 flex flex-col gap-6 group ${isLarge ? "lg:col-span-2" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 border border-[#353535] flex items-center justify-center text-[#F5F5F7] group-hover:bg-[#F4F4F6] group-hover:text-black transition-colors duration-200"><Icon size={20} /></div>
                    <span className="text-[10px] text-[#6B7280] tabular-nums" style={{ fontFamily: F.mono }}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className={isLarge ? "grid md:grid-cols-2 gap-8 items-start" : "flex flex-col gap-4"}>
                    <div>
                      <h3 className="text-2xl font-normal text-[#F5F5F7] mb-3 leading-tight" style={{ fontFamily: F.display }}>{svc.title}</h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed">{svc.description}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-3" style={{ fontFamily: F.mono }}>Deliverables</p>
                      <ul className="flex flex-col gap-2">
                        {svc.items.map((item) => (
                          <li key={item} className="flex items-center gap-2.5 text-sm text-[#F5F5F7]">
                            <Check size={13} className="shrink-0" style={{ color: DARK }} />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#353535] pt-5 mt-auto">
                    <p className="text-xs text-[#6B7280]" style={{ fontFamily: F.mono }}>Ideal for: {svc.idealFor}</p>
                    <ArrowUpRight size={16} className="text-[#F5F5F7]/25 group-hover:text-[#F5F5F7] transition-colors" />
                  </div>
                  <div className="absolute inset-0 pointer-events-none rounded-none transition-opacity duration-300 opacity-0 group-hover:opacity-100" style={{ background: `radial-gradient(circle at top left, ${P}08, transparent 60%)` }} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="ed-band ed-band--dark py-24 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger} className="mb-14">
            <motion.div variants={fadeUp}><Label>{sv.method.label}</Label></motion.div>
            <motion.div variants={fadeUp} className="flex items-end justify-between flex-wrap gap-8">
              <h2 style={{ fontFamily: F.display, fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 400, lineHeight: "0.96" }}>
                {sv.method.title[0]}<br /><span className="text-[#6B7280]">{sv.method.title[1]}</span>
              </h2>
              <p className="text-sm text-[#6B7280] max-w-xs">{sv.method.desc}</p>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="flex gap-0 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
              {processSteps.map((step, i) => {
                const Icon = PROCESS_ICONS[i];
                return (
                  <div key={step.num} className="flex items-start gap-0 shrink-0">
                    <div className="w-52 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded" style={{ fontFamily: F.mono, backgroundColor: P, color: DARK }}>{step.num}</span>
                        <div className="flex-1 h-px bg-black/10" />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: P, color: DARK }}><Icon size={15} /></div>
                        <h4 className="text-base font-normal text-[#F5F5F7]" style={{ fontFamily: F.display }}>{step.title}</h4>
                      </div>
                      <p className="text-sm text-[#6B7280] leading-relaxed">{step.desc}</p>
                    </div>
                    {i < processSteps.length - 1 && (
                      <div className="w-10 shrink-0 flex items-start mt-7 justify-center"><MoveRight size={14} className="text-[#F5F5F7]/25" /></div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease, delay: 0.3 }} className="mt-10 h-px origin-left" style={{ background: `linear-gradient(to right, ${P}, ${P}33, transparent)` }} />
        </div>
      </section>

      {/* Technologies */}
      <section className="ed-band ed-band--dark py-24 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}>
            <motion.div variants={fadeUp}><Label>{sv.tools.label}</Label></motion.div>
            <motion.div variants={fadeUp} className="grid lg:grid-cols-12 gap-12 mb-14">
              <div className="lg:col-span-5">
                <h2 style={{ fontFamily: F.display, fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 400, lineHeight: "0.96" }}>
                  {sv.tools.title[0]}<br /><span className="text-[#6B7280]">{sv.tools.title[1]}</span>
                </h2>
              </div>
              <div className="lg:col-span-7 flex items-center">
                <p className="text-base text-[#6B7280] leading-relaxed max-w-xl">
                  {sv.tools.desc}
                </p>
              </div>
            </motion.div>
            <motion.div variants={stagger} className="flex flex-wrap gap-3 mb-12">
              {TECHNOLOGIES.map((tech) => (
                <motion.span key={tech} variants={fadeUp} className="inline-flex items-center bg-black border border-[#353535] text-[#F5F5F7] px-5 py-2.5 rounded-full text-sm font-normal cursor-default transition-all hover:border-[#F5F5F7] hover:text-[#F5F5F7]">{tech}</motion.span>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} className="bg-black border border-[#353535] rounded-none p-8 grid md:grid-cols-3 gap-8 ">
              {sv.tools.metrics.map((m) => (
                <div key={m.label} className="flex flex-col gap-1">
                  <p className="text-xs text-[#6B7280] uppercase tracking-widest" style={{ fontFamily: F.mono }}>{m.label}</p>
                  <p className="text-3xl font-normal text-[#F5F5F7]" style={{ fontFamily: F.display }}>{m.value}</p>
                  <p className="text-xs text-[#6B7280]" style={{ fontFamily: F.mono }}>{m.note}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ed-band ed-band--dark py-24 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}>
            <motion.div variants={fadeUp}><Label>{sv.faq.label}</Label></motion.div>
            <motion.div variants={fadeUp} className="grid lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4">
                <h2 style={{ fontFamily: F.display, fontSize: "clamp(2.2rem,4vw,3.5rem)", fontWeight: 400, lineHeight: "0.96" }}>
                  {sv.faq.title[0]}<br /><span className="text-[#6B7280]">{sv.faq.title[1]}</span>
                </h2>
                <p className="text-sm text-[#6B7280] mt-5 leading-relaxed">
                  <button className="font-normal underline decoration-dotted hover:no-underline transition-all" style={{ color: DARK }}
                    onClick={onGoToForm}>
                    {sv.faq.link}
                  </button>
                </p>
              </div>
              <div className="lg:col-span-8">
                {sv.faq.items.map((item, i) => (
                  <div key={i} className="border-b border-[#353535]">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-start justify-between gap-6 py-5 text-left group">
                      <span className="text-base font-normal text-[#F5F5F7] group-hover:text-[#F5F5F7] transition-colors" style={{ fontFamily: F.display }}>{item.q}</span>
                      <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.25, ease }} className="shrink-0 mt-0.5">
                        <ChevronDown size={18} className="text-[#6B7280]" />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
                          <p className="text-sm text-[#6B7280] leading-relaxed pb-5">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div id="svc-cta">
        <CTASection onStart={onGoToForm} tone="dark" />
      </div>
      <Footer onNav={onNav} tone="dark" />
    </div>
  );
}

// ─── Page: Contact ───────────────────────────────────────────────────────────
function ContactPage({ onNav }: { onNav: (v: View) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLang();
  const ct = t.contact;

  const locations = [
    { ...ct.locations.portugal, flag: "🇵🇹" },
    { ...ct.locations.brazil, flag: "🇧🇷" },
  ];

  const connects = ct.connect.items.map((item, i) => ({
    ...item,
    href: i === 0 ? "mailto:hello@vaibes.studio" : "#",
  }));

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="ed-band ed-band--dark relative pt-[calc(var(--header-height)+2rem)] pb-20 px-2 md:px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#353535] text-[#6B7280]" style={{ fontFamily: F.mono }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P }} /> {ct.badge}
              </span>
            </motion.div>
            <motion.div variants={fadeUp} className="grid lg:grid-cols-12 gap-12 items-end">
              <div className="lg:col-span-7">
                <h1 style={{ fontFamily: F.display, fontSize: "clamp(3rem,8vw,7rem)", fontWeight: 400, lineHeight: "0.91" }}>
                  {ct.h1[0]}<br /><span className="text-[#F5F5F7]/25">{ct.h1[1]}</span>
                </h1>
              </div>
              <div className="lg:col-span-5 flex flex-col gap-5 lg:pb-3">
                <p className="text-lg text-[#6B7280] leading-relaxed">
                  {ct.sub}
                </p>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {ct.support}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{ background: `radial-gradient(circle at 70% 30%, ${P}0d, transparent 65%)` }} />
      </section>

      {/* Intro */}
      <section className="ed-band ed-band--dark py-20 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}
            className="grid lg:grid-cols-12 gap-12 items-start">
            <motion.div variants={fadeUp} className="lg:col-span-4">
              <Label>{ct.intro.label}</Label>
              <h2 style={{ fontFamily: F.display, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 400, lineHeight: "1.02" }}>
                {ct.intro.title}
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} className="lg:col-span-8 flex flex-col gap-5 lg:pt-10">
              <p className="text-lg text-[#6B7280] leading-relaxed font-normal">
                {ct.intro.p1}
              </p>
              <p className="text-base text-[#6B7280] leading-relaxed">
                {ct.intro.p2}
              </p>
              <p className="text-base text-[#6B7280] leading-relaxed">
                {ct.intro.p3}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Form + Availability */}
      <section id="contact-form" className="ed-band ed-band--dark py-20 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16">
          {/* Form */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}
            className="lg:col-span-7">
            <motion.div variants={fadeUp} className="mb-8">
              <Label>{ct.form.label}</Label>
              <h2 style={{ fontFamily: F.display, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 400, lineHeight: "1.02" }}>
                {ct.form.title[0]}<br /><span className="text-[#6B7280]">{ct.form.title[1]}</span>
              </h2>
            </motion.div>

            {submitted ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-black border border-[#353535] rounded-none p-10 flex flex-col gap-4 items-start">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: P, color: DARK }}>
                  <Check size={18} />
                </div>
                <h3 style={{ fontFamily: F.display, fontSize: "1.4rem", fontWeight: 400 }}>{ct.form.successTitle}</h3>
                <p className="text-base text-[#6B7280] leading-relaxed">{ct.form.successText}</p>
              </motion.div>
            ) : (
              <motion.form variants={fadeUp} className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2" style={{ fontFamily: F.mono }}>{ct.form.name}</label>
                    <input type="text" required placeholder={ct.form.name} className="w-full bg-black border border-[#353535] px-4 py-3 rounded-none text-sm text-[#F5F5F7] focus:outline-none focus:border-[#F5F5F7] transition-colors duration-200" style={{ ["--tw-ring-color" as string]: `${P}30` }} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2" style={{ fontFamily: F.mono }}>{ct.form.email}</label>
                    <input type="email" required placeholder="your@email.com" className="w-full bg-black border border-[#353535] px-4 py-3 rounded-none text-sm text-[#F5F5F7] focus:outline-none focus:border-[#F5F5F7] transition-colors duration-200" style={{ ["--tw-ring-color" as string]: `${P}30` }} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2" style={{ fontFamily: F.mono }}>{ct.form.company}</label>
                  <input type="text" placeholder="Acme Inc." className="w-full bg-black border border-[#353535] px-4 py-3 rounded-none text-sm text-[#F5F5F7] focus:outline-none focus:border-[#F5F5F7] transition-colors duration-200" style={{ ["--tw-ring-color" as string]: `${P}30` }} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2" style={{ fontFamily: F.mono }}>{ct.form.projectType}</label>
                  <select className="w-full bg-black border border-[#353535] px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 appearance-none transition-all text-[#F5F5F7]/70" style={{ ["--tw-ring-color" as string]: `${P}30` }}>
                    <option value="">{ct.form.selectType}</option>
                    {ct.form.projectOptions.map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2" style={{ fontFamily: F.mono }}>{ct.form.budget}</label>
                  <div className="flex flex-wrap gap-2">
                    {ct.form.budgetOptions.map(b => (
                      <label key={b} className="inline-flex items-center gap-2 bg-black border border-[#353535] px-4 py-2 rounded-full text-sm cursor-pointer hover:border-[#F5F5F7] has-[:checked]:border-[#F4F4F6] has-[:checked]:bg-[#F4F4F6] has-[:checked]:text-black transition-all">
                        <input type="radio" name="budget" value={b} className="sr-only" />
                        {b}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2" style={{ fontFamily: F.mono }}>{ct.form.message}</label>
                  <textarea rows={4} placeholder={ct.form.placeholder} className="w-full bg-black border border-[#353535] px-4 py-3 rounded-none text-sm text-[#F5F5F7] focus:outline-none focus:border-[#F5F5F7] resize-none transition-colors duration-200" style={{ ["--tw-ring-color" as string]: `${P}30` }} />
                </div>
                <button type="submit" className="ed-btn w-fit">
                  {ct.form.btn} <ArrowRight size={14} />
                </button>
                <p className="text-xs text-[#6B7280]" style={{ fontFamily: F.mono }}>{ct.form.note}</p>
              </motion.form>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}
            className="lg:col-span-5 flex flex-col gap-6">

            {/* Availability */}
            <motion.div variants={fadeUp} className="bg-black border border-[#353535] rounded-none p-7 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#22C55E" }} />
                <span className="text-xs font-normal text-[#6B7280]" style={{ fontFamily: F.mono }}>{ct.availability.status}</span>
              </div>
              <h3 style={{ fontFamily: F.display, fontSize: "1.15rem", fontWeight: 400, lineHeight: "1.2" }}>
                {ct.availability.title}
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {ct.availability.text}
              </p>
            </motion.div>

            {/* Ways to connect */}
            <motion.div variants={fadeUp} className="bg-black border border-[#353535] rounded-none p-7 flex flex-col gap-5">
              <div>
                <Label>{ct.connect.label}</Label>
                <h3 style={{ fontFamily: F.display, fontSize: "1.15rem", fontWeight: 400 }}>
                  {ct.connect.title}
                </h3>
              </div>
              <div className="divide-y divide-[#353535]">
                {connects.map((c) => (
                  <a key={c.label} href={c.href}
                    className="group flex items-center justify-between py-3 hover:text-[#F5F5F7] transition-colors">
                    <div>
                      <p className="text-sm font-normal text-[#F5F5F7] group-hover:text-[#F5F5F7] transition-colors">{c.label}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5" style={{ fontFamily: F.mono }}>{c.detail}</p>
                    </div>
                    <ArrowUpRight size={14} className="text-[#F5F5F7]/25 group-hover:text-[#F5F5F7] transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Locations */}
      <section className="ed-band ed-band--dark py-20 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}>
            <motion.div variants={fadeUp} className="grid lg:grid-cols-12 gap-12 mb-12">
              <div className="lg:col-span-5">
                <Label>{ct.locations.label}</Label>
                <h2 style={{ fontFamily: F.display, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 400, lineHeight: "1.02" }}>
                  {ct.locations.title[0]}<br /><span className="text-[#6B7280]">{ct.locations.title[1]}</span>
                </h2>
              </div>
              <div className="lg:col-span-7 flex items-end">
                <p className="text-base text-[#6B7280] leading-relaxed max-w-lg">
                  {ct.locations.desc}
                </p>
              </div>
            </motion.div>
            <motion.div variants={stagger} className="grid md:grid-cols-2 gap-4">
              {locations.map((loc) => (
                <motion.div key={loc.country} variants={fadeUp}
                  className="bg-black border border-[#353535] rounded-none p-8 flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl">{loc.flag}</span>
                      <h3 style={{ fontFamily: F.display, fontSize: "1.4rem", fontWeight: 400 }} className="mt-2">{loc.country}</h3>
                      <p className="text-xs text-[#6B7280] mt-1" style={{ fontFamily: F.mono }}>{loc.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#6B7280]" style={{ fontFamily: F.mono }}>{loc.city}</p>
                      <p className="text-xs font-normal mt-1 inline-flex items-center px-1.5 py-0.5 rounded" style={{ fontFamily: F.mono, backgroundColor: P, color: DARK }}>{loc.tz}</p>
                    </div>
                  </div>
                  <div className="border-t border-[#353535] pt-5">
                    <p className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-3" style={{ fontFamily: F.mono }}>{loc.resLabel}</p>
                    <ul className="flex flex-col gap-2">
                      {loc.items.map(item => (
                        <li key={item} className="flex items-center gap-2.5 text-sm text-[#F5F5F7]">
                          <Check size={12} className="shrink-0" style={{ color: DARK }} />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ed-band ed-band--dark py-20 px-2 md:px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}>
            <motion.div variants={fadeUp} className="grid lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4">
                <Label>{ct.faq.label}</Label>
                <h2 style={{ fontFamily: F.display, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 400, lineHeight: "0.96" }}>
                  {ct.faq.title[0]}<br /><span className="text-[#6B7280]">{ct.faq.title[1]}</span>
                </h2>
              </div>
              <div className="lg:col-span-8">
                {ct.faq.items.map((item, i) => (
                  <div key={i} className="border-b border-[#353535]">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-start justify-between gap-6 py-5 text-left group">
                      <span className="text-base font-normal text-[#F5F5F7] group-hover:text-[#F5F5F7] transition-colors" style={{ fontFamily: F.display }}>{item.q}</span>
                      <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.25, ease }} className="shrink-0 mt-0.5">
                        <ChevronDown size={18} className="text-[#6B7280]" />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
                          <p className="text-sm text-[#6B7280] leading-relaxed pb-5">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="ed-band ed-band--dark py-16 md:py-24 px-2 md:px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="ed-meta uppercase tracking-[0.18em] text-[11px] mb-6">{ct.finalCta.eyebrow}</p>
            <h2 className="ed-heading mb-6" style={{ fontSize: "clamp(2.8rem,6vw,5.5rem)" }}>
              {ct.finalCta.title[0]}<br /><span className="opacity-40">{ct.finalCta.title[1]}</span>
            </h2>
            <p className="text-[14px] leading-[1.5] max-w-xl opacity-70">{ct.finalCta.body}</p>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-3">
            <button onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })} className="ed-btn w-full">
              {ct.finalCta.btn} <ArrowRight size={14} />
            </button>
            <p className="ed-meta text-center mt-1">{ct.finalCta.note}</p>
          </div>
        </div>
      </section>

      <Footer onNav={onNav} tone="dark" />
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>({ page: "home" });
  const [lang, setLang] = useState<Lang>("pt");
  const viewRef = useRef(view);
  const morphRef = useRef<PageMorphHandle>(null);
  viewRef.current = view;

  const navigate = useCallback((next: View) => {
    if (viewsMatch(viewRef.current, next)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return Promise.resolve();
    }
    const swap = () => {
      setView(next);
      window.scrollTo({ top: 0 });
    };
    return morphRef.current?.play(swap) ?? Promise.resolve(swap());
  }, []);

  const goToForm = useCallback(() => {
    void (async () => {
      await navigate({ page: "contact" });
      document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
    })();
  }, [navigate]);

  const currentPage = view.page === "project" ? "portfolio" : view.page;

  const currentProject = view.page === "project" ? PROJECTS.find((p) => p.id === view.id) ?? null : null;
  const projectIndex = currentProject ? PROJECTS.findIndex((p) => p.id === currentProject.id) : -1;
  const prevProject = projectIndex > 0 ? PROJECTS[projectIndex - 1] : null;
  const nextProject = projectIndex < PROJECTS.length - 1 ? PROJECTS[projectIndex + 1] : null;

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div className="bg-black text-[#F5F5F7]" style={{ fontFamily: F.body }}>
        <PageMorph ref={morphRef} />
        <Nav currentPage={currentPage} onNav={navigate} />

        <AnimatePresence mode="wait">
          {view.page === "home" && (
            <motion.div key="home" {...pageTrans} {...pageTransProps}>
              <HomePage onNav={navigate} onGoToForm={goToForm} />
            </motion.div>
          )}
          {view.page === "portfolio" && (
            <motion.div key="portfolio" {...pageTrans} {...pageTransProps}>
              <PortfolioPage onNav={navigate} onGoToForm={goToForm} />
            </motion.div>
          )}
          {view.page === "project" && currentProject && (
            <motion.div key={`project-${currentProject.id}`} {...pageTrans} {...pageTransProps}>
              <ProjectDetail
                project={currentProject}
                prev={prevProject}
                next={nextProject}
                onBack={() => navigate({ page: "portfolio" })}
                onNavigate={(id) => navigate({ page: "project", id })}
              />
              <Footer onNav={navigate} tone="dark" />
            </motion.div>
          )}
          {view.page === "services" && (
            <motion.div key="services" {...pageTrans} {...pageTransProps}>
              <ServicesPage onNav={navigate} onGoToForm={goToForm} />
            </motion.div>
          )}
          {view.page === "contact" && (
            <motion.div key="contact" {...pageTrans} {...pageTransProps}>
              <ContactPage onNav={navigate} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating CTA */}
        <FloatingCTA onGoToForm={goToForm} />
      </div>
    </LangContext.Provider>
  );
}

function FloatingCTA({ onGoToForm }: { onGoToForm: () => void }) {
  const { t } = useLang();
  return (
    <motion.button
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5, ease }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onGoToForm}
      className="ed-btn fixed bottom-8 right-6 z-40"
      style={{ fontFamily: F.body }}
    >
      <Zap size={13} className="fill-white" /> {t.nav.cta}
    </motion.button>
  );
}
