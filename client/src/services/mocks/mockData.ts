import { OnboardingData, User } from '@/types/onboarding';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'usuario@teste.com',
    nome: 'João Silva',
    tipo: 'usuario',
    onboardingId: '1',
  },
  {
    id: '2',
    email: 'admin@teste.com',
    nome: 'Admin',
    tipo: 'admin',
  },
];

export const mockOnboardings: OnboardingData[] = [
  {
    id: '1',
    userId: '1',
    razaoSocial: 'Empresa Exemplo LTDA',
    nomeFantasia: 'Empresa Exemplo',
    cnpj: '12.345.678/0001-90',
    inscricaoEstadual: '123456789',
    inscricaoMunicipal: '987654321',
    endereco: {
      logradouro: 'Rua Exemplo',
      numero: '123',
      complemento: 'Sala 456',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
    },
    representantesLegais: [
      {
        id: '1',
        nome: 'João Silva',
        cpf: '123.456.789-00',
        cargo: 'Diretor',
      },
    ],
    contatoOperacional: {
      nome: 'Pedro Santos',
      cargo: 'Gerente Operacional',
      telefone: '(11) 98765-4321',
      email: 'operacional@empresa.com',
    },
    contatoFinanceiro: {
      nome: 'Ana Costa',
      cargo: 'Gerente Financeiro',
      telefone: '(11) 98765-1234',
      email: 'financeiro@empresa.com',
    },
    documentos: [],
    status: 'em_analise',
    dataCriacao: new Date('2024-01-15'),
    dataAtualizacao: new Date('2024-01-20'),
  },
];
