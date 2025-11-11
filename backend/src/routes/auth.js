const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Função para gerar token JWT
const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /auth/register - Registrar cliente
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validação básica
    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se usuário já existe
    const userExistente = await User.findOne({ email });
    if (userExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Criar usuário
    const user = await User.create({
      nome,
      email,
      senha,
      role: 'client'
    });

    // Gerar token
    const token = gerarToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Cliente registrado com sucesso',
      data: {
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar cliente',
      error: error.message
    });
  }
});

// POST /auth/login - Login de cliente
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validação básica
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário com senha
    const user = await User.findOne({ email }).select('+senha');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const senhaCorreta = await user.compararSenha(senha);
    
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se está ativo
    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo'
      });
    }

    // Gerar token
    const token = gerarToken(user._id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar login',
      error: error.message
    });
  }
});

// POST /auth/admin/register-once - Registrar único admin
router.post('/admin/register-once', async (req, res) => {
  try {
    const { nome, email, senha, adminKey } = req.body;

    // Validação básica
    if (!nome || !email || !senha || !adminKey) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, senha e adminKey são obrigatórios'
      });
    }

    // Verificar chave de admin
    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Chave de registro de admin inválida'
      });
    }

    // Verificar se já existe um admin
    const adminExistente = await User.findOne({ role: 'admin' });
    if (adminExistente) {
      return res.status(400).json({
        success: false,
        message: 'Admin já foi registrado. Apenas um admin é permitido'
      });
    }

    // Verificar se email já existe
    const emailExistente = await User.findOne({ email });
    if (emailExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Criar admin
    const admin = await User.create({
      nome,
      email,
      senha,
      role: 'admin'
    });

    // Gerar token
    const token = gerarToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin registrado com sucesso',
      data: {
        user: {
          id: admin._id,
          nome: admin.nome,
          email: admin.email,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar admin',
      error: error.message
    });
  }
});

// POST /auth/admin/login - Login de admin
router.post('/admin/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validação básica
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar admin com senha
    const admin = await User.findOne({ email, role: 'admin' }).select('+senha');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais de admin inválidas'
      });
    }

    // Verificar senha
    const senhaCorreta = await admin.compararSenha(senha);
    
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais de admin inválidas'
      });
    }

    // Verificar se está ativo
    if (!admin.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Admin inativo'
      });
    }

    // Gerar token
    const token = gerarToken(admin._id);

    res.json({
      success: true,
      message: 'Login de admin realizado com sucesso',
      data: {
        user: {
          id: admin._id,
          nome: admin.nome,
          email: admin.email,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar login de admin',
      error: error.message
    });
  }
});

module.exports = router;