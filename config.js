// ============ CONFIGURAÇÃO ============
window.APP_CONFIG = {
  // Deixe vazio para modo LOCAL (votos ficam só no navegador - serve para testar).
  // Para valer de verdade, cole aqui a URL do Google Apps Script (veja LEIAME.md).
  BACKEND_URL: "",
  // Senha do administrador no modo LOCAL (no modo Google, a senha fica no apps-script.gs).
  ADMIN_PASSWORD: "ieab2026"
};

// Dados iniciais da votação (o admin pode editar tudo depois em admin.html)
window.DEFAULT_DATA = {
  titulo: "Primaz da IEAB",
  candidatos: [
    { num: "11", nome: "Marinez Rosa dos Santos Bassotto", cargo: "Bispa da Diocese Anglicana da Amazônia e Bispa Primaz da IEAB", foto: "fotos/11.jpg" },
    { num: "12", nome: "Maurício José Araújo de Andrade", cargo: "Bispo da Diocese Anglicana de Brasília", foto: "fotos/12.jpg" },
    { num: "13", nome: "Francisco de Assis da Silva", cargo: "Bispo da Diocese Sul Ocidental", foto: "fotos/13.jpg" },
    { num: "14", nome: "Humberto Maiztegui Gonçalves", cargo: "Bispo da Diocese Meridional", foto: "fotos/14.jpg" },
    { num: "15", nome: "João Câncio Peixoto", cargo: "Bispo da Diocese Anglicana do Recife", foto: "fotos/15.jpg" },
    { num: "16", nome: "Eduardo Coelho Grillo", cargo: "Bispo da Diocese Anglicana do Rio de Janeiro", foto: "fotos/16.jpg" },
    { num: "17", nome: "Meriglei Borges da Silva Simim", cargo: "Bispa da Diocese Anglicana de Pelotas", foto: "fotos/17.jpg" },
    { num: "18", nome: "Francisco Cézar Fernandes Alves", cargo: "Bispo da Diocese Anglicana de São Paulo", foto: "fotos/18.jpg" },
    { num: "19", nome: "Magda Guedes Pereira", cargo: "Bispa da Diocese Anglicana do Paraná", foto: "fotos/19.jpg" }
  ],
  dioceses: [
    { num: "01", nome: "Diocese Anglicana da Amazônia" },
    { num: "02", nome: "Diocese Anglicana de Brasília" },
    { num: "03", nome: "Diocese Sul Ocidental" },
    { num: "04", nome: "Diocese Meridional" },
    { num: "05", nome: "Diocese Anglicana do Recife" },
    { num: "06", nome: "Diocese Anglicana do Rio de Janeiro" },
    { num: "07", nome: "Diocese Anglicana de Pelotas" },
    { num: "08", nome: "Diocese Anglicana de São Paulo" },
    { num: "09", nome: "Diocese Anglicana do Paraná" }
  ]
};
