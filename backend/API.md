# 📚 Documentação da API de Onboarding

Base URL: `https://seu-dominio.vercel.app` (em produção) ou `http://localhost:3000` (desenvolvimento)

## 🔐 Autenticação

### Registro de Cliente
```http
POST /auth/register
```
**Body:**
```json
{
  "nome": "string",
  "email": "string",
  "senha": "string"
}
```
**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "nome": "string",
      "email": "string",
      "role": "client"
    },
    "token": "string"
  }
}
```

### Login de Cliente
```http
POST /auth/login
```
**Body:**
```json
{
  "email": "string",
  "senha": "string"
}
```
**Resposta:** Mesmo formato do registro

### Login de Admin
```http
POST /auth/admin/login
```
**Body:** Mesmo formato do login de cliente

## 📝 Onboarding

### Criar/Atualizar Onboarding
```http
POST /onboarding/create
```
**Headers:**
```
Authorization: Bearer {token}
```
**Body:**
```json
{
  "dadosPessoais": {
    "cpf": "string",
    "telefone": "string",
    "dataNascimento": "YYYY-MM-DD",
    "endereco": {
      "cep": "string",
      "logradouro": "string",
      "numero": "string",
      "complemento": "string",
      "bairro": "string",
      "cidade": "string",
      "estado": "string"
    }
  }
}
```

### Buscar Onboarding por ID
```http
GET /onboarding/:userId
```
**Headers:**
```
Authorization: Bearer {token}
```

### Editar Onboarding (Admin)
```http
PUT /onboarding/:id
```
**Headers:**
```
Authorization: Bearer {token}
```
**Body:**
```json
{
  "status": "pendente|em_analise|aprovado|reprovado",
  "observacoes": "string"
}
```

### Upload de Arquivo
```http
POST /onboarding/files/add
```
**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```
**Body:**
```
file: File (PDF, JPEG, PNG, DOC, DOCX - max 10MB)
tipoDocumento: string (opcional, para metadados)
```
**Armazenamento:**
Os arquivos enviados são salvos diretamente no MongoDB usando GridFS, no bucket `uploads`. Cada arquivo recebe um nome único e metadados, incluindo o tipo de documento e o nome original.

### Download de Arquivo
```http
GET /onboarding/files/:id
```
**Headers:**
```
Authorization: Bearer {token}
```
**Descrição:**
Faz o download do arquivo diretamente do MongoDB GridFS usando o `fileId`.

### Listar Todos os Onboardings (Admin)
```http
GET /onboarding
```
**Headers:**
```
Authorization: Bearer {token}
```

### Excluir Onboarding (Admin)
```http
DELETE /onboarding/:id
```
**Headers:**
```
Authorization: Bearer {token}
```

## 📋 Estrutura de Dados

### User
```typescript
{
  id: string;
  nome: string;
  email: string;
  role: "admin" | "client";
  ativo: boolean;
  criadoEm: Date;
}
```

### Onboarding
```typescript
{
  id: string;
  user: string | User;
  status: "pendente" | "em_analise" | "aprovado" | "reprovado";
  documentos: Array<{
    fileId: string;
    filename: string;
    contentType: string;
    uploadedAt: Date;
    bucket: string; // geralmente 'uploads'
    metadata?: {
      originalname: string;
      tipoDocumento?: string;
    }
  }>;
  dadosPessoais: {
    cpf: string;
    telefone: string;
    dataNascimento: Date;
    endereco: {
      cep: string;
      logradouro: string;
      numero: string;
      complemento: string;
      bairro: string;
      cidade: string;
      estado: string;
    }
  };
  observacoes: string;
  atualizadoPor: string | User;
  createdAt: Date;
  updatedAt: Date;
}
```

## ⚠️ Códigos de Erro

- `400`: Requisição inválida
- `401`: Não autorizado (token inválido/expirado)
- `403`: Proibido (sem permissão)
- `404`: Recurso não encontrado
- `500`: Erro interno do servidor

## 🔒 Notas de Segurança

1. Todas as rotas (exceto registro e login) requerem token JWT
2. Token deve ser enviado no header `Authorization: Bearer {token}`
3. Arquivos têm limite de 10MB
4. Tipos de arquivo permitidos: PDF, JPEG, PNG, DOC, DOCX
5. Cliente só pode acessar próprios dados
6. Rotas admin requerem token de admin

## 📱 Exemplo de uso com Axios

```typescript
// Configuração base
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email: string, senha: string) => {
  const response = await api.post('/auth/login', { email, senha });
  const { token, user } = response.data.data;
  localStorage.setItem('token', token);
  return user;
};

// Criar onboarding
const createOnboarding = async (dados: any) => {
  const response = await api.post('/onboarding/create', dados);
  return response.data.data;
};

// Upload de arquivo
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/onboarding/files/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data;
};
```