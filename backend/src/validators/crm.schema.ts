import { z } from 'zod';

export const CrmStatusEnum = z.enum([
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
]);

export const DataSourceEnum = z.enum([
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
  ''
]);

export const CrmRecordSchema = z.object({
  created_at: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  country_code: z.string().optional(),
  mobile_without_country_code: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  lead_owner: z.string().optional(),
  crm_status: CrmStatusEnum.optional(),
  crm_note: z.string().optional(),
  data_source: DataSourceEnum.optional(),
  possession_time: z.string().optional(),
  description: z.string().optional(),
});

export const AiMappingResponseSchema = z.object({
  records: z.array(CrmRecordSchema),
});

export type CrmRecord = z.infer<typeof CrmRecordSchema>;
