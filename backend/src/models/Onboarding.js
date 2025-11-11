const mongoose = require('mongoose');

const DocumentoSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  tipoDocumento: {
    type: String,
    enum: ['contrato_social', 'rg_cpf', 'comprovante_endereco', 'logotipo'],
    required: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const OnboardingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Dados principais
  dadosCadastrais: {
    razaoSocial: { type: String, required: true },
    nomeFantasia: { type: String },
    cnpj: { type: String },
    inscricaoEstadual: { type: String },
    inscricaoMunicipal: { type: String },
    telefone: { type: String },
    email: { type: String }
  },

  endereco: {
    logradouro: { type: String },
    rua: { type: String },
    numero: { type: String },
    complemento: { type: String },
    bairro: { type: String },
    cidade: { type: String },
    estado: { type: String },
    cep: { type: String }
  },

  representantesLegais: [{
    nome: String,
    cpf: String,
    cargo: String,
    email: String,
    telefone: String
  }],

  contatoOperacional: {
    nome: String,
    cargo: String,
    email: String,
    telefone: String
  },

  contatoFinanceiro: {
    nome: String,
    cargo: String,
    email: String,
    telefone: String
  },

  // Documentos armazenados no GridFS
  documentos: [DocumentoSchema],

  observacoes: {
    type: String,
    default: ''
  },

  status: {
    type: String,
    enum: ['pendente', 'em análise', 'aprovado', 'reprovado', 'rejeitado', 'rascunho', 'em_analise'],
    default: 'rascunho'
  },

  criadoEm: {
    type: Date,
    default: Date.now
  },
  atualizadoEm: {
    type: Date,
    default: Date.now
  }
});

// Atualiza o campo `atualizadoEm` automaticamente antes de salvar
OnboardingSchema.pre('save', function (next) {
  this.atualizadoEm = new Date();
  next();
});

module.exports = mongoose.model('Onboarding', OnboardingSchema);
