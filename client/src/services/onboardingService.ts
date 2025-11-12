import { OnboardingData } from '@/types/onboarding';
import api from './api';

/**
 * Normaliza o status vindo do backend para o formato esperado pelo frontend
 */
const normalizeStatus = (backendStatus: any): 'rascunho' | 'em_analise' | 'aprovado' | 'rejeitado' => {
  if (!backendStatus) return 'rascunho';
  
  const status = (backendStatus as string).toLowerCase().replace(/\s+/g, '_').replace(/á/g, 'a');
  
  if (status === 'em_analise' || status === 'em_analíse') {
    return 'em_analise';
  } else if (status === 'aprovado') {
    return 'aprovado';
  } else if (status === 'rejeitado' || status === 'reprovado') {
    return 'rejeitado';
  } else if (status === 'rascunho') {
    return 'rascunho';
  }
  
  return 'rascunho';
};

/**
 * Cria ou atualiza o onboarding do cliente autenticado.
 * @param dados Dados completos do onboarding.
 */
export const createOnboarding = async (dados: any): Promise<OnboardingData> => {
  const response = await api.post('/onboarding/create', dados);
  if (!response.data.success) throw new Error(response.data.message);
  return response.data.data;
};

/**
 * Faz upload de um arquivo via GridFS.
 * Usa a rota POST /onboarding/files/add
 * @param file Arquivo a ser enviado
 * @param tipoDocumento Tipo opcional (ex: 'contrato', 'rgCpf', etc.)
 */
