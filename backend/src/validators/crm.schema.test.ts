import { describe, it, expect } from 'vitest';
import { CrmRecordSchema, AiMappingResponseSchema } from './crm.schema';

describe('CRM Schema Validation', () => {
  it('should accept valid crm_status enum values', () => {
    const validData = {
      email: 'test@example.com',
      crm_status: 'GOOD_LEAD_FOLLOW_UP',
    };
    const result = CrmRecordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid crm_status enum values', () => {
    const invalidData = {
      email: 'test@example.com',
      crm_status: 'NOT_A_VALID_STATUS',
    };
    const result = CrmRecordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept empty string as valid email (as per schema logic for missing)', () => {
    const validData = {
      email: '',
    };
    const result = CrmRecordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  it('should validate full response payload correctly', () => {
    const payload = {
      records: [
        {
          name: 'John Doe',
          email: 'john@example.com',
          data_source: 'leads_on_demand',
          created_at: '2026-05-13T14:20:48Z'
        },
        {
          mobile_without_country_code: '9876543210',
          country_code: '+91'
        }
      ]
    };
    
    const result = AiMappingResponseSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.records.length).toBe(2);
    }
  });
});
