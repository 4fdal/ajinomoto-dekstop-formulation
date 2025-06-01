import API from '~/lib/config/api';

import { vi } from 'vitest';
import { getFormulationCode } from '~/actions/formulation.action';
import { checkLicenseAction } from '~/actions/license.action';

describe('Utils function', () => {
  // Successfully updates formulation report with valid id and data
  it('should update formulation report when given valid id and data', async () => {
    const mockResponse = { data: { success: true } };
    const mockAPI = {
      protectedProcedure: vi
        .fn()
        .mockResolvedValue(mockResponse),
    };
    const patchFormulationReportsById = async ({
      id,
      unit,
      judgement,
      mass,
    }: {
      id: string;
      unit: string;
      judgement: number;
      mass: number | null;
    }) => {
      try {
        const response = await mockAPI.protectedProcedure({
          url: `/formulation-reports/${id}`,
          method: 'PUT',
          data: {
            mass,
            unit,
            productBatchNumber: 'PB123456',
            judgement,
          },
        });
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.log(error);
      }
    };
    const result = await patchFormulationReportsById({
      id: 'valid-id',
      unit: 'kg',
      judgement: 1,
      mass: 100,
    });
    expect(result).toEqual(mockResponse.data);
    expect(mockAPI.protectedProcedure).toHaveBeenCalledWith(
      {
        url: '/formulation-reports/valid-id',
        method: 'PUT',
        data: {
          mass: 100,
          unit: 'kg',
          productBatchNumber: 'PB123456',
          judgement: 1,
        },
      },
    );
  });
});

describe('Formulation', () => {
  // returns data when API call is successful
  it('should return data when API call is successful', async () => {
    const mockData = { data: 'mockData' };
    const mockAPI = {
      protectedProcedure: vi
        .fn()
        .mockResolvedValue({ data: mockData }),
    };
    vi.spyOn(API, 'protectedProcedure').mockImplementation(
      mockAPI.protectedProcedure,
    );

    const result = await getFormulationCode({
      formulationCode: 'testCode',
    });

    expect(result).toEqual(mockData);
    expect(API.protectedProcedure).toHaveBeenCalledWith({
      url: '/formulations/code/testCode',
    });
  });

  // handles empty formulationCode input
  it('should handle empty formulationCode input', async () => {
    const mockAPI = {
      protectedProcedure: vi
        .fn()
        .mockResolvedValue({ data: null }),
    };
    vi.spyOn(API, 'protectedProcedure').mockImplementation(
      mockAPI.protectedProcedure,
    );

    const result = await getFormulationCode({
      formulationCode: '',
    });

    expect(result).toBeUndefined();
    expect(API.protectedProcedure).toHaveBeenCalledWith({
      url: '/formulations/code/',
    });
  });
});

describe('License', () => {
  it('should return valid data when API call returns status 200', async () => {
    const mockData = { license: 'valid' };
    vi.spyOn(API, 'publicProcedure').mockResolvedValue({
      status: 200,
      data: mockData,
    });

    const result = await checkLicenseAction();

    expect(result).toEqual(mockData);
  });

  it('should return undefined when API call returns a status other than 200', async () => {
    vi.spyOn(API, 'publicProcedure').mockResolvedValue({
      status: 404,
    });

    const result = await checkLicenseAction();

    expect(result).toBeUndefined();
  });
});
