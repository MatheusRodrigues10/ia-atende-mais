export interface RepresentanteLegal {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
}

export interface Contato {
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
}

export type DocumentoTipo =
  | 'contrato_social'
  | 'rg_cpf'
  | 'comprovante_endereco'
  | 'logotipo'
  | 'numero_whatsapp_oficial'
  | 'configuracao_meta_business'
  | 'templates_mensagem'
  | 'nome_identidade_agente'
  | 'perfil_visual'
  | 'base_conhecimento'
  | 'jornada_conversacional'
  | 'crm'
  | 'relatorios_dashboards'
  | 'outras_integracoes'
  | 'communication_and_channel'
  | 'intelligent_agent'
  | 'integrations_and_settings';

export interface DocumentoUpload {
  id?: string;
  fileId?: string;
  nome?: string;
  filename?: string;
  tipo?: DocumentoTipo;
  tipoDocumento?: DocumentoTipo;
  arquivo?: File | null;
  url?: string;
  dataUpload?: Date;
  uploadedAt?: Date;
  contentType?: string;
}

export interface MetaBusinessSchedule {
  data?: string;
  horario?: string;
}

export interface CommunicationAndChannel {
  numeroWhatsappOficial?: string;
  metaBusinessSchedule?: MetaBusinessSchedule | null;
  templatesMensagem?: string;
}

export interface IntelligentAgent {
  nomeIdentidadeAgente?: string;
  baseConhecimento?: string;
  jornadaConversacional?: string;
}

export interface IntegrationsAndSettings {
  crm?: string;
  relatoriosDashboards?: string;
  outrasIntegracoes?: string;
}

export interface OnboardingData {
  id: string;
  userId: string;
  
  // Dados Cadastrais da Empresa
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  
  // Representantes Legais
  representantesLegais: RepresentanteLegal[];
  
  // Contatos
  contatoOperacional: Contato;
  contatoFinanceiro: Contato;
  
  communicationAndChannel?: CommunicationAndChannel;
  intelligentAgent?: IntelligentAgent;
  integrationsAndSettings?: IntegrationsAndSettings;

  // Documentos
  documentos: DocumentoUpload[];
  
  // Status
  status: 'rascunho' | 'em_analise' | 'aprovado' | 'rejeitado';
  dataCriacao?: Date;
  criadoEm?: Date;
  dataAtualizacao?: Date;
  atualizadoEm?: Date;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  tipo: 'usuario' | 'admin';
  onboardingId?: string;
}
