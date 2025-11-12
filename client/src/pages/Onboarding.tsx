import { FileUpload } from '@/components/FileUpload';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Textarea } from '@/components/ui/textarea';
import { getCurrentUser } from '@/services/authService';
import { createOnboarding, deleteOnboardingFile, getOnboardingByUserId, updateOnboarding, uploadOnboardingFile } from '@/services/onboardingService';
import { scheduleService } from '@/services/scheduleService';
import {
  CommunicationAndChannel,
  DocumentoTipo,
  DocumentoUpload,
  IntelligentAgent,
  IntegrationsAndSettings,
  RepresentanteLegal,
} from '@/types/onboarding';
import { ScheduleEntry } from '@/types/schedule';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const HORARIOS_VALIDOS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const formatDateKey = (date?: Date) => {
  if (!date) return '';
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().split('T')[0] || '';
};

const parseDateKey = (key?: string) => {
  if (!key) return undefined;
  const [year, month, day] = key.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const toIsoDateMidday = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy.toISOString();
};

const parseScheduleDateValue = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parseDateKey(formatDateKey(parsed));
};

const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const DOCS_COMUNICACAO = [
  'communication_and_channel',
  'numero_whatsapp_oficial',
  'configuracao_meta_business',
  'templates_mensagem',
];

const DOCS_INTELLIGENT_AGENT = [
  'intelligent_agent',
  'perfil_visual',
  'nome_identidade_agente',
  'base_conhecimento',
  'jornada_conversacional',
];