export const uploadOnboardingFile = async (
  file: File,
  tipoDocumento?: string
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  if (tipoDocumento) formData.append('tipoDocumento', tipoDocumento);

  const response = await api.post('/onboarding/files/add', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (!response.data.success) throw new Error(response.data.message);
  return response.data.data;
};

/**
 * Faz download de um arquivo armazenado no GridFS.
 * Usa GET /onboarding/files/:id
 * Retorna o Blob do arquivo.
 */
export const downloadOnboardingFile = async (fileId: string): Promise<Blob> => {
  const response = await api.get(`/onboarding/files/${fileId}`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Exclui um arquivo do GridFS e remove a referência no Onboarding.
 * Usa DELETE /onboarding/files/:id
 */
export const deleteOnboardingFile = async (fileId: string): Promise<void> => {
  const response = await api.delete(`/onboarding/files/${fileId}`);
  if (!response.data.success) throw new Error(response.data.message);
};

/**
 * Busca o onboarding por ID (para o admin).
 * Usa GET /onboarding/:id
 */
export const getOnboardingByUserId = async (
  userId: string
): Promise<OnboardingData | null> => {
  const response = await api.get(`/onboarding/${userId}`);
  if (!response.data.success) throw new Error(response.data.message);
  const o = response.data.data;
  if (!o) return null;

  // Normaliza estrutura do backend para o formato do front
  return {
    id: o._id,
    userId: o.userId,
    razaoSocial: o.dadosCadastrais?.razaoSocial || '',
    nomeFantasia: o.dadosCadastrais?.nomeFantasia || '',
    cnpj: o.dadosCadastrais?.cnpj || '',
    inscricaoEstadual: o.dadosCadastrais?.inscricaoEstadual || '',
    inscricaoMunicipal: o.dadosCadastrais?.inscricaoMunicipal || '',
    endereco: {
      logradouro: o.endereco?.logradouro || o.endereco?.rua || '',
      numero: o.endereco?.numero || '',
      complemento: o.endereco?.complemento || '',
      bairro: o.endereco?.bairro || '',
      cidade: o.endereco?.cidade || '',
      estado: o.endereco?.estado || '',
      cep: o.endereco?.cep || '',
    },
    representantesLegais: o.representantesLegais || [],
    contatoOperacional: o.contatoOperacional || {
      nome: '',
      cargo: '',
      telefone: '',
      email: '',
    },
    contatoFinanceiro: o.contatoFinanceiro || {
      nome: '',
      cargo: '',
      telefone: '',
      email: '',
    },
    communicationAndChannel: {
      numeroWhatsappOficial: o.communicationAndChannel?.numeroWhatsappOficial || '',
      templatesMensagem: o.communicationAndChannel?.templatesMensagem || '',
      metaBusinessSchedule: o.communicationAndChannel?.metaBusinessSchedule
        ? {
            data: o.communicationAndChannel.metaBusinessSchedule.data
              ? new Date(o.communicationAndChannel.metaBusinessSchedule.data).toISOString()
              : undefined,
            horario: o.communicationAndChannel.metaBusinessSchedule.horario || '',
          }
        : null,
    },
    intelligentAgent: {
      nomeIdentidadeAgente: o.intelligentAgent?.nomeIdentidadeAgente || '',
      baseConhecimento: o.intelligentAgent?.baseConhecimento || '',
      jornadaConversacional: o.intelligentAgent?.jornadaConversacional || '',
    },
    integrationsAndSettings: {
      crm: o.integrationsAndSettings?.crm || '',
      relatoriosDashboards: o.integrationsAndSettings?.relatoriosDashboards || '',
      outrasIntegracoes: o.integrationsAndSettings?.outrasIntegracoes || '',
    },
    documentos: o.documentos || [],
    status: normalizeStatus(o.status),
    dataCriacao: o.createdAt ? new Date(o.createdAt) : new Date(),
    dataAtualizacao: o.updatedAt ? new Date(o.updatedAt) : new Date(),
  };
};


/**
 * Lista todos os onboardings (somente admin).
 * Usa GET /onboarding
 */
export const getAllOnboardings = async (): Promise<OnboardingData[]> => {
  const response = await api.get('/onboarding');
  if (!response.data.success) throw new Error(response.data.message);
  
  return response.data.data.map((o: any) => ({
    id: o._id,
    userId: o.userId,
    razaoSocial: o.dadosCadastrais?.razaoSocial || '',
    nomeFantasia: o.dadosCadastrais?.nomeFantasia || '',
    cnpj: o.dadosCadastrais?.cnpj || '',
    inscricaoEstadual: o.dadosCadastrais?.inscricaoEstadual || '',
    inscricaoMunicipal: o.dadosCadastrais?.inscricaoMunicipal || '',
    endereco: {
      logradouro: o.endereco?.logradouro || o.endereco?.rua || '',
      numero: o.endereco?.numero || '',
      complemento: o.endereco?.complemento || '',
      bairro: o.endereco?.bairro || '',
      cidade: o.endereco?.cidade || '',
      estado: o.endereco?.estado || '',
      cep: o.endereco?.cep || '',
    },
    representantesLegais: o.representantesLegais || [],
    contatoOperacional: o.contatoOperacional || { nome: '', cargo: '', telefone: '', email: '' },
    contatoFinanceiro: o.contatoFinanceiro || { nome: '', cargo: '', telefone: '', email: '' },
    communicationAndChannel: {
      numeroWhatsappOficial: o.communicationAndChannel?.numeroWhatsappOficial || '',
      templatesMensagem: o.communicationAndChannel?.templatesMensagem || '',
      metaBusinessSchedule: o.communicationAndChannel?.metaBusinessSchedule
        ? {
            data: o.communicationAndChannel.metaBusinessSchedule.data
              ? new Date(o.communicationAndChannel.metaBusinessSchedule.data).toISOString()
              : undefined,
            horario: o.communicationAndChannel.metaBusinessSchedule.horario || '',
          }
        : null,
    },
    intelligentAgent: {
      nomeIdentidadeAgente: o.intelligentAgent?.nomeIdentidadeAgente || '',
      baseConhecimento: o.intelligentAgent?.baseConhecimento || '',
      jornadaConversacional: o.intelligentAgent?.jornadaConversacional || '',
    },
    integrationsAndSettings: {
      crm: o.integrationsAndSettings?.crm || '',
      relatoriosDashboards: o.integrationsAndSettings?.relatoriosDashboards || '',
      outrasIntegracoes: o.integrationsAndSettings?.outrasIntegracoes || '',
    },
    documentos: o.documentos || [],
    status: normalizeStatus(o.status),
    criadoEm: o.criadoEm ? new Date(o.criadoEm) : undefined,
    dataCriacao: o.dataCriacao ? new Date(o.dataCriacao) : undefined,
    atualizadoEm: o.atualizadoEm ? new Date(o.atualizadoEm) : undefined,
    dataAtualizacao: o.dataAtualizacao ? new Date(o.dataAtualizacao) : undefined,
  }));
};

/**
 * Atualiza um onboarding existente (admin).
 * Usa PUT /onboarding/:id
 */
export const updateOnboarding = async (
  id: string,
  data: Partial<OnboardingData>
): Promise<OnboardingData> => {
  const response = await api.put(`/onboarding/${id}`, data);
  if (!response.data.success) throw new Error(response.data.message);
  return response.data.data;
};

/**
 * Exclui um onboarding completamente (admin).
 * Usa DELETE /onboarding/:id
 */
export const deleteOnboarding = async (id: string): Promise<void> => {
  const response = await api.delete(`/onboarding/${id}`);
  if (!response.data.success) throw new Error(response.data.message);
};

/**
 * Atualiza o status de um onboarding (admin only).
 * Usa PATCH /onboarding/:id/status
 */
export const updateOnboardingStatus = async (
  id: string,
  status: 'rascunho' | 'em_analise' | 'aprovado' | 'rejeitado'
): Promise<OnboardingData> => {
  const response = await api.patch(`/onboarding/${id}/status`, { status });
  if (!response.data.success) throw new Error(response.data.message);
  return response.data.data;
};
