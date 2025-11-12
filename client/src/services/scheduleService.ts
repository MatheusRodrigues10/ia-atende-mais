import { ReserveSlotPayload, ReserveSlotResult, ScheduleEntry } from '@/types/schedule';

const STORAGE_KEY = 'ia-atende-mais-schedules';
const EVENT_NAME = 'schedule:updated';

const safeWindow = (): Window | undefined => {
  if (typeof window === 'undefined') return undefined;
  return window;
};

const readSchedules = (): ScheduleEntry[] => {
  const win = safeWindow();
  if (!win) return [];

  try {
    const raw = win.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as ScheduleEntry[];
    if (!Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.warn('Falha ao ler agendamentos do storage', error);
    return [];
  }
};

const writeSchedules = (entries: ScheduleEntry[]) => {
  const win = safeWindow();
  if (!win) return;
  try {
    win.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Falha ao salvar agendamentos no storage', error);
  }
};

const emitUpdate = () => {
  const win = safeWindow();
  if (!win) return;
  win.dispatchEvent(new CustomEvent(EVENT_NAME));
};

const normalizeDate = (input: string | Date): string => {
  const date = input instanceof Date ? input : new Date(input);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().split('T')[0]!;
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `schedule_${Math.random().toString(36).slice(2, 10)}`;
};

const nowIso = () => new Date().toISOString();

export const scheduleService = {
  listar(): ScheduleEntry[] {
    return readSchedules();
  },

  listarPorData(data: string | Date): ScheduleEntry[] {
    const normalized = normalizeDate(data);
    return readSchedules().filter((item) => item.data === normalized);
  },

  buscarPorUsuario(userId: string): ScheduleEntry | undefined {
    return readSchedules().find((item) => item.userId === userId);
  },

  isHorarioDisponivel(data: string | Date, horario: string, userId?: string): boolean {
    const normalized = normalizeDate(data);
    return !readSchedules().some(
      (item) =>
        item.data === normalized &&
        item.horario === horario &&
        (userId ? item.userId !== userId : true),
    );
  },

  reservar(payload: ReserveSlotPayload): ReserveSlotResult {
    const { userId, clienteNome, data, horario } = payload;
    const normalizedData = normalizeDate(data);
    const schedules = readSchedules();
    const existente = schedules.find((item) => item.userId === userId);

    const ocupadoPorOutro = schedules.some(
      (item) => item.data === normalizedData && item.horario === horario && item.userId !== userId,
    );

    if (ocupadoPorOutro) {
      return {
        success: false,
        message: 'Horário indisponível. Escolha outro horário.',
      };
    }

    const agora = nowIso();

    if (existente) {
      existente.data = normalizedData;
      existente.horario = horario;
      existente.clienteNome = clienteNome;
      existente.atualizadoEm = agora;
    } else {
      schedules.push({
        id: generateId(),
        userId,
        clienteNome,
        data: normalizedData,
        horario,
        criadoEm: agora,
        atualizadoEm: agora,
      });
    }

    writeSchedules(schedules);
    emitUpdate();

    return {
      success: true,
      schedule: schedules.find((item) => item.userId === userId),
    };
  },

  liberar(userId: string) {
    const schedules = readSchedules();
    const filtrados = schedules.filter((item) => item.userId !== userId);
    if (filtrados.length === schedules.length) return;
    writeSchedules(filtrados);
    emitUpdate();
  },

  atualizarClienteNome(userId: string, clienteNome: string) {
    const schedules = readSchedules();
    const existente = schedules.find((item) => item.userId === userId);
    if (!existente) return;
    existente.clienteNome = clienteNome;
    existente.atualizadoEm = nowIso();
    writeSchedules(schedules);
    emitUpdate();
  },

  subscribe(callback: (entries: ScheduleEntry[]) => void) {
    const win = safeWindow();
    if (!win) return () => {};

    const handler = () => {
      callback(readSchedules());
    };

    win.addEventListener(EVENT_NAME, handler);
    return () => {
      win.removeEventListener(EVENT_NAME, handler);
    };
  },
};

export type ScheduleService = typeof scheduleService;