const DOCS_INTEGRATIONS = [
  'integrations_and_settings',
  'crm',
  'relatorios_dashboards',
  'outras_integracoes',
];

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
  const [documentosExistentes, setDocumentosExistentes] = useState<DocumentoUpload[]>([]);

  // Seções avançadas
  const [numeroWhatsappOficial, setNumeroWhatsappOficial] = useState('');
  const [metaScheduleDate, setMetaScheduleDate] = useState<Date | undefined>(undefined);
  const [metaScheduleTime, setMetaScheduleTime] = useState('');
  const [templatesMensagem, setTemplatesMensagem] = useState('');
  const [communicationFiles, setCommunicationFiles] = useState<File[]>([]);
  const [scheduleErro, setScheduleErro] = useState<string | null>(null);

  const [nomeIdentidadeAgente, setNomeIdentidadeAgente] = useState('');
  const [baseConhecimento, setBaseConhecimento] = useState('');
  const [jornadaConversacional, setJornadaConversacional] = useState('');
  const [intelligentAgentFiles, setIntelligentAgentFiles] = useState<File[]>([]);

  const [crm, setCrm] = useState('');
  const [relatoriosDashboards, setRelatoriosDashboards] = useState('');
  const [outrasIntegracoes, setOutrasIntegracoes] = useState('');
  const [integrationsFiles, setIntegrationsFiles] = useState<File[]>([]);

  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);

  const aplicarCommunicationAndChannelData = (data?: CommunicationAndChannel | null) => {
    setNumeroWhatsappOficial(data?.numeroWhatsappOficial || '');
    const scheduleData = data?.metaBusinessSchedule?.data;
    const parsedDate = parseScheduleDateValue(scheduleData);
    setMetaScheduleDate(parsedDate);
    setMetaScheduleTime(data?.metaBusinessSchedule?.horario || '');
    setTemplatesMensagem(data?.templatesMensagem || '');
  };

  const aplicarIntelligentAgentData = (data?: IntelligentAgent | null) => {
    setNomeIdentidadeAgente(data?.nomeIdentidadeAgente || '');
    setBaseConhecimento(data?.baseConhecimento || '');
    setJornadaConversacional(data?.jornadaConversacional || '');
  };

  const aplicarIntegrationsAndSettingsData = (data?: IntegrationsAndSettings | null) => {
    setCrm(data?.crm || '');
    setRelatoriosDashboards(data?.relatoriosDashboards || '');
    setOutrasIntegracoes(data?.outrasIntegracoes || '');
  };

  useEffect(() => {
    setSchedules(scheduleService.listar());
    const unsubscribe = scheduleService.subscribe((entries) => setSchedules(entries));
    return () => {
      unsubscribe();
    };
  }, []);

  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const horariosPorData = useMemo(() => {
    return schedules.reduce<Record<string, Set<string>>>((acc, item) => {
      if (!acc[item.data]) {
        acc[item.data] = new Set();
      }
      acc[item.data].add(item.horario);
      return acc;
    }, {});
  }, [schedules]);

  const userSchedule = useMemo(() => {
    if (!user) return undefined;
    return schedules.find((item) => item.userId === user.id);
  }, [schedules, user?.id]);

  useEffect(() => {
    if (!userSchedule) return;
    if (userSchedule.data) {
      const currentKey = formatDateKey(metaScheduleDate);
      if (currentKey !== userSchedule.data) {
        const parsed = parseDateKey(userSchedule.data);
        if (parsed) setMetaScheduleDate(parsed);
      }
    }
    if (userSchedule.horario && metaScheduleTime !== userSchedule.horario) {
      setMetaScheduleTime(userSchedule.horario);
    }
  }, [userSchedule, metaScheduleDate, metaScheduleTime]);

  useEffect(() => {
    if (!userSchedule && metaScheduleTime) {
      setMetaScheduleTime('');
    }
  }, [userSchedule, metaScheduleTime]);

  const loadExistingData = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      const preloadedData = (location.state as any)?.preloadData;
      let data = preloadedData;

      if (!data) {
        data = await getOnboardingByUserId(currentUser.id);
      }

      if (!data) return;

      setOnboardingId(data.id || null);
      setRazaoSocial(data.razaoSocial || '');
      setNomeFantasia(data.nomeFantasia || '');
      setCnpj(data.cnpj || '');
      setInscricaoEstadual(data.inscricaoEstadual || '');
      setInscricaoMunicipal(data.inscricaoMunicipal || '');
      setLogradouro(data.endereco?.logradouro || '');
      setNumero(data.endereco?.numero || '');
      setComplemento(data.endereco?.complemento || '');
      setBairro(data.endereco?.bairro || '');
      setCidade(data.endereco?.cidade || '');
      setEstado(data.endereco?.estado || '');
      setCep(data.endereco?.cep || '');
      setRepresentantes(data.representantesLegais || []);
      setContatoOpNome(data.contatoOperacional?.nome || '');
      setContatoOpCargo(data.contatoOperacional?.cargo || '');
      setContatoOpTelefone(data.contatoOperacional?.telefone || '');
      setContatoOpEmail(data.contatoOperacional?.email || '');
      setContatoFinNome(data.contatoFinanceiro?.nome || '');
      setContatoFinCargo(data.contatoFinanceiro?.cargo || '');
      setContatoFinTelefone(data.contatoFinanceiro?.telefone || '');
      setContatoFinEmail(data.contatoFinanceiro?.email || '');
      setDocumentosExistentes(data.documentos || []);
      aplicarCommunicationAndChannelData(data.communicationAndChannel || null);
      aplicarIntelligentAgentData(data.intelligentAgent || null);
      aplicarIntegrationsAndSettingsData(data.integrationsAndSettings || null);

      const scheduleInfo = data.communicationAndChannel?.metaBusinessSchedule;
      if (scheduleInfo?.data && scheduleInfo?.horario) {
        scheduleService.reservar({
          userId: currentUser.id,
          clienteNome: data.nomeFantasia || data.razaoSocial || currentUser.nome || 'Cliente',
          data: scheduleInfo.data,
          horario: scheduleInfo.horario,
        });
      }
    } catch (error) {
      console.log('Nenhum onboarding encontrado, iniciando novo');
    } finally {
      setDataLoaded(true);
    }
  };

  const isBeforeTomorrow = (date: Date) => {
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    return candidate.getTime() < tomorrow.getTime();
  };

  const diaEstaLotado = (date: Date) => {
    const key = formatDateKey(date);
    if (!key) return true;
    if (userSchedule && userSchedule.data === key) return false;
    const ocupados = horariosPorData[key];
    if (!ocupados) return false;
    return ocupados.size >= HORARIOS_VALIDOS.length;
  };

  const horarioEstaIndisponivel = (dateKey: string, horario: string) => {
    const ocupados = horariosPorData[dateKey];
    if (!ocupados) return false;
    if (userSchedule && userSchedule.data === dateKey && userSchedule.horario === horario) {
      return false;
    }
    return ocupados.has(horario);
  };

  const handleSelecionarData = (date?: Date) => {
    setScheduleErro(null);
    if (!date) {
      setMetaScheduleDate(undefined);
      return;
    }
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    if (isBeforeTomorrow(normalized)) {
      toast.error('Selecione uma data a partir das 9h do dia seguinte.');
      return;
    }
    if (isWeekend(normalized)) {
      toast.error('Agendamentos disponíveis apenas de segunda a sexta-feira.');
      return;
    }
    setMetaScheduleDate(normalized);
  };

  const handleSelecionarHorario = (horario: string) => {
    if (!user) return;
    if (!metaScheduleDate) {
      setScheduleErro('Selecione uma data antes do horário.');
      return;
    }

    const dateKey = formatDateKey(metaScheduleDate);

    if (horarioEstaIndisponivel(dateKey, horario)) {
      const mensagem = 'Horário indisponível, escolha outro horário.';
      setScheduleErro(mensagem);
      toast.error(mensagem);
      return;
    }

    const resultado = scheduleService.reservar({
      userId: user.id,
      clienteNome: nomeFantasia || razaoSocial || user.nome || 'Cliente',
      data: metaScheduleDate,
      horario,
    });

    if (!resultado.success) {
      const mensagem = resultado.message || 'Não foi possível reservar o horário.';
      setScheduleErro(mensagem);
      toast.error(mensagem);
      return;
    }

    setScheduleErro(null);
    setMetaScheduleTime(horario);
    toast.success('Horário reservado com sucesso!');
  };

  const handleLiberarHorario = () => {
    if (!user) return;
    scheduleService.liberar(user.id);
    setMetaScheduleDate(undefined);
    setMetaScheduleTime('');
    setScheduleErro(null);
    toast.success('Horário liberado.');
  };

  const scheduleResumo = useMemo(() => {
    if (!metaScheduleDate || !metaScheduleTime) return '';
    try {
      const dataFormatada = metaScheduleDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return `${dataFormatada} às ${metaScheduleTime}`;
    } catch {
      return '';
    }
  }, [metaScheduleDate, metaScheduleTime]);

  const diaSelecionadoKey = formatDateKey(metaScheduleDate);

  const documentosPorTipos = (tipos: string | string[]) => {
    const lista = Array.isArray(tipos) ? tipos : [tipos];
    return documentosExistentes
      .map((doc, index) => ({ doc, index }))
      .filter(({ doc }) => {
        const tipoDoc = doc.tipoDocumento || doc.tipo;
        return tipoDoc && lista.includes(tipoDoc);
      });
  };

  const possuiDocumento = (tipos: string | string[]) => documentosPorTipos(tipos).length > 0;

  const renderDocumentosExistentes = (tipos: string | string[]) =>
    documentosPorTipos(tipos).map(({ doc, index }) => (
      <div
        key={doc.fileId || doc.id || `${doc.tipoDocumento || doc.tipo}-${index}`}
        className="mb-3 flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/30 text-sm"
      >
        <span className="text-foreground truncate pr-4">{doc.filename || doc.nome}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!(doc.fileId || doc.id)}
          onClick={() => {
            const fileIdentifier = doc.fileId || doc.id;
            if (!fileIdentifier) return;
            removeDocumentoExistente(fileIdentifier, index);
          }}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ));

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
        communicationAndChannel: {
          numeroWhatsappOficial: numeroWhatsappOficial || '',
          templatesMensagem: templatesMensagem || '',
          metaBusinessSchedule:
            metaScheduleDate && metaScheduleTime
              ? {
                  data: toIsoDateMidday(metaScheduleDate),
                  horario: metaScheduleTime,
                }
              : null,
        },
        intelligentAgent: {
          nomeIdentidadeAgente: nomeIdentidadeAgente || '',
          baseConhecimento: baseConhecimento || '',
          jornadaConversacional: jornadaConversacional || '',
        },
        integrationsAndSettings: {
          crm: crm || '',
          relatoriosDashboards: relatoriosDashboards || '',
          outrasIntegracoes: outrasIntegracoes || '',
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
      const uploadFiles = async (files: File[], tipo: DocumentoTipo, tipoLabel: string) => {
        const results: DocumentoUpload[] = [];
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
      const documentosComunicacao = await uploadFiles(
        communicationFiles,
        'communication_and_channel',
        'Comunicação e Canal Oficial'
      );
      const documentosAgente = await uploadFiles(
        intelligentAgentFiles,
        'intelligent_agent',
        'Agente Inteligente'
      );
      const documentosIntegracoes = await uploadFiles(
        integrationsFiles,
        'integrations_and_settings',
        'Integrações e Parametrizações'
      );

      // Combinar todos os documentos
      const todosOsDocumentos = [
        ...documentosContratoSocial,
        ...documentosRgCpf,
        ...documentosComprovanteEndereco,
        ...documentosLogotipo,
        ...documentosComunicacao,
        ...documentosAgente,
        ...documentosIntegracoes,
      ];

      // Atualizar estado local com novos documentos
      setDocumentosExistentes([...documentosExistentes, ...todosOsDocumentos]);

      if (communicationFiles.length) setCommunicationFiles([]);
      if (intelligentAgentFiles.length) setIntelligentAgentFiles([]);
      if (integrationsFiles.length) setIntegrationsFiles([]);

      scheduleService.atualizarClienteNome(
        user.id,
        nomeFantasia || razaoSocial || user.nome || 'Cliente'
      );

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

          {/* Bloco 5 - Comunicação e Canal Oficial */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-card">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Comunicação e Canal Oficial
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Configure os canais de atendimento que serão utilizados pela IA e organize o agendamento
              inicial com a equipe Meta.
            </p>

            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Número oficial do WhatsApp
                  </label>
                  {possuiDocumento(DOCS_COMUNICACAO) && (
                    <span className="text-xs text-green-500 font-semibold">✓ Já enviado</span>
                  )}
                </div>
                <MaskedInput
                  mask="(99) 99999-9999"
                  value={numeroWhatsappOficial}
                  onChange={(e) => setNumeroWhatsappOficial(e.target.value)}
                  className="bg-secondary border-border"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Configuração Meta / Business Manager
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Escolha um horário disponível a partir das 9h do dia seguinte.
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
                  <div className="border border-border rounded-lg p-4 bg-secondary/40">
                    <Calendar
                      mode="single"
                      selected={metaScheduleDate}
                      onSelect={handleSelecionarData}
                      disabled={(date) => isBeforeTomorrow(date) || isWeekend(date) || diaEstaLotado(date)}
                      initialFocus
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Horários disponíveis</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {HORARIOS_VALIDOS.map((horario) => {
                        const dateKey = diaSelecionadoKey;
                        const disabled =
                          !metaScheduleDate || !dateKey || horarioEstaIndisponivel(dateKey, horario);
                        const selecionado = metaScheduleTime === horario;
                        return (
                          <Button
                            key={horario}
                            type="button"
                            variant={selecionado ? 'default' : 'outline'}
                            disabled={disabled}
                            onClick={() => handleSelecionarHorario(horario)}
                            className={
                              selecionado ? 'bg-primary text-primary-foreground hover:bg-primary' : undefined
                            }
                          >
                            {horario}
                          </Button>
                        );
                      })}
                    </div>
                    {scheduleResumo && (
                      <p className="text-sm text-foreground">
                        Horário selecionado: <span className="font-semibold">{scheduleResumo}</span>
                      </p>
                    )}
                    {scheduleErro && <p className="text-sm text-destructive">{scheduleErro}</p>}
                    {userSchedule && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleLiberarHorario}
                        className="w-fit"
                      >
                        Remover agendamento
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Templates de mensagem</label>
                <Textarea
                  value={templatesMensagem}
                  onChange={(e) => setTemplatesMensagem(e.target.value)}
                  className="bg-secondary border-border min-h-[120px]"
                  placeholder="Descreva os templates atuais e requisitos específicos."
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Anexos (Comunicação e Canal Oficial)
                </p>
                {renderDocumentosExistentes(DOCS_COMUNICACAO)}
                <FileUpload
                  label="Adicionar anexo (PDF, JPG ou PNG até 10 MB)"
                  files={communicationFiles}
                  onChange={setCommunicationFiles}
                  accept=".pdf,.jpg,.jpeg,.png"
                  documentType="communication_and_channel"
                />
              </div>
            </div>
          </div>

          {/* Bloco 6 - Agente Inteligente */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-card">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Agente Inteligente (IA Conversacional)
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Detalhe a personalidade do agente virtual e forneça materiais que apoiem a criação das
              respostas.
            </p>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Nome e identidade do agente</label>
                <Input
                  value={nomeIdentidadeAgente}
                  onChange={(e) => setNomeIdentidadeAgente(e.target.value)}
                  className="bg-secondary border-border"
                  placeholder="Assistente IA Atende Mais"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Base de conhecimento</label>
                <Textarea
                  value={baseConhecimento}
                  onChange={(e) => setBaseConhecimento(e.target.value)}
                  className="bg-secondary border-border min-h-[120px]"
                  placeholder="Liste conteúdos, FAQs ou materiais que devem ser considerados."
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Jornada conversacional</label>
                <Textarea
                  value={jornadaConversacional}
                  onChange={(e) => setJornadaConversacional(e.target.value)}
                  className="bg-secondary border-border min-h-[120px]"
                  placeholder="Descreva o fluxo ideal de atendimento e principais etapas."
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Perfil visual (anexo opcional)
                </p>
                {renderDocumentosExistentes(DOCS_INTELLIGENT_AGENT)}
                <FileUpload
                  label="Adicionar anexo (PDF, JPG ou PNG até 10 MB)"
                  files={intelligentAgentFiles}
                  onChange={setIntelligentAgentFiles}
                  accept=".pdf,.jpg,.jpeg,.png"
                  documentType="intelligent_agent"
                />
              </div>
            </div>
          </div>

          {/* Bloco 7 - Integrações e Parametrizações */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-card">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Integrações e Parametrizações
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Informe as ferramentas utilizadas e os relatórios necessários para que possamos preparar as
              integrações.
            </p>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">CRM</label>
                <Input
                  value={crm}
                  onChange={(e) => setCrm(e.target.value)}
                  className="bg-secondary border-border"
                  placeholder="Ex.: HubSpot, RD Station"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Relatórios e dashboards</label>
                <Textarea
                  value={relatoriosDashboards}
                  onChange={(e) => setRelatoriosDashboards(e.target.value)}
                  className="bg-secondary border-border min-h-[120px]"
                  placeholder="Quais indicadores e formatos de relatório são relevantes?"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Outras integrações</label>
                <Textarea
                  value={outrasIntegracoes}
                  onChange={(e) => setOutrasIntegracoes(e.target.value)}
                  className="bg-secondary border-border min-h-[100px]"
                  placeholder="Ex.: Google Agenda, Outlook, outras ferramentas."
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Anexos (Integrações e Parametrizações)
                </p>
                {renderDocumentosExistentes(DOCS_INTEGRATIONS)}
                <FileUpload
                  label="Adicionar anexo (PDF, JPG ou PNG até 10 MB)"
                  files={integrationsFiles}
                  onChange={setIntegrationsFiles}
                  accept=".pdf,.jpg,.jpeg,.png"
                  documentType="integrations_and_settings"
                />
              </div>
            </div>
          </div>

          {/* Documentos Complementares */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-card">
            <h3 className="text-xl font-semibold text-foreground mb-6 pb-3 border-b border-border">
              Documentos Complementares
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-foreground">Contrato Social</label>
                  {possuiDocumento('contrato_social') && (
                    <span className="text-xs text-green-500 font-semibold">✓ Já enviado</span>
                  )}
                </div>
                {renderDocumentosExistentes('contrato_social')}
                <FileUpload
                  label="Anexar documento (opcional)"
                  files={contratoSocial}
                  onChange={setContratoSocial}
                  documentType="contrato_social"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-foreground">RG/CPF</label>
                  {possuiDocumento('rg_cpf') && (
                    <span className="text-xs text-green-500 font-semibold">✓ Já enviado</span>
                  )}
                </div>
                {renderDocumentosExistentes('rg_cpf')}
                <FileUpload
                  label="Anexar documento (opcional)"
                  files={rgCpf}
                  onChange={setRgCpf}
                  documentType="rg_cpf"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-foreground">Comprovante de Endereço</label>
                  {possuiDocumento('comprovante_endereco') && (
                    <span className="text-xs text-green-500 font-semibold">✓ Já enviado</span>
                  )}
                </div>
                {renderDocumentosExistentes('comprovante_endereco')}
                <FileUpload
                  label="Anexar documento (opcional)"
                  files={comprovanteEndereco}
                  onChange={setComprovanteEndereco}
                  documentType="comprovante_endereco"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-foreground">
                    Logotipo e Identidade Visual
                  </label>
                  {possuiDocumento('logotipo') && (
                    <span className="text-xs text-green-500 font-semibold">✓ Já enviado</span>
                  )}
                </div>
                {renderDocumentosExistentes('logotipo')}
                <FileUpload
                  label="Anexar arquivo (PNG, JPG ou SVG)"
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
