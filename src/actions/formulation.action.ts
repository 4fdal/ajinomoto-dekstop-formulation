import API from '~/lib/config/api';

import {
  getErrorMessage,
  getDefaultTauriStore,
} from '~/lib/helpers';
import { IBodyCreateFormulationLines } from '~/lib/types/responses';
import { Store } from 'tauri-plugin-store-api';
const store = new Store('.settings.dat');

import {
  RFormulationReports,
  RFormulations,
} from '~/lib/types/responses';

interface IPayloadCreateFormulatioin {
  work_order: string;
  formulation_code: string;
  order_qty: string;
  formulation_name?: string | undefined;
}

export async function getFormulationCode({
  formulationCode,
}: {
  formulationCode: string;
}) {
  try {
    const response = await API.protectedProcedure({
      url: `/formulations/code/${formulationCode}`,
    });

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getFormulations(): Promise<
  RFormulations | undefined
> {
  try {
    const res = await API.protectedProcedure({
      url: '/formulations',
    });

    if (res.status == 200) {
      return res.data.rows[0];
    }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAllFormulations(): Promise<
  RFormulationReports[] | undefined
> {
  try {
    const res = await API.protectedProcedure({
      url: '/formulations',
    });

    if (res.status == 200) {
      return res.data.rows;
    }
  } catch (error) {
    console.log(error);
    throw new Error(getErrorMessage(error));
  }
}

export async function getFormulationById(id: string) {
  try {
    const res = await API.protectedProcedure({
      url: `/formulations/${id}`,
    });

    if (res.status == 200) {
      return res.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getFormulationSuperAdmin() {
  try {
    const response = await API.protectedProcedure({
      url: `/formulations?all=true`,
    });

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function createFormulationReportsV2(
  data: IPayloadCreateFormulatioin,
): Promise<void | undefined> {
  try {
    const formattedRequestedMass = data.order_qty.replace(',', '.') // prettier-ignore
    const response = await API.protectedProcedure({
      url: '/formulation-reports',
      method: 'POST',
      data: {
        formulationCode: data.formulation_code,
        formulationName: data.formulation_name,
        requestedMass: parseFloat(formattedRequestedMass),
        orderNumber: data.work_order,
      },
    });
    if (response.data) {
      const filteredAndSortedWithLowestSequence =
        response.data.FormulationReportLines.sort(
          (a: any, b: any) => a.sequence - b.sequence,
        );
      response.data.FormulationReportLines = filteredAndSortedWithLowestSequence; // prettier-ignore
      const whitelistedProduct = await store.get<{ value: string }>(
        'tauri_whitelisted_product'
      ); // prettier-ignore
      if (
        whitelistedProduct == null ||
        whitelistedProduct.value == '' ||
        !whitelistedProduct.value
      ) {
        return response.data;
      }
      const splittedProducts =
        whitelistedProduct?.value?.split(',') || [];
      if (splittedProducts.length > 0) {
        response.data.FormulationReportLines =
          response.data.FormulationReportLines.filter(
            (item: any) =>
              splittedProducts.includes(item.productName),
          );
      }
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function patchFormulationReportsById({
  id,
  unit,
  judgement,
  mass,
  productBatchNumber,
  notes,
  appId,
  isDisableRejection,
}: {
  id: string;
  unit: string;
  judgement: number;
  productBatchNumber: string;
  mass: number | null;
  notes: string;
  appId: any;
  isDisableRejection: boolean;
}) {
  try {
    let url = `/formulation-reports/${id}`;
    if (isDisableRejection) {
      url += '?disableRejection=true';
    }
    const fractionalDigit = await getDefaultTauriStore<{
      value: number;
    }>('tauri_fractional_digit');
    const response = await API.protectedProcedure({
      url: url,
      method: 'PUT',
      data: {
        scaleFractionDigit: fractionalDigit?.value,
        mass,
        unit,
        productBatchNumber,
        judgement,
        appId,
        notes,
      },
    });

    if (response.data) {
      const filteredAndSortedWithLowestSequence =
        response.data.FormulationReportLines.sort(
          (a: any, b: any) => a.sequence - b.sequence,
        );
      response.data.FormulationReportLines = filteredAndSortedWithLowestSequence; // prettier-ignore
      const whitelistedProduct = await store.get<{ value: string }>(
        'tauri_whitelisted_product'
      ); // prettier-ignore
      if (
        whitelistedProduct == null ||
        whitelistedProduct.value == '' ||
        !whitelistedProduct.value
      ) {
        return response.data;
      }
      const splittedProducts =
        whitelistedProduct?.value?.split(',') || [];
      if (splittedProducts.length > 0) {
        response.data.FormulationReportLines =
          response.data.FormulationReportLines.filter(
            (item: any) =>
              splittedProducts.includes(item.productName),
          );
      }
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function createMasterFormulation(
  data: IBodyCreateFormulationLines,
) {
  try {
    const response = await API.protectedProcedure({
      url: '/formulations',
      method: 'POST',
      data,
    });

    if (response.status == 201) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function editMasterFormulation(
  data: IBodyCreateFormulationLines,
  editId: string,
) {
  try {
    const response = await API.protectedProcedure({
      url: `/formulations/${editId}`,
      method: 'PUT',
      data,
    });

    if (response.status == 200) {
      return { ...response.data, edit: true };
    }
  } catch (error) {
    console.log(error);
  }
}

export async function deleteMasterFormulation(id: string) {
  try {
    const response = await API.protectedProcedure({
      url: `/formulations/${id}`,
      method: 'DELETE',
    });

    if (response.status == 200) {
      return { ...response.data, edit: true };
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getFormulationReports() {
  try {
    const response = await API.protectedProcedure({
      url: `/formulation-reports`,
    });

    if (response.data) {
      return response.data?.rows[0]?.FormulationReportLines;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getFormulationBySearchTerm(
  searchTerm: string,
) {
  try {
    const response = await API.protectedProcedure({
      url: `/formulations?all=true&search=${searchTerm}`,
      method: 'GET',
    });

    if (response.status == 200) {
      return response.data?.rows;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function printAfterWeighing({
  body,
}: {
  body: any;
}) {
  const store = new Store('.settings.dat');
  try {
    const urlPrint = await store.get('tauri_printer_url') as { value: string } // prettier-ignore
    const printerName = await store.get('tauri_formulation_printer_device') as { value: string } // prettier-ignore
    const typePrinter = await store.get('tauri_formulation_type_printer') as { value: string } // prettier-ignore
    const contentPrint = await body;

    const bodyRequest = {
      name: printerName.value,
      data: contentPrint,
      type: typePrinter.value,
    };

    const response = await API.publicProcedure({
      url: `${urlPrint.value}/printer/print`,
      data: bodyRequest,
      method: 'POST',
    });

    return response?.data;
  } catch (error) {
    console.log(error);
  }
}

export async function approveRejectReportLineAction({
  reportLineId,
  approvalStatus,
}: {
  reportLineId: string;
  approvalStatus: boolean;
}) {
  try {
    const response = await API.protectedProcedure({
      url: `/formulation-reports/approval/${reportLineId}`,
      method: 'PUT',
      data: {
        approval: approvalStatus,
      },
    });

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}
