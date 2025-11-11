import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { downloadOnboardingFile, updateOnboardingStatus } from '@/services/onboardingService';
import { OnboardingData } from '@/types/onboarding';
import { Download, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface OnboardingViewDialogProps {
  onboarding: OnboardingData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
  onStatusChange?: () => void;
}

export const OnboardingViewDialog = ({
  onboarding,
  open,
  onOpenChange,
  onDelete,
  onStatusChange,
}: OnboardingViewDialogProps) => {
  const [status, setStatus] = useState<'rascunho' | 'em_analise' | 'aprovado' | 'rejeitado'>(
    onboarding?.status || 'rascunho'
  );
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Sincroniza status quando onboarding muda
  useEffect(() => {
    if (onboarding?.status) {
      // Normaliza o status do backend para o formato esperado
      let normalizedStatus: 'rascunho' | 'em_analise' | 'aprovado' | 'rejeitado' = 'rascunho';
      const backendStatus = (onboarding.status as string).toLowerCase().replace(' ', '_');

      if (backendStatus === 'em_analise' || backendStatus === 'em_análise') {
        normalizedStatus = 'em_analise';
      } else if (backendStatus === 'aprovado') {
        normalizedStatus = 'aprovado';
      } else if (backendStatus === 'rejeitado') {
        normalizedStatus = 'rejeitado';
      } else if (backendStatus === 'rascunho') {
        normalizedStatus = 'rascunho';
      }

      setStatus(normalizedStatus);
    }
  }, [onboarding?.id, onboarding?.status]);

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onOpenChange(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!onboarding) return;
    setLoadingStatus(true);
    try {
      await updateOnboardingStatus(onboarding.id, newStatus as 'rascunho' | 'em_analise' | 'aprovado' | 'rejeitado');
      setStatus(newStatus as 'rascunho' | 'em_analise' | 'aprovado' | 'rejeitado');
      toast.success('Status atualizado com sucesso');
      if (onStatusChange) onStatusChange();
    } catch (error) {
      toast.error('Erro ao atualizar status');
      setStatus(onboarding.status);
    } finally {
      setLoadingStatus(false);
    }
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '-';
    try {
      let dateObj: Date;
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        dateObj = date;
      }

      // Verificar se data é válida
      if (isNaN(dateObj.getTime())) {
        return '-';
      }

      return dateObj.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };

  const documentosPorTipo = (tipoDocumento: string) => {
    return onboarding?.documentos.filter(doc => doc.tipoDocumento === tipoDocumento) || [];
  };

  const renderDocumentosByType = (tipoDocumento: string, label: string) => {
    const documentos = documentosPorTipo(tipoDocumento);
    if (documentos.length === 0) return null;

    return (
      <div key={tipoDocumento}>
        <h4 className="font-medium text-foreground mb-2">{label}</h4>
        <div className="space-y-2">
          {documentos.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-foreground">{doc.filename || doc.nome}</p>
                <p className="text-xs text-muted-foreground">
                  Enviado em {formatDate(doc.uploadedAt || doc.dataUpload)}
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
                    .catch(() => toast.error('Erro ao baixar arquivo'));
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!onboarding) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl">Detalhes do Onboarding</DialogTitle>
          <DialogDescription>
            Informações completas do cliente
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-6 px-6 py-6">
            {/* Status */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Status do Onboarding
              </h3>
              <div className="flex items-center gap-4">
                <Select value={status} onValueChange={handleStatusChange} disabled={loadingStatus}>
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Alterar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">🔵 Rascunho</SelectItem>
                    <SelectItem value="em_analise">🟡 Em Análise</SelectItem>
                    <SelectItem value="aprovado">🟢 Aprovado</SelectItem>
                    <SelectItem value="rejeitado">🔴 Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dados Cadastrais */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border">
                Dados Cadastrais
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <p className="text-foreground font-medium">
                    {onboarding.inscricaoEstadual || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Inscrição Municipal</p>
                  <p className="text-foreground font-medium">
                    {onboarding.inscricaoMunicipal || '-'}
                  </p>
                </div>
                <div className="col-span-2">
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

            {/* Representantes */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border">
                Representantes Legais
              </h3>
              <div className="space-y-3">
                {onboarding.representantesLegais.map((rep, index) => (
                  <div key={rep.id} className="bg-secondary/30 p-3 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Representante {index + 1}</h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Nome</p>
                        <p className="text-foreground">{rep.nome}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">CPF</p>
                        <p className="text-foreground">{rep.cpf}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Cargo</p>
                        <p className="text-foreground">{rep.cargo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contatos */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border">
                Contatos
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Contato Operacional</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Nome</p>
                      <p className="text-foreground">{onboarding.contatoOperacional.nome}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Cargo</p>
                      <p className="text-foreground">{onboarding.contatoOperacional.cargo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Telefone</p>
                      <p className="text-foreground">{onboarding.contatoOperacional.telefone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">E-mail</p>
                      <p className="text-foreground">{onboarding.contatoOperacional.email}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-2">Contato Financeiro</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Nome</p>
                      <p className="text-foreground">{onboarding.contatoFinanceiro.nome}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Cargo</p>
                      <p className="text-foreground">{onboarding.contatoFinanceiro.cargo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Telefone</p>
                      <p className="text-foreground">{onboarding.contatoFinanceiro.telefone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">E-mail</p>
                      <p className="text-foreground">{onboarding.contatoFinanceiro.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentos Enviados */}
            {onboarding.documentos && onboarding.documentos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border">
                  Documentos Enviados
                </h3>
                <div className="space-y-4">
                  {renderDocumentosByType('contrato_social', 'Contrato Social')}
                  {renderDocumentosByType('rg_cpf', 'RG/CPF')}
                  {renderDocumentosByType('comprovante_endereco', 'Comprovante de Endereço')}
                  {renderDocumentosByType('logotipo', 'Logotipo e Identidade Visual')}
                </div>
              </div>
            )}
          </div>
        </div>

        {onDelete && (
          <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Confirmar Exclusão
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
