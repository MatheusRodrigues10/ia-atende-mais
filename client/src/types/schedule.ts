export interface ScheduleEntry {
  id: string;
  userId: string;
  clienteNome: string;
  data: string; // formato YYYY-MM-DD
  horario: string; // formato HH:mm
  criadoEm: string;
  atualizadoEm: string;
}

export interface ReserveSlotPayload {
  userId: string;
  clienteNome: string;
  data: string | Date;
  horario: string;
}

export interface ReserveSlotResult {
  success: boolean;
  message?: string;
  schedule?: ScheduleEntry;
}

