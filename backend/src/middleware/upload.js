const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const connectToDatabase = require('../config/database');

// Configuração do GridFS Storage
const storage = new GridFsStorage({
  db: connectToDatabase().then((connection) => connection.db),
  file: (req, file) => {
    // Gerar nome único: timestamp + random + extensão original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    const name = file.originalname.replace(/\s+/g, '-').replace(/\.[^.]+$/, '');
    return {
      filename: `${name}-${uniqueSuffix}.${ext}`,
      bucketName: 'uploads', // Nome do bucket GridFS
      metadata: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        tipoDocumento: req.body.tipoDocumento || null
      }
    };
  }
});

// Filtro de tipos de arquivo por tipo de documento
const createFileFilter = (tipoDocumento) => {
  return (req, file, cb) => {
    // Tipos permitidos para documentos gerais
    const tiposDocumentosGerais = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    // Tipos permitidos apenas para logotipo
    const tiposLogotipo = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/svg+xml'
    ];

    let tiposPermitidos;
    
    // Determinar tipos permitidos baseado no tipo de documento
    if (tipoDocumento === 'logotipo') {
      tiposPermitidos = tiposLogotipo;
    } else {
      tiposPermitidos = tiposDocumentosGerais;
    }

    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const tiposTexto = tipoDocumento === 'logotipo' 
        ? 'PNG, JPG, JPEG, SVG'
        : 'PDF, DOC, DOCX, JPG, PNG';
      cb(new Error(`Tipo de arquivo não permitido para ${tipoDocumento}. Permitidos: ${tiposTexto}`), false);
    }
  };
};

// Criar configurações de upload específicas por tipo
const createUpload = (tipoDocumento) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: tipoDocumento === 'logotipo' ? 2 * 1024 * 1024 : 10 * 1024 * 1024 // 2MB para logo, 10MB para documentos
    },
    fileFilter: createFileFilter(tipoDocumento)
  });
};

// Exports de uploads específicos
const uploads = {
  contratoSocial: createUpload('contrato_social'),
  rgCpf: createUpload('rg_cpf'),
  comprovanteEndereco: createUpload('comprovante_endereco'),
  logotipo: createUpload('logotipo')
};

// Upload genérico (para múltiplos tipos)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Permitidos: JPG, PNG, SVG, PDF, DOC, DOCX'), false);
    }
  }
});

// Middleware para tratar erros do multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 10MB para documentos, 2MB para logotipo'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erro no upload: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = { upload, uploads, handleMulterError };