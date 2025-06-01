import { WeighingLoggerRequest } from './../lib/types/types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import moment from 'moment';
import API from '~/lib/config/api';
import {
  getErrorMessage,
  getReportOrderStatus,
} from '~/lib/helpers';
import { useFormulationReport } from '~/lib/store/store';
import { Store } from 'tauri-plugin-store-api';
import { FormulationReportLine } from '~/lib/types/types';
const store = new Store('.settings.dat');

export async function getReportFormulationLines(): Promise<
  | {
      count: number;
      rows: FormulationReportLine[];
    }
  | undefined
> {
  try {
    const res = await API.protectedProcedure({
      url: '/formulation-report-lines',
    });

    if (res.status == 200) {
      return res.data;
    }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateReportFormulationLines(
  reportLineId: string,
  weightlLogReq: WeighingLoggerRequest,
): Promise<any> {
  try {
    const res = await API.protectedProcedure({
      url: '/formulation-report/' + reportLineId,
      method: 'PUT',
      data: weightlLogReq,
    });

    if (res.status == 200) {
      return res.data.data;
    }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getOriginalReportFormulations() {
  try {
    const response = await API.protectedProcedure({
      url: '/formulation-reports',
    });

    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getReportFormulations(
  searchTerm: string,
  page: number,
  pageSize: number,
  dateFilter: {
    formatted_from: string;
    formatted_to: string;
  },
  querySearch: {
    formulation_name: null | string;
    formulation_status: null | string;
    work_order: null | string;
  },
  setDownloadUrl: any,
) {
  const today = moment().format('YYYY-MM-DD');
  let url = `/formulation-reports?page=${page}&page_size=${pageSize}&search=${searchTerm}`;
  if (
    dateFilter.formatted_from !== '' &&
    dateFilter.formatted_to !== '' &&
    dateFilter.formatted_from !== today
  ) {
    url += `&start_date=${dateFilter.formatted_from}&end_date=${dateFilter.formatted_to}`;
  }

  if (querySearch.formulation_name !== null) {
    url += `&formulation_name=${querySearch.formulation_name}`;
  }

  if (querySearch.formulation_status !== null) {
    url += `&formulation_status=${querySearch.formulation_status}`;
  }

  if (querySearch.work_order !== null) {
    url += `&work_order=${querySearch.work_order}`;
  }

  try {
    setDownloadUrl(url);
    const response = await API.protectedProcedure({
      url,
    });

    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getReportFormulationModals(
  searchTerm: string,
) {
  const whitelistedProduct = await store.get<{
    value: string;
  }>('tauri_whitelisted_product');
  const today = moment()
    .endOf('day')
    .format('YYYY-MM-DD HH:mm:ss');
  let url = `/formulation-reports?page=1&page_size=999999&exclude_formulation_status=2&also_exclude_formulation_status=3&schedule_end_date=${today}&product_whitelist=${whitelistedProduct?.value}`;

  if (searchTerm) {
    url += `&search=${searchTerm}`;
  }

  try {
    const response = await API.protectedProcedure({
      url,
    });

    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getReportFormulationTableSelectWorkOrder(
  searchTerm: string,
  page: number,
  pageSize: number,
  dateFilter: {
    formatted_from: string;
    formatted_to: string;
  },
  querySearch: {
    formulation_name: null | string;
    formulation_status: null | string;
    work_order: null | string;
  },
) {
  const whitelistedProduct = await store.get<{
    value: string;
  }>('tauri_whitelisted_product');
  console.log('QUERY AND DATE', dateFilter, querySearch);
  const today = moment()
    .endOf('day')
    .format('YYYY-MM-DD HH:mm:ss');
  let url = `/formulation-reports?page=${page}&page_size=${pageSize}&product_whitelist=${whitelistedProduct?.value}`;

  if (
    querySearch.formulation_status !== null &&
    querySearch.formulation_status !== ''
  ) {
    url += `&ignore_line_status=true&formulation_status=${querySearch.formulation_status}`;
  } else {
    url +=
      '&exclude_formulation_status=2&also_exclude_formulation_status=3';
  }

  if (querySearch.formulation_name !== null) {
    url += `&formulation_name=${querySearch.formulation_name}`;
  }

  if (
    dateFilter.formatted_from !== '' &&
    dateFilter.formatted_to !== '' &&
    dateFilter.formatted_from !== today
  ) {
    url += `&start_date=${dateFilter.formatted_from}&end_date=${dateFilter.formatted_to}`;
  } else {
    url += `&schedule_end_date=${today}`;
  }

  if (searchTerm) {
    url += `&search=${searchTerm}`;
  }

  try {
    const response = await API.protectedProcedure({
      url,
    });

    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getReportFormulationById(id: string) {
  try {
    const response = await API.protectedProcedure({
      url: `/formulation-reports/${id}`,
    });

    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function downloadReportFormulation(
  url: string,
) {
  try {
    const fractionalDigit = useFormulationReport.getState().appFractionalDigit; // prettier-ignore
    const response = await API.protectedProcedure({
      url: `/formulation-reports/${url}`,
    });
    const templateFile = await fetch(
      '/template-report.xlsx',
    );
    const arrayBuffer = await templateFile.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
    });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // prettier-ignore

    // Get the response data
    const rows = response.data;
    let newestCreatedAt = moment(rows?.FormulationReportLines[0]?.FormulationReportWeighingLoggers[0]?.createdAt); // prettier-ignore
    let oldestCreatedAt = moment(rows?.FormulationReportLines[0]?.FormulationReportWeighingLoggers[0]?.createdAt) // prettier-ignore

    rows?.FormulationReportLines?.forEach(
      (element: any) => {
        element?.FormulationReportWeighingLoggers?.forEach(
          (logger: any) => {
            if (
              newestCreatedAt > moment(logger.createdAt)
            ) {
              newestCreatedAt = moment(logger.createdAt);
            }

            if (
              oldestCreatedAt < moment(logger.createdAt)
            ) {
              oldestCreatedAt = moment(logger.createdAt);
            }
          },
        );
      },
    );

    const result = moment.duration(
      oldestCreatedAt.diff(newestCreatedAt),
    );
    const hours = Math.floor(result.asHours());
    const minutes = Math.floor(result.minutes());
    const seconds = Math.floor(result.seconds());
    const formattedDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Fill specific cells with data
    worksheet['D3'].v = `: ${response.data.orderNumber}`;
    worksheet['D4'].v = `: ${response.data.formulationCode}`; // prettier-ignore
    worksheet['D5'].v = `: ${response.data.formulationName}`; // prettier-ignore
    worksheet['D6'].v = `: ${response.data.formulationMass}`; // prettier-ignore
    worksheet['D7'].v = `: ${response.data.requestedMass}`; // prettier-ignore
    worksheet['D8'].v = `: ${getReportOrderStatus(response.data.status, response.data.approvalStatus)}`; // prettier-ignore
    worksheet['D9'].v = `: ${moment(newestCreatedAt).format('YYYY-MM-DD HH:mm:ss')}`; // prettier-ignore
    worksheet['D10'].v = `: ${moment(oldestCreatedAt).format('YYYY-MM-DD HH:mm:ss')}`; // prettier-ignore
    worksheet['D11'].v = `: ${formattedDuration}`; // prettier-ignore

    const startRow = 15;
    let currentRow = startRow;

    response.data.FormulationReportLines.forEach(
      (line: any, index: number) => {
        console.log('idx', index);
        const rowNumber = currentRow;

        worksheet[`A${rowNumber}`] = {
          v: line.productCode,
        };
        worksheet[`B${rowNumber}`] = {
          v: line.productName,
        };
        worksheet[`C${rowNumber}`] = { v: line.targetMass };
        worksheet[`D${rowNumber}`] = {
          v: parseFloat(line.actualMass).toFixed(
            fractionalDigit,
          ),
        };
        worksheet[`E${rowNumber}`] = { v: line.unit };

        // Fill FormulationReportWeighingLoggers data
        line.FormulationReportWeighingLoggers.forEach(
          (logger: any, loggerIndex: number) => {
            const loggerRowNumber = currentRow + loggerIndex; // prettier-ignore
            worksheet[`F${loggerRowNumber}`] = {
              v: parseFloat(logger.mass).toFixed(
                fractionalDigit,
              ),
            };
            worksheet[`G${loggerRowNumber}`] = {
              v: line.unit,
            };
            worksheet[`H${loggerRowNumber}`] = {
              v:
                logger.productBatchNumber == ''
                  ? ''
                  : logger.productBatchNumber,
            };
            worksheet[`I${loggerRowNumber}`] = {
              v: moment(logger.createdAt).format(
                'YYYY-MM-DD HH:mm:ss',
              ),
            };
            worksheet[`J${loggerRowNumber}`] = {
              v: logger.operator,
            };
          },
        );

        // Increment the currentRow for the next FormulationReportLines
        // currentRow +=
        //   line.FormulationReportWeighingLoggers.length > 0
        //     ? line.FormulationReportWeighingLoggers.length
        //     : 1; // If no logger entries, move to the next line
        currentRow += Math.max(
          line.FormulationReportWeighingLoggers.length,
          1,
        );
      },
    );

    // Convert the updated workbook to a binary format
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Create a blob and trigger the download
    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    saveAs(
      blob,
      `report_formulation_${rows?.orderNumber}.xlsx`,
    );
  } catch (error) {
    console.log(error);
  }
}
