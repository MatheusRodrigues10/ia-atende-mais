import { FileUpload } from '@/components/FileUpload';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { getCurrentUser } from '@/services/authService';
import { createOnboarding, deleteOnboardingFile, getOnboardingByUserId, updateOnboarding, uploadOnboardingFile } from '@/services/onboardingService';
import { RepresentanteLegal } from '@/types/onboarding';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [onboardingId, setOnboardingId] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.tipo === 'admin') {
      navigate('/login');
      return;
    }

    // Carregar dados existentes se houver (usa getCurrentUser internamente)
    loadExistingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Dados Cadastrais
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');

  // Representantes
  const [representantes, setRepresentantes] = useState<RepresentanteLegal[]>([
    { id: '1', nome: '', cpf: '', cargo: '' }
  ]);

  // Contatos
  const [contatoOpNome, setContatoOpNome] = useState('');
  const [contatoOpCargo, setContatoOpCargo] = useState('');
  const [contatoOpTelefone, setContatoOpTelefone] = useState('');
  const [contatoOpEmail, setContatoOpEmail] = useState('');

  const [contatoFinNome, setContatoFinNome] = useState('');
  const [contatoFinCargo, setContatoFinCargo] = useState('');
  const [contatoFinTelefone, setContatoFinTelefone] = useState('');
  const [contatoFinEmail, setContatoFinEmail] = useState('');

  // Documentos
  const [contratoSocial, setContratoSocial] = useState<File[]>([]);
  const [rgCpf, setRgCpf] = useState<File[]>([]);
  const [comprovanteEndereco, setComprovanteEndereco] = useState<File[]>([]);
  const [logotipo, setLogotipo] = useState<File[]>([]);
  const [documentosExistentes, setDocumentosExistentes] = useState<any[]>([]);

  // Mapa de tipos de documentos para estado
  const tiposDocumentos = {
    contrato_social: { state: contratoSocial, setState: setContratoSocial, label: 'Contrato Social' },
    rg_cpf: { state: rgCpf, setState: setRgCpf, label: 'RG/CPF' },
    comprovante_endereco: { state: comprovanteEndereco, setState: setComprovanteEndereco, label: 'Comprovante de Endereço' },
    logotipo: { state: logotipo, setState: setLogotipo, label: 'Logotipo e Identidade Visual' }
  };

  const loadExistingData = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      // Verificar se há dados passados via location.state (do PainelUsuario)
      const preloadedData = (location.state as any)?.preloadData;

      if (preloadedData) {
        // Usar dados passados do estado
        const data = preloadedData;
        setOnboardingId(data.id || null);
        setRazaoSocial(data.razaoSocial);
        setNomeFantasia(data.nomeFantasia);
        setCnpj(data.cnpj);
        setInscricaoEstadual(data.inscricaoEstadual || '');
        setInscricaoMunicipal(data.inscricaoMunicipal || '');
        setLogradouro(data.endereco.logradouro);
        setNumero(data.endereco.numero);
        setComplemento(data.endereco.complemento || '');
        setBairro(data.endereco.bairro);
        setCidade(data.endereco.cidade);
        setEstado(data.endereco.estado);
        setCep(data.endereco.cep);
        setRepresentantes(data.representantesLegais);
        setContatoOpNome(data.contatoOperacional.nome);
        setContatoOpCargo(data.contatoOperacional.cargo);
        setContatoOpTelefone(data.contatoOperacional.telefone);
        setContatoOpEmail(data.contatoOperacional.email);
        setContatoFinNome(data.contatoFinanceiro.nome);
        setContatoFinCargo(data.contatoFinanceiro.cargo);
        setContatoFinTelefone(data.contatoFinanceiro.telefone);
        setContatoFinEmail(data.contatoFinanceiro.email);
        setDocumentosExistentes(data.documentos || []);
      } else {
        // Se não houver dados no estado, buscar do backend
        const data = await getOnboardingByUserId(currentUser.id);
        if (data) {
          setOnboardingId(data.id || null);
          setRazaoSocial(data.razaoSocial);
          setNomeFantasia(data.nomeFantasia);
          setCnpj(data.cnpj);
          setInscricaoEstadual(data.inscricaoEstadual || '');
          setInscricaoMunicipal(data.inscricaoMunicipal || '');
          setLogradouro(data.endereco.logradouro);
          setNumero(data.endereco.numero);
          setComplemento(data.endereco.complemento || '');
          setBairro(data.endereco.bairro);
          setCidade(data.endereco.cidade);
          setEstado(data.endereco.estado);
          setCep(data.endereco.cep);
          setRepresentantes(data.representantesLegais);
          setContatoOpNome(data.contatoOperacional.nome);
          setContatoOpCargo(data.contatoOperacional.cargo);
          setContatoOpTelefone(data.contatoOperacional.telefone);
          setContatoOpEmail(data.contatoOperacional.email);
          setContatoFinNome(data.contatoFinanceiro.nome);
          setContatoFinCargo(data.contatoFinanceiro.cargo);
          setContatoFinTelefone(data.contatoFinanceiro.telefone);
          setContatoFinEmail(data.contatoFinanceiro.email);
          setDocumentosExistentes(data.documentos || []);
        }
      }
    } catch (error) {
      console.log('Nenhum onboarding encontrado, iniciando novo');
    } finally {
      setDataLoaded(true);
    }
  };

  const addRepresentante = () => {
    setRepresentantes([
      ...representantes,
      { id: Date.now().toString(), nome: '', cpf: '', cargo: '' }
    ]);
  };

  const removeRepresentante = (id: string) => {
    setRepresentantes(representantes.filter(r => r.id !== id));
  };

  const removeDocumentoExistente = async (fileId: string, index: number) => {
    try {
      await deleteOnboardingFile(fileId);
      setDocumentosExistentes(documentosExistentes.filter((_, i) => i !== index));
      toast.success('Documento removido com sucesso');
    } catch (error) {
      toast.error('Erro ao remover documento');
    }
  };

  const updateRepresentante = (id: string, field: keyof RepresentanteLegal, value: string) => {
    setRepresentantes(representantes.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setLoadingMessage('Salvando dados cadastrais...');

    try {
      // Monta payload com dados cadastrais
      const payload = {
        dadosCadastrais: {
          razaoSocial,
          nomeFantasia,
          cnpj,
          inscricaoEstadual,
          inscricaoMunicipal,
        },
        endereco: {
          cep,
          logradouro,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
        },
        representantesLegais: representantes.map(({ id, ...rest }) => rest),
        contatoOperacional: {
          nome: contatoOpNome,
          cargo: contatoOpCargo,
          telefone: contatoOpTelefone,
          email: contatoOpEmail,
        },
        contatoFinanceiro: {
          nome: contatoFinNome,
          cargo: contatoFinCargo,
          telefone: contatoFinTelefone,
          email: contatoFinEmail,
        },
        observacoes: '',
        documentos: [],
      };

      // Passo 1: Criar ou atualizar onboarding com dados cadastrais
      let onboardingIdResponse: string;
      if (onboardingId) {
        setLoadingMessage('Atualizando dados cadastrais...');
        await updateOnboarding(onboardingId, payload as any);
        onboardingIdResponse = onboardingId;
      } else {
        setLoadingMessage('Criando cadastro...');
        const response = await createOnboarding(payload as any);
        onboardingIdResponse = response.id;
        setOnboardingId(onboardingIdResponse);
      }

      toast.success('Dados salvos! Enviando arquivos...');

      // Passo 2: Fazer upload dos arquivos em sequência
      const uploadFiles = async (files: File[], tipo: string, tipoLabel: string) => {
        const results: any[] = [];
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          try {
            setLoadingMessage(`Enviando ${tipoLabel} (${i + 1}/${files.length})...`);
            const uploaded = await uploadOnboardingFile(f, tipo);
            results.push({
              fileId: uploaded.fileId || uploaded.id || uploaded._id || uploaded._id_str || null,
              filename: uploaded.filename || uploaded.originalname || f.name,
              contentType: uploaded.contentType || uploaded.mimetype || f.type,
              tipoDocumento: uploaded.tipoDocumento || tipo,
              uploadedAt: uploaded.uploadedAt || new Date(),
            });
            toast.success(`Arquivo "${f.name}" enviado com sucesso!`);
          } catch (error) {
            toast.error(`Erro ao enviar "${f.name}"`);
            console.error('Erro no upload:', error);
          }
        }
        return results;
      };

      // Upload em sequência de cada tipo de documento
      const documentosContratoSocial = await uploadFiles(contratoSocial, 'contrato_social', 'Contrato Social');
      const documentosRgCpf = await uploadFiles(rgCpf, 'rg_cpf', 'RG/CPF');
      const documentosComprovanteEndereco = await uploadFiles(comprovanteEndereco, 'comprovante_endereco', 'Comprovante de Endereço');
      const documentosLogotipo = await uploadFiles(logotipo, 'logotipo', 'Logotipo');

      // Combinar todos os documentos
      const todosOsDocumentos = [
        ...documentosContratoSocial,
        ...documentosRgCpf,
        ...documentosComprovanteEndereco,
        ...documentosLogotipo,
      ];

      // Atualizar estado local com novos documentos
      setDocumentosExistentes([...documentosExistentes, ...todosOsDocumentos]);

      setLoadingMessage('');
      toast.success('Onboarding salvo com sucesso!');
      navigate('/painel-usuario');
    } catch (error) {
      console.error('Erro geral:', error);
      setLoadingMessage('');
      toast.error('Erro ao salvar onboarding');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground font-medium mb-2">{loadingMessage || 'Processando...'}</p>
            <p className="text-muted-foreground text-sm">Por favor, aguarde enquanto processamos seus dados</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Onboarding</h2>
          <p className="text-muted-foreground">
            Preencha todos os dados para finalizar seu cadastro
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bloco 1 - Dados Cadastrais */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-card">
            <h3 className="text-xl font-semibold text-foreground mb-6 pb-3 border-b border-border">
              Dados Cadastrais da Empresa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Razão Social *
                </label>
                <Input
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome Fantasia *
                </label>
                <Input
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">CNPJ *</label>
                <MaskedInput
                  mask="99.999.999/9999-99"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  required
                  className="bg-secondary border-border"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Inscrição Estadual
                </label>
                <Input
                  value={inscricaoEstadual}
                  onChange={(e) => setInscricaoEstadual(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Inscrição Municipal
                </label>
                <Input
                  value={inscricaoMunicipal}
                  onChange={(e) => setInscricaoMunicipal(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Logradouro *
                </label>
                <Input
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Número *</label>
                <Input
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Complemento
                </label>
                <Input
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bairro *</label>
                <Input
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cidade *</label>
                <Input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Estado *</label>
                <Input
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  required
                  className="bg-secondary border-border"
                  maxLength={2}
                  placeholder="SP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">CEP *</label>
                <MaskedInput
                  mask="99999-999"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  required
                  className="bg-secondary border-border"
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          {/* Bloco 2 - Representantes Legais */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-card">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
              <h3 className="text-xl font-semibold text-foreground">Representantes Legais</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRepresentante}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="space-y-4">
              {representantes.map((rep, index) => (
                <div key={rep.id} className="bg-secondary/50 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-foreground">Representante {index + 1}</h4>
                    {representantes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRepresentante(rep.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nome *
                      </label>
                      <Input
                        value={rep.nome}
                        onChange={(e) => updateRepresentante(rep.id, 'nome', e.target.value)}
                        required
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        CPF *
                      </label>
                      <MaskedInput
                        mask="999.999.999-99"
                        value={rep.cpf}
                        onChange={(e) => updateRepresentante(rep.id, 'cpf', e.target.value)}
                        required
                        className="bg-background border-border"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Cargo / Função *
                      </label>
                      <Input
                        value={rep.cargo}
                        onChange={(e) => updateRepresentante(rep.id, 'cargo', e.target.value)}
                        required
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloco 3 - Contato Operacional */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-card">
            <h3 className="text-xl font-semibold text-foreground mb-6 pb-3 border-b border-border">
              Contato Operacional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome *</label>
                <Input
                  value={contatoOpNome}
                  onChange={(e) => setContatoOpNome(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cargo / Área *
                </label>
                <Input
                  value={contatoOpCargo}
                  onChange={(e) => setContatoOpCargo(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Telefone / WhatsApp *
                </label>
                <MaskedInput
                  mask="(99) 99999-9999"
                  value={contatoOpTelefone}
                  onChange={(e) => setContatoOpTelefone(e.target.value)}
                  required
                  className="bg-secondary border-border"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">E-mail *</label>
                <Input
                  type="email"
                  value={contatoOpEmail}
                  onChange={(e) => setContatoOpEmail(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
            </div>
          </div>

          {/* Bloco 4 - Contato Financeiro */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-card">
            <h3 className="text-xl font-semibold text-foreground mb-6 pb-3 border-b border-border">
              Contato Financeiro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome *</label>
                <Input
                  value={contatoFinNome}
                  onChange={(e) => setContatoFinNome(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cargo / Área *
                </label>
                <Input
                  value={contatoFinCargo}
                  onChange={(e) => setContatoFinCargo(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Telefone / WhatsApp *
                </label>
                <MaskedInput
                  mask="(99) 99999-9999"
                  value={contatoFinTelefone}
                  onChange={(e) => setContatoFinTelefone(e.target.value)}
                  required
                  className="bg-secondary border-border"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  E-mail para envio da NF *
                </label>
                <Input
                  type="email"
                  value={contatoFinEmail}
                  onChange={(e) => setContatoFinEmail(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>
            </div>
          </div>

          {/* Bloco 5 - Documentos */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-card">
            <h3 className="text-xl font-semibold text-foreground mb-6 pb-3 border-b border-border">
              Documentos Complementares
            </h3>

            <div className="space-y-6">
              {/* Contrato Social */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-foreground">Contrato Social</label>
                  {documentosExistentes.some(d => d.tipoDocumento === 'contrato_social') && (
                    <span className="text-xs text-green-500 font-semibold">✓ Já enviado</span>
                  )}
                </div>
                {documentosExistentes.filter(d => d.tipoDocumento === 'contrato_social').map((doc, idx) => (
                  <div key={idx} className="mb-3 flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/30 text-sm">
                    <span className="text-foreground">{doc.filename || doc.nome}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocumentoExistente(doc.fileId || doc.id, documentosExistentes.indexOf(doc))}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <FileUpload
                  label=""
                  files={contratoSocial}
                  onChange={setContratoSocial}
                  documentType="contrato-social"
                />
              </div>

              {/* RG/CPF */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-foreground">RG/CPF</label>
                  {documentosExistentes.some(d => d.tipoDocumento === 'rg_cpf') && (
                    <span className="text-xs text-green-500 font-semibold">✓ Já enviado</span>
                  )}
                </div>
                {documentosExistentes.filter(d => d.tipoDocumento === 'rg_cpf').map((doc, idx) => (
                  <div key={idx} className="mb-3 flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/30 text-sm">
                    <span className="text-foreground">{doc.filename || doc.nome}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocumentoExistente(doc.fileId || doc.id, documentosExistentes.indexOf(doc))}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <FileUpload label="" files={rgCpf} onChange={setRgCpf} documentType="rg-cpf" />
              </div>

              {/* Comprovante de Endereço */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-foreground">Comprovante de Endereço</label>
                  {documentosExistentes.some(d => d.tipoDocumento === 'comprovante_endereco') && (
                    <span className="text-xs text-green-500 font-semibold">✓ Já enviado</span>
                  )}
                </div>
                {documentosExistentes.filter(d => d.tipoDocumento === 'comprovante_endereco').map((doc, idx) => (
                  <div key={idx} className="mb-3 flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/30 text-sm">
                    <span className="text-foreground">{doc.filename || doc.nome}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocumentoExistente(doc.fileId || doc.id, documentosExistentes.indexOf(doc))}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <FileUpload label="" files={comprovanteEndereco} onChange={setComprovanteEndereco} documentType="comprovante-endereco" />
              </div>

              {/* Logotipo */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-foreground">Logotipo e Identidade Visual</label>
                  {documentosExistentes.some(d => d.tipoDocumento === 'logotipo') && (
                    <span className="text-xs text-green-500 font-semibold">✓ Já enviado</span>
                  )}
                </div>
                {documentosExistentes.filter(d => d.tipoDocumento === 'logotipo').map((doc, idx) => (
                  <div key={idx} className="mb-3 flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/30 text-sm">
                    <span className="text-foreground">{doc.filename || doc.nome}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocumentoExistente(doc.fileId || doc.id, documentosExistentes.indexOf(doc))}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <FileUpload
                  label=""
                  files={logotipo}
                  onChange={setLogotipo}
                  accept=".png,.jpg,.jpeg,.svg"
                  documentType="logotipo"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium"
            >
              {loading ? (loadingMessage || 'Salvando...') : 'Salvar Dados'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Onboarding;
