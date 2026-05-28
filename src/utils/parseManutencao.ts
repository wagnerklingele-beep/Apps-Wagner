import type {
  MaintenanceOrder, MaintenanceTask, MaintenanceTechnician, MaintenanceMaterial,
} from '../types/manutencao';

const ORDER_RE = /^ (\d{2}\.\d{3}\.\d{3}) (\d{2}\/\d{2}\/\d{4})/;

function parseBR(s: string): number {
  return parseFloat(s.replace(',', '.')) || 0;
}

function normalizeStatus(raw: string): string {
  const t = raw.trim();
  if (t.startsWith('Finali')) return 'Finalizada';
  if (t.startsWith('Libera')) return 'Liberada';
  if (t.startsWith('Inicia')) return 'Iniciada';
  if (t.startsWith('Termin')) return 'Terminada';
  if (t.includes('In') || t.includes('in')) return 'Não Iniciada';
  return t || 'Desconhecido';
}

function isSkippable(line: string): boolean {
  if (!line.trim()) return false;
  if (/^-{10,}/.test(line.trim())) return true;
  if (line.includes('DATASUL') || line.includes('EMBACORP')) return true;
  if (/^\s+Ord Manut/.test(line) || /^\s+Alternativo/.test(line)) return true;
  if (/^\s+Parada\s+T/.test(line)) return true;
  if (/^\d{2}\/\d{2}\/\d{4}\s+-\s+\d{2}:\d{2}/.test(line.trim())) return true;
  return false;
}

function parseTasksFromLines(
  lines: string[], start: number, end: number,
): MaintenanceTask[] {
  const tasks: MaintenanceTask[] = [];
  const TASK_RE = /^ {21,25}(\d+) (\S.*)/;

  let i = start;
  while (i < end) {
    const line = lines[i];
    if (isSkippable(line)) { i++; continue; }

    const tm = line.match(TASK_RE);
    if (!tm) { i++; continue; }

    const taskNum = parseInt(tm[1]);
    const taskDesc = tm[2].trim();
    i++;

    let specialty = '', specialtyDescription = '', workers = 0;
    let reportedTime = 0, closed = false, conclusionPct = 0;
    const technicians: MaintenanceTechnician[] = [];
    const materials: MaintenanceMaterial[] = [];
    const shifts: string[] = [];

    while (i < end) {
      const ln = lines[i];
      if (TASK_RE.test(ln)) break;
      if (isSkippable(ln)) { i++; continue; }

      // Specialty line 1: "                          EIA 1   TÉCNICO...   1  0  1" or "CALD  CALDEREIRO..."
      const specM = ln.match(
        /^ {24,28}([A-Z]{2,6}(?:\s+\d)?)\s{2,}(.+?)\s{3,}(\d+)\s+\d+\s+\d+/,
      );
      if (specM) {
        specialty = specM[1].trim();
        specialtyDescription = specM[2].trim();
        workers = parseInt(specM[3]);
        i++; continue;
      }

      // Specialty line 2: "Individual  X,XXXX  X,XXXX  Sim/Não  XX,XX  Normal"
      const spec2M = ln.match(/Individual\s+([\d,]+)\s+([\d,]+)\s+(\S+)\s+([\d,]+)/);
      if (spec2M) {
        reportedTime = parseBR(spec2M[2]);
        closed = spec2M[3].startsWith('Sim');
        conclusionPct = parseBR(spec2M[4]);
        i++; continue;
      }

      // Technician: "                                    19059-0   DINIS...   06/05/2026   0,2500"
      const techM = ln.match(
        /^ {34,38}(\d{4,6}-\d)\s{2,}(.+?)\s{3,}(\d{2}\/\d{2}\/\d{4})\s+([\d,]+)/,
      );
      if (techM) {
        technicians.push({
          id: techM[1],
          name: techM[2].trim(),
          date: techM[3],
          hours: parseBR(techM[4]),
        });
        i++; continue;
      }

      // Material: "                                    555487   SENSOR...   1,0000 UN"
      const matM = ln.match(
        /^ {34,38}(\d{5,8})\s{2,}(.+?)\s{3,}([\d,]+)\s+(\w{2,3})\s*$/,
      );
      if (matM) {
        const mat: MaintenanceMaterial = {
          item: matM[1],
          description: matM[2].trim(),
          quantity: parseBR(matM[3]),
          unit: matM[4],
        };
        materials.push(mat);
        i++; continue;
      }

      // Shift: "                                        1 ADMINISTRATIVO..."
      const shiftM = ln.match(/^ {38,42}(\d) (.+)/);
      if (shiftM) {
        shifts.push(shiftM[2].trim());
        i++; continue;
      }

      i++;
    }

    tasks.push({
      number: taskNum,
      description: taskDesc,
      specialty,
      specialtyDescription,
      workers,
      reportedTime,
      closed,
      conclusionPct,
      technicians,
      materials,
      shifts,
    });
  }

  return tasks;
}

