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

export interface DocumentoUpload {
  id?: string;
  fileId?: string;
  nome?: string;
  filename?: string;
  tipo?: 'contrato_social' | 'rg_cpf' | 'comprovante_endereco' | 'logotipo';
  tipoDocumento?: 'contrato_social' | 'rg_cpf' | 'comprovante_endereco' | 'logotipo';
  arquivo?: File | null;
  url?: string;
  dataUpload?: Date;
  uploadedAt?: Date;
  contentType?: string;
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
