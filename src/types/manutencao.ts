export interface MaintenanceTechnician {
  id: string;
  name: string;
  date: string;
  hours: number;
}

export interface MaintenanceMaterial {
  item: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface MaintenanceTask {
  number: number;
  description: string;
  specialty: string;
  specialtyDescription: string;
  workers: number;
  reportedTime: number;
  closed: boolean;
  conclusionPct: number;
  technicians: MaintenanceTechnician[];
  materials: MaintenanceMaterial[];
  shifts: string[];
}

export interface MaintenanceOrder {
  id: string;
  date: string;
  altMaintenance: string;
  description: string;
  equipment: string;
  family: string;
  status: string;
  planner: string;
  equipmentDescription: string;
  businessUnit: string;
  tag: string;
  est: string;
  costCenter: string;
  priority: number;
  stopDays: number;
  endDate: string;
  team: string;
  responsible: string;
  maintenanceType: string;
  cause: string;
  symptom: string;
  intervention: string;
  tasks: MaintenanceTask[];
  totalReportedHours: number;
}
