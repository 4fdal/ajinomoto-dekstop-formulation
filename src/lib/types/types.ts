export interface IBodyFormulationLines {
  toleranceGroupingHeaderId: string;
  productCode: string;
  productName: string;
  targetMass: string;
  min: string;
  max: string;
  toleranceType: string;
  maxAllowedWeighingQty: string;
  implementToleranceGrouping: boolean;
  instruction: string;
}

export interface IProductWeightBridge {
  id: string;
  uuid: string;
  code: string;
  name: string;
  mass: number;
  UnitId: string;
  Unit: Category;
  tare: number;
  CategoryId: string;
  Category: Category;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  uuid: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  multiplier?: number;
}

export interface IToleranceGroupings {
  id: string;
  groupingName: string;
  defaultToleranceType: string;
  defaultMin: number;
  defaulMax: number;
  createdAt: Date;
  updatedAt: Date;
  ToleranceGroupingLines: ToleranceGroupingLine[];
}

export interface ToleranceGroupingLine {
  id: string;
  ToleranceGroupingHeaderId: string;
  lowerRange: number;
  upperRange: number;
  toleranceType: string;
  min: number;
  max: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportLogger {
  id: string;
  formulationReportLinesId: string;
  mass: number;
  productBatchNumber: string;
  operator: string;
  appId: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToleranceGroupingLines {
  lowerRange: number;
  upperRange: number;
  toleranceType: string;
  min: number;
  max: number;
}

export type Formulation = {
  id: number;
  uuid: string;
  code: string;
  name: string;
  num_material: number;
  formulation_lines: any; // bisa diganti tipe spesifik jika ada
  total_weight_formula: number;
  approve_sm: boolean;
  approve_fom: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BatchProduction = {
  id: number;
  uuid: string;
  code: string;
  formulation_report: any; // bisa diganti tipe spesifik jika ada
  formulation_code: string;
  formulation: Formulation;
  formulation_name: string;
  schedule_date: string;
  status: string;
  total_batch_produced: number;
  action: string;
  created_at: string;
  updated_at: string;
};

export type FormulationReportHeader = {
  id: string;
  uuid: string;
  batchProductionId: number;
  BatchProduction: BatchProduction;
  formulationCode: string;
  formulationName: string;
  totalIngredient: number;
  requestedMass: number;
  actualMass: number;
  multiplier: number;
  orderNumber: string;
  batchNumber: string;
  status: number;
  totalWeightFormula: number;
  approveSm: boolean;
  approveFom: boolean;
  needApproval: boolean;
  approvalStatus: number;
  dateExecution: string | null;
  dateFinish: string | null;
  createdAt: string;
  updatedAt: string;
  FormulationReportLines: any; // bisa diganti tipe array kalau ada datanya
};

export type Container = {
  id: number;
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  is_active: boolean | null;
  mac_address: string;
  imei: string;
  ip_address: string;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FormulationReportLine = {
  id: string;
  uuid: string;
  FormulationReportHeaderId: string;
  FormulationReportHeader: FormulationReportHeader;
  containerId: number;
  container: Container;
  containerName: string;
  materialCode: string;
  materialName: string;
  applicationId: number;
  min: number;
  max: number;
  globalTolerance: boolean;
  application: Application;
  targetMass: number;
  actualMass: number;
  unit: string;
  judgement: number;
  status: number;
  needApproval: boolean;
  approvalStatus: number;
  instruction: string;
  sequence: number;
  createdAt: string;
  updatedAt: string;
  FormulationReportWeighingLoggers: any; // bisa diganti jika detail tersedia
};

export interface Group {
  id: number;
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RawMaterial {
  id: number;
  uuid: string;
  group_id: number;
  Group: Group;
  code: string;
  name: string;
  no_sap: string;
  unique_code: string;
  material_name: string;
  supplier: string;
  manufacturer: string;
  weight_per_packge: number;
  minimum_stock: number;
  photo_material_package: string;
  photo_material_visual: string;
  created_at: string;
  updated_at: string;
}

export interface RawMaterialStock {
  id: number;
  uuid: string;
  rm_code: string;
  raw_material_usage_logs: any | null;
  raw_material: RawMaterial;
  rm_name: string;
  supplier: string;
  manufacturer: string;
  group_id: number;
  group: Group;
  lot_number: string;
  stock: number;
  initial_package: number;
  expired_date: string;
  minimum_buffer_stock: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export type ScaleDevice = {
  Baudrate: string;
  ClearCommand: string;
  ConnectionType: 'Serial'; // sesuaikan jika ada opsi lain
  Databit: number;
  Delimiter: string;
  FractionDigit: string; // jika ingin sebagai angka, ubah ke: number
  ID: number | string | null | undefined;
  IP: string;
  Name: string;
  Parity: 'None'; // sesuaikan jika ada opsi lain
  Port: string;
  PrintCommand: string;
  ScaleCategory: string;
  TareCommand: string;
  Unit: string;
  ZeroCommand: string;
};

export type WeighingLoggerRequest = {
  formulationReportLinesId: string | null;
  mass: number | null;
  productBatchNumber: string | null;
  operator: string | null;
  notes: string | null;
  appId: string | null;
  supplier: string | null;
  manufacturer: string | null;
  remark: string | null;
  containerName: string | null;
};
