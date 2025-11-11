import { Header } from '@/components/Header';
import { OnboardingViewDialog } from '@/components/OnboardingViewDialog';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/services/authService';
import { deleteOnboarding, getAllOnboardings } from '@/services/onboardingService';
import { OnboardingData } from '@/types/onboarding';
import { Eye, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PainelAdmin = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [onboardings, setOnboardings] = useState<OnboardingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOnboarding, setSelectedOnboarding] = useState<OnboardingData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [onboardingToDelete, setOnboardingToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.tipo !== 'admin') {
      navigate('/login');
      return;
    }

    loadOnboardings();
  }, [user, navigate]);

  const loadOnboardings = async () => {
    try {
      const data = await getAllOnboardings();
      setOnboardings(data);
    } catch (error) {
      console.error('Erro ao carregar onboardings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onboardingToDelete) return;

    try {
      await deleteOnboarding(onboardingToDelete);
      toast.success('Onboarding excluído com sucesso');
      loadOnboardings();
      setDialogOpen(false);
      setOnboardingToDelete(null);
    } catch (error) {
      toast.error('Erro ao excluir onboarding');
    }
  };

  const openViewDialog = (onboarding: OnboardingData) => {
    setSelectedOnboarding(onboarding);
    setOnboardingToDelete(null);
    setDialogOpen(true);
  };

  const openDeleteDialog = (onboarding: OnboardingData) => {
    setSelectedOnboarding(onboarding);
    setOnboardingToDelete(onboarding.id);
    setDialogOpen(true);
  };

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

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return '-';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '-';
      return dateObj.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return '-';
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

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Painel Administrativo</h2>
          <p className="text-muted-foreground">Gerencie todos os onboardings do sistema</p>
        </div>

        {onboardings.length === 0 ? (
          <div className="bg-card p-12 rounded-xl border border-border shadow-card text-center">
            <p className="text-muted-foreground">Nenhum onboarding encontrado</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Empresa
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Responsável
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Data de Envio
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {onboardings.map((onboarding) => (
                    <tr key={onboarding.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{onboarding.nomeFantasia}</p>
                          <p className="text-sm text-muted-foreground">{onboarding.cnpj}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">
                          {onboarding.representantesLegais[0]?.nome || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-medium ${getStatusColor(
                            onboarding.status
                          )}`}
                        >
                          {getStatusLabel(onboarding.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {formatDate(onboarding.criadoEm || onboarding.dataCriacao)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            onClick={() => openViewDialog(onboarding)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(onboarding)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <OnboardingViewDialog
          onboarding={selectedOnboarding}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedOnboarding(null);
              setOnboardingToDelete(null);
            }
          }}
          onDelete={onboardingToDelete ? handleDelete : undefined}
          onStatusChange={loadOnboardings}
        />
      </main>
    </div>
  );
};

export default PainelAdmin;