function parseBlock(lines: string[], start: number, end: number): MaintenanceOrder | null {
  const h0 = lines[start] ?? '';
  const h1 = lines[start + 1] ?? '';
  const h2 = lines[start + 2] ?? '';
  const h3 = lines[start + 3] ?? '';

  const id = h0.substring(1, 11).trim();
  if (!id) return null;

  const date = h0.substring(12, 22).trim();
  const altRaw = h0.substring(23, 34).trim().split(/\s+/)[0] ?? '';
  const altMaintenance = /^[A-Z]{2,}-/.test(altRaw) ? altRaw : '';
  const description = h0.substring(34, 77).trim();
  const rightParts = h0.substring(77).trim().split(/\s{2,}/).filter(Boolean);
  const equipment = rightParts[0] ?? '';
  const family = rightParts[1] ?? '';
  const status = normalizeStatus(rightParts[2] ?? '');
  const planner = rightParts[3] ?? '';

  const l1raw = h1.length > 28 ? h1.substring(28) : h1;
  const l1parts = l1raw.trim().split(/\s{2,}/).filter(Boolean);
  const equipmentDescription = l1parts[0] ?? '';
  const businessUnit = l1parts[1] ?? '';
  const tag = l1parts[2] ?? '';
  const est = l1parts[3] ?? '';
  const costCenter = l1parts[4] ?? '';

  const prioM = h2.match(/(\d{2,4})\s*$/);
  const priority = prioM ? parseInt(prioM[1]) : 0;

  const stopRaw = h3.substring(9, 11).trim();
  const stopDays = /^\d+$/.test(stopRaw) ? parseInt(stopRaw) : 0;
  const edM = h3.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
  const endDate = edM ? edM[1] : '';
  const teamM = h3.match(/\b(\d{2}-[A-Z]{2}-\d{2})\b/);

  let team = '', responsible = '';
  let maintenanceType = '', cause = '', symptom = '', intervention = '';

  if (teamM) {
    team = teamM[1];
    const afterTeam = h3.substring((teamM.index ?? 0) + team.length).trim();
    const respM = afterTeam.match(/^(.+?)\s{5,}(.*)/s);
    if (respM) {
      responsible = respM[1].trim();
      const tf = respM[2].trim().split(/\s+/).filter(Boolean);
      maintenanceType = tf[0] ?? '';
      cause = tf[1] ?? '';
      symptom = tf[2] ?? '';
      intervention = tf[3] ?? '';
    } else {
      responsible = afterTeam.trim();
    }
  }

  const tasks = parseTasksFromLines(lines, start + 4, end);
  const totalReportedHours = tasks.reduce((sum, t) => sum + t.reportedTime, 0);

  return {
    id, date, altMaintenance, description, equipment, family, status, planner,
    equipmentDescription, businessUnit, tag, est, costCenter, priority,
    stopDays, endDate, team, responsible, maintenanceType, cause, symptom, intervention,
    tasks, totalReportedHours,
  };
}

export function parseManutencaoFile(content: string): MaintenanceOrder[] {
  // Normalize Windows line endings and form-feed characters
  const lines = content.replace(/\r/g, '').replace(/\f/g, '').split('\n');
  const starts: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (ORDER_RE.test(lines[i])) starts.push(i);
  }

  const orders: MaintenanceOrder[] = [];
  for (let s = 0; s < starts.length; s++) {
    const start = starts[s];
    const end = s + 1 < starts.length ? starts[s + 1] : lines.length;
    const order = parseBlock(lines, start, end);
    if (order) orders.push(order);
  }

  return orders;
}
