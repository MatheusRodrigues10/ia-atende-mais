import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/services/authService';
import { downloadOnboardingFile, getOnboardingByUserId } from '@/services/onboardingService';
import { OnboardingData } from '@/types/onboarding';
import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const PainelUsuario = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.tipo === 'admin') {
      navigate('/login');
      return;
    }

    // Evita chamadas infinitas
    if (user && !onboarding && loading) {
      loadOnboarding();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadOnboarding = async () => {
    if (!user) return;

    try {
      const data = await getOnboardingByUserId(user.id);
      setOnboarding(data);
    } catch (error) {
      console.error('Erro ao carregar onboarding:', error);
    } finally {
      setLoading(false);
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
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Nenhum onboarding encontrado
          </h2>
          <p className="text-muted-foreground mb-8">
            Complete seu onboarding para acessar o painel
          </p>
          <Button onClick={() => navigate('/onboarding')} className="bg-primary hover:bg-primary/90">
            Iniciar Onboarding
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'em_analise':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejeitado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'Aprovado';
      case 'em_analise':
        return 'Em Análise';
      case 'rejeitado':
        return 'Rejeitado';
      default:
        return 'Rascunho';
    }
  };

  const formatSchedule = (schedule?: { data?: string; horario?: string }) => {
    if (!schedule || !schedule.data || !schedule.horario) return '-';
    try {
      const dateObj = new Date(schedule.data);
      if (Number.isNaN(dateObj.getTime())) {
        return `Horário: ${schedule.horario}`;
      }
      return `${dateObj.toLocaleDateString('pt-BR')} às ${schedule.horario}`;
    } catch {
      return schedule.horario || '-';
    }
  };

  const documentosPorTipos = (tipos: string | string[]) => {
    const lista = Array.isArray(tipos) ? tipos : [tipos];
    return onboarding.documentos.filter((doc) => {
      const tipo = doc.tipoDocumento || doc.tipo;
      return tipo ? lista.includes(tipo) : false;
    });
  };

  const renderListaDocumentos = (tipos: string | string[], titulo: string) => {
    const docs = documentosPorTipos(tipos);
    if (docs.length === 0) return null;

    return (
      <div>
        <h4 className="font-medium text-foreground mb-3">{titulo}</h4>
        <div className="space-y-2">
          {docs.map((doc, index) => (
            <div
              key={`${doc.fileId || doc.id || doc.filename}-${index}`}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{doc.filename || doc.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.uploadedAt || doc.dataUpload
                    ? `Enviado em ${new Date(doc.uploadedAt || doc.dataUpload).toLocaleDateString('pt-BR')}`
                    : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() => {
                  downloadOnboardingFile(doc.fileId || doc.id || '')
                    .then((blob: Blob) => {
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = doc.filename || doc.nome || 'arquivo';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    })
                    .catch(() => {
                      alert('Erro ao baixar arquivo');
                    });
                }}
              >
                Baixar
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const communication = onboarding.communicationAndChannel;
  const intelligentAgent = onboarding.intelligentAgent;
  const integrations = onboarding.integrationsAndSettings;

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Meu Painel</h2>
            <p className="text-muted-foreground">Visualize e edite suas informações</p>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`px-4 py-2 rounded-lg border font-medium ${getStatusColor(onboarding.status)}`}
            >
              {getStatusLabel(onboarding.status)}
            </span>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => navigate('/onboarding', { state: { preloadData: onboarding } })}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar Informações
            </Button>
          </div>
        </div>

        {/* Dados Cadastrais */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-card mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
            Dados Cadastrais da Empresa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Razão Social</p>
              <p className="text-foreground font-medium">{onboarding.razaoSocial}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Nome Fantasia</p>
              <p className="text-foreground font-medium">{onboarding.nomeFantasia}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">CNPJ</p>
              <p className="text-foreground font-medium">{onboarding.cnpj}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Inscrição Estadual</p>
              <p className="text-foreground font-medium">{onboarding.inscricaoEstadual || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Inscrição Municipal</p>
              <p className="text-foreground font-medium">{onboarding.inscricaoMunicipal || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted-foreground mb-1">Endereço</p>
              <p className="text-foreground font-medium">
                {onboarding.endereco.logradouro}, {onboarding.endereco.numero}
                {onboarding.endereco.complemento && ` - ${onboarding.endereco.complemento}`}
                <br />
                {onboarding.endereco.bairro}, {onboarding.endereco.cidade} -{' '}
                {onboarding.endereco.estado}
                <br />
                CEP: {onboarding.endereco.cep}
              </p>
            </div>
          </div>
        </div>

        {/* Representantes Legais */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-card mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
            Representantes Legais
          </h3>
          <div className="space-y-4">
            {onboarding.representantesLegais.map((rep, index) => (
              <div key={rep.id} className="bg-secondary/50 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-3">Representante {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Nome</p>
                    <p className="text-foreground font-medium">{rep.nome}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">CPF</p>
                    <p className="text-foreground font-medium">{rep.cpf}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Cargo</p>
                    <p className="text-foreground font-medium">{rep.cargo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contatos */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-card mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
            Contatos
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Contato Operacional</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Nome</p>
                  <p className="text-foreground font-medium">{onboarding.contatoOperacional.nome}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Cargo</p>
                  <p className="text-foreground font-medium">{onboarding.contatoOperacional.cargo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Telefone</p>
                  <p className="text-foreground font-medium">{onboarding.contatoOperacional.telefone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">E-mail</p>
                  <p className="text-foreground font-medium">{onboarding.contatoOperacional.email}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h4 className="font-medium text-foreground mb-3">Contato Financeiro</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Nome</p>
                  <p className="text-foreground font-medium">{onboarding.contatoFinanceiro.nome}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Cargo</p>
                  <p className="text-foreground font-medium">{onboarding.contatoFinanceiro.cargo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Telefone</p>
                  <p className="text-foreground font-medium">{onboarding.contatoFinanceiro.telefone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">E-mail</p>
                  <p className="text-foreground font-medium">{onboarding.contatoFinanceiro.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Comunicação e Canal Oficial */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-card mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
          Comunicação e Canal Oficial
        </h3>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1">Número oficial do WhatsApp</p>
              <p className="text-foreground font-medium">
                {communication?.numeroWhatsappOficial || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Configuração Meta / Business Manager</p>
              <p className="text-foreground font-medium">
                {communication?.metaBusinessSchedule
                  ? formatSchedule(communication.metaBusinessSchedule)
                  : '-'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Templates de mensagem</p>
            <p className="text-foreground whitespace-pre-line">
              {communication?.templatesMensagem || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Agente Inteligente */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-card mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
          Agente Inteligente (IA Conversacional)
        </h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Nome e identidade do agente</p>
            <p className="text-foreground font-medium">
              {intelligentAgent?.nomeIdentidadeAgente || '-'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Base de conhecimento</p>
            <p className="text-foreground whitespace-pre-line">
              {intelligentAgent?.baseConhecimento || '-'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Jornada conversacional</p>
            <p className="text-foreground whitespace-pre-line">
              {intelligentAgent?.jornadaConversacional || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Integrações e Parametrizações */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-card mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
          Integrações e Parametrizações
        </h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">CRM</p>
            <p className="text-foreground font-medium">{integrations?.crm || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Relatórios e dashboards</p>
            <p className="text-foreground whitespace-pre-line">
              {integrations?.relatoriosDashboards || '-'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Outras integrações</p>
            <p className="text-foreground whitespace-pre-line">
              {integrations?.outrasIntegracoes || '-'}
            </p>
          </div>
        </div>
      </div>

        {/* Documentos Enviados */}
      {onboarding.documentos && onboarding.documentos.length > 0 && (
        <div className="bg-card p-6 rounded-xl border border-border shadow-card">
          <h3 className="text-xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
            Documentos Enviados
          </h3>
          <div className="space-y-6">
            {renderListaDocumentos(DOCS_COMUNICACAO, 'Comunicação e Canal Oficial')}
            {renderListaDocumentos(DOCS_INTELLIGENT_AGENT, 'Agente Inteligente')}
            {renderListaDocumentos(DOCS_INTEGRATIONS, 'Integrações e Parametrizações')}
            {renderListaDocumentos('contrato_social', 'Contrato Social')}
            {renderListaDocumentos('rg_cpf', 'RG/CPF')}
            {renderListaDocumentos('comprovante_endereco', 'Comprovante de Endereço')}
            {renderListaDocumentos('logotipo', 'Logotipo e Identidade Visual')}
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

export default PainelUsuario;
