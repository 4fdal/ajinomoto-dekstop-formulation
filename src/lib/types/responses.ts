export interface RFormulations {
  formulationCode: string;
  formulationName: string;
  totalMass: number;
  totalIngredient: number;
  mustFollowOrder: boolean;
  status: number;
  FormulationLines: FormulationLine[];
}

export interface FormulationLine {
  toleranceGroupingHeaderId: string;
  productCode: string;
  productName: string;
  targetMass: number;
  actualMass: number;
  unit: string;
  min: number;
  max: number;
  toleranceType: string;
  maxAllowedWeighingQty: number;
  implementToleranceGrouping: boolean;
  instruction: string;
}

export interface ToleranceGroupingLine {
  id: string;
  ToleranceGroupingHeaderId: string;
  lowerRange: number;
  upperRange: number;
  toleranceType: string;
  min: number;
  max: number;
  createdAt: string;
  updatedAt: string;
}

export interface RFormulationReports {
  id: string;
  formulationCode: string;
  formulationName: string;
  formulationMass: number;
  totalIngredient: number;
  requestedMass: number;
  actualMass: number;
  multiplier: number;
  orderNumber: string;
  batchNumber: string;
  status: number;
  mustFollowOrder: boolean;
  needApproval: boolean;
  approvalStatus: number;
  createdAt: Date;
  updatedAt: Date;
  FormulationReportLines: IFormulationReportsLines[];
}

export interface IFormulationReportsLines {
  id: string;
  FormulationReportHeaderId: string;
  productCode: string;
  productName: string;
  targetMass: number;
  actualMass: number;
  unit: string;
  min: number;
  instruction: string;
  max: number;
  judgement: number;
  status: number;
  needApproval: boolean;
  approvalStatus: number;
  createdAt: Date;
  updatedAt: Date;
  FormulationReportWeighingLoggers: any[];
}

export interface RUnits {
  id: string;
  uuid: string;
  name: string;
  multiplier: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserLists {
  id: string;
  code: string;
  username: string;
  RoleId: string;
  Role: Role;
  ShiftId: string;
  Shift: Shift;
  RFIDCardCode: string;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: string;
  uuid: string;
  name: string;
  permissions: null;
  created_at: Date;
  updated_at: Date;
}

export interface IBodyToleranceGroupings {
  groupingName: string;
  defaultMin: number;
  defaultMax: number;
  ToleranceGroupingLines: ToleranceGroupingLine[];
}

export interface ToleranceGroupingLine {
  lowerRange: number;
  upperRange: number;
  toleranceType: string;
  min: number;
  max: number;
}

export interface Shift {
  id: string;
  uuid: string;
  name: string;
  startTime: Date;
  stopTime: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IBodyCreateFormulationLines
  extends RFormulationReports {}

export interface EditFormulationReports
  extends Omit<
    RFormulationReports,
    'actualMass' | 'FormulationReportLines'
  > {
  totalMass: number;
  FormulationLines: IFormulationReportsLines[];
}
