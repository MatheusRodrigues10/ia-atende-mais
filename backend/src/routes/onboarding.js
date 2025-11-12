const express = require('express');
const mongoose = require('mongoose');
const Onboarding = require('../models/Onboarding');
const { auth, isAdmin } = require('../middleware/auth');
const { uploadGridFS } = require('../middleware/uploadGridFS'); // novo middleware de upload via GridFS

const router = express.Router();

// ============================================
// ROTAS DE CLIENTE
// ============================================

// POST /onboarding/create - Criar ou atualizar onboarding completo
router.post('/create', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      dadosCadastrais,
      endereco,
      representantesLegais,
      contatoOperacional,
      contatoFinanceiro,
      observacoes,
      communicationAndChannel,
      intelligentAgent,
      integrationsAndSettings
    } = req.body;

    if (!dadosCadastrais || !endereco || !representantesLegais ||
        !contatoOperacional || !contatoFinanceiro) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    let onboarding = await Onboarding.findOne({ userId });

    if (onboarding) {
      Object.assign(onboarding, {
        dadosCadastrais,
        endereco,
        representantesLegais,
        contatoOperacional,
        contatoFinanceiro,
        observacoes,
        communicationAndChannel,
        intelligentAgent,
        integrationsAndSettings
      });
      await onboarding.save();
      return res.json({
        success: true,
        message: 'Onboarding atualizado com sucesso',
        data: onboarding
      });
    }

    onboarding = await Onboarding.create({
      userId,
      dadosCadastrais,
      endereco,
      representantesLegais,
      contatoOperacional,
      contatoFinanceiro,
      observacoes: observacoes || '',
      communicationAndChannel,
      intelligentAgent,
      integrationsAndSettings
    });

    res.status(201).json({
      success: true,
      message: 'Onboarding criado com sucesso',
      data: onboarding
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar/atualizar onboarding',
      error: error.message
    });
  }
});

router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const onboarding = await Onboarding.findOne({ userId });
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding não encontrado para este usuário',
      });
    }

    res.json({
      success: true,
      message: 'Onboarding encontrado',
      data: onboarding,
    });
  } catch (error) {
    console.error('Erro ao buscar onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar onboarding',
      error: error.message,
    });
  }
});

// ============================================
// PUT /onboarding/:id - Editar onboarding (somente o próprio usuário)
// ============================================
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Verifica se o onboarding pertence ao usuário autenticado
    const onboarding = await Onboarding.findOne({ _id: id, userId });
    if (!onboarding) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este onboarding.'
      });
    }

    // Campos permitidos para edição
    const {
      dadosCadastrais,
      endereco,
      representantesLegais,
      contatoOperacional,
      contatoFinanceiro,
      observacoes,
      communicationAndChannel,
      intelligentAgent,
      integrationsAndSettings
    } = req.body;

    // Atualiza apenas os campos informados
    if (dadosCadastrais) onboarding.dadosCadastrais = dadosCadastrais;
    if (endereco) onboarding.endereco = endereco;
    if (representantesLegais) onboarding.representantesLegais = representantesLegais;
    if (contatoOperacional) onboarding.contatoOperacional = contatoOperacional;
    if (contatoFinanceiro) onboarding.contatoFinanceiro = contatoFinanceiro;
    if (observacoes !== undefined) onboarding.observacoes = observacoes;
    if (communicationAndChannel !== undefined) onboarding.communicationAndChannel = communicationAndChannel;
    if (intelligentAgent !== undefined) onboarding.intelligentAgent = intelligentAgent;
    if (integrationsAndSettings !== undefined) onboarding.integrationsAndSettings = integrationsAndSettings;

    onboarding.dataAtualizacao = new Date();

    await onboarding.save();

    res.json({
      success: true,
      message: 'Onboarding atualizado com sucesso',
      data: onboarding
    });
  } catch (error) {
    console.error('Erro ao editar onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao editar onboarding',
      error: error.message
    });
  }
});


// ============================================
// UPLOAD DE ARQUIVOS VIA GRIDFS
// ============================================

// POST /onboarding/files/add - Upload de arquivo
router.post('/files/add', auth, uploadGridFS.single('file'), async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.file;
    const { tipoDocumento } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    // Buscar ou criar onboarding
    let onboarding = await Onboarding.findOne({ userId });
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding não encontrado. Crie um onboarding antes de enviar arquivos.'
      });
    }

    // Adicionar metadados do arquivo
    const novoArquivo = {
      fileId: file.id,
      filename: file.filename,
      contentType: file.contentType,
      tipoDocumento: tipoDocumento || null,
      uploadedAt: new Date()
    };

    onboarding.documentos.push(novoArquivo);
    await onboarding.save();

    res.status(201).json({
      success: true,
      message: 'Arquivo enviado com sucesso',
      data: novoArquivo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar arquivo',
      error: error.message
    });
  }
});

// GET /onboarding/files/:id - Download de arquivo
router.get('/files/:id', auth, async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', () => res.status(404).json({ success: false, message: 'Arquivo não encontrado' }));

    res.set('Content-Type', 'application/octet-stream');
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao baixar arquivo',
      error: error.message
    });
  }
});

// DELETE /onboarding/files/:id - Deletar arquivo
router.delete('/files/:id', auth, async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const userId = req.user._id;

    const onboarding = await Onboarding.findOne({ userId });
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding não encontrado'
      });
    }

    // Verifica se o arquivo pertence ao usuário
    const arquivo = onboarding.documentos.find(doc => doc.fileId.toString() === fileId.toString());
    if (!arquivo) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado neste onboarding'
      });
    }

    // Deleta no GridFS
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    await bucket.delete(fileId);

    // Remove referência do Mongo
    onboarding.documentos = onboarding.documentos.filter(doc => doc.fileId.toString() !== fileId.toString());
    await onboarding.save();

    res.json({
      success: true,
      message: 'Arquivo deletado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar arquivo',
      error: error.message
    });
  }
});

// ============================================
// ROTAS ADMIN
// ============================================

// GET /onboarding - Listar todos (admin)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const onboardings = await Onboarding.find().populate('userId', 'nome email');
    res.json({ success: true, data: onboardings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar onboardings',
      error: error.message
    });
  }
});

// DELETE /onboarding/:id - Excluir onboarding (admin)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const onboarding = await Onboarding.findById(id);

    if (!onboarding) {
      return res.status(404).json({ success: false, message: 'Onboarding não encontrado' });
    }

    // Deleta arquivos do GridFS
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    for (const doc of onboarding.documentos) {
      try {
        await bucket.delete(new mongoose.Types.ObjectId(doc.fileId));
      } catch {
        console.warn('Arquivo não encontrado no GridFS:', doc.fileId);
      }
    }

    await Onboarding.findByIdAndDelete(id);

    res.json({ success: true, message: 'Onboarding excluído com sucesso' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir onboarding',
      error: error.message
    });
  }
});

// PATCH /onboarding/:id/status - Atualizar status (admin only)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    // Normaliza status: rejeitado -> será armazenado como rejeitado
    const statusValidos = ['pendente', 'em análise', 'aprovado', 'reprovado', 'rejeitado', 'rascunho', 'em_analise'];
    if (!status || !statusValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido. Valores permitidos: ' + statusValidos.join(', ')
      });
    }

    const onboarding = await Onboarding.findByIdAndUpdate(
      id,
      { status, atualizadoEm: new Date() },
      { new: true }
    );

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: onboarding
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status',
      error: error.message
    });
  }
});

module.exports = router;
