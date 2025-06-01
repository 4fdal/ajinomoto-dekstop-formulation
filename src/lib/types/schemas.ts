import { z } from 'zod';

export const AuthFormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  password: z.string(),
});

export const WorkOrderSchema = z.object({
  work_order: z.string().min(1, {
    message: 'work order must be filled.',
  }),
  formulation_code: z.string().min(2, {
    message: 'formulation code order must be filled',
  }),
  formulation_name: z.string().optional(),
  order_qty: z.string().min(1, {
    message: 'order quantity must be must be filled.',
  }),
  multiplier: z.string()
});

export const FormulationSchema = z.object({
  formulation_code: z.string().min(2, {
    message: 'Formulation code must be filled.',
  }),
  formulation_name: z.string().min(2, {
    message: 'formulation name must be filled',
  }),
  total_mass: z.coerce.number().optional(),
  total_ingredient: z.coerce.number(),
  must_follow_order: z.boolean(),
  status: z.string(),
});

export const FormulationLinesSchema = z.object({
  toleranceGroupingHeaderId: z.string().min(2, {
    message: 'Tolerance grouping must be filled',
  }),
  productName: z.string(),
  productCode: z.string().min(2, {
    message: 'Material Code must be filled',
  }),
  targetMass: z.string().min(1),
  min: z.string().min(1), // coerce translates from string to number in zod
  max: z.string().min(1),
  toleranceType: z.string().min(1, {
    message: 'Tolerance Type must be filled',
  }),
  maxAllowedWeighingQty: z.string().min(1),
  implementToleranceGrouping: z.boolean(),
  instruction: z.string().optional(),
});

export const SettingsFormSchema = z.object({
  scale_url: z
    .string()
    .min(2, { message: 'Scale URL must be filled' }),
  websocket_url: z
    .string()
    .min(2, { message: 'Websocket URL must be filled' }),
  service_url: z
    .string()
    .min(2, { message: 'Service URL must be filled' }),
  printer_url: z
    .string()
    .min(2, { message: 'Printer URL must be filled' }),
  application_id: z
    .string({ message: 'Value must be number' })
    .min(2, { message: 'Application ID must be filled' }),
  fractional_digit: z.coerce
    .number({
      invalid_type_error: 'Value must be a number',
    })
    .min(1, { message: 'Fractional digin must be filled' }),
  implement_auto_save_time_weight_in_tolerance: z.string(),
  auto_save_time_weight_in_tolerance: z.coerce.number({
    invalid_type_error: 'Value must be a number',
  }),
  implement_auto_save_time_weight_out_of_tolerance:
    z.string(),
  auto_save_time_weight_out_of_tolerance: z.coerce.number({
    invalid_type_error: 'Value must be a number',
  }),
  enable_virtual_keyboard: z.boolean(),
  implement_manual_work_order: z.boolean(),
  enable_client_creation: z.boolean(),
  enable_outweight_rejection: z.boolean(),
  enable_overweight_protection: z.boolean(),
  enable_scan_product_code: z.boolean(),
});

export const ProductSchema = z.object({
  name: z.string().min(2, {
    message: 'Material name must be at least 2 characters',
  }),
  code: z.string().min(2, {
    message: 'Material code must be at least 2 characters',
  }),
  unit_id: z.string().min(1, {
    message: 'Unit name must be at least 2 characters',
  }),
});

export const ToleranceGroupingSchema = z.object({
  groupingName: z.string().min(1, {
    message: 'Grouping name must be filled',
  }),
  defaultMin: z.string().min(1, {
    message: 'Default min must be filled',
  }),
  defaultMax: z.string().min(1, {
    message: 'Default max must be filled',
  }),
  toleranceType: z.string().min(1, {
    message: 'Tolerance type must be filled',
  }),
});

export const ToleranceGroupingLinesSchema = z.object({
  lowerRange: z.string().min(1, {
    message: 'Lower range must be filled',
  }),
  upperRange: z.string().min(1, {
    message: 'Upper range must be filled',
  }),
  toleranceType: z.string().min(1, {
    message: 'Tolerance type must be filled',
  }),
  min: z.string().min(1, {
    message: 'Min must be filled',
  }),
  max: z.string().min(1, {
    message: 'Max must be filled',
  }),
});

export const MasterUserSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters',
  }),
  password: z.string().min(2, {
    message: 'Password must be at least 2 characters',
  }),
  roleId: z.string(),
});
