import moment from 'moment';
import { Store } from 'tauri-plugin-store-api';
import { IFormulationReportsLines } from './types/responses';

export const parseDataPrint = async (
  response: any,
  selectedItemId: string,
  operator: any,
): Promise<string> => {
  const store = new Store('.settings.dat');
  console.log('data to print', response);

  let line = response.FormulationReportLines.filter((item: IFormulationReportsLines) => item.id == selectedItemId); // prettier-ignore
  line = line[0];
  let logger = line.FormulationReportWeighingLoggers; // without filtering, this should be changed in the further
  logger[0];

  const templateData = (await store.get('tauri_printing_template')) as { value: string }; // prettier-ignore
  // console.log('template data', templateData.value);

  let template = templateData.value;

  // Function to get judgement status
  const getJudgementStatus = (status: number) => {
    switch (status) {
      case 0:
        return 'OK';
      case 1:
        return 'HIGJ';
      case -1:
        return 'LOW';
      default:
        return 'GOOD';
    }
  };

  // @ts-ignore
  const mostRecentLoggerDate = logger.sort((a: any, b: any) => new Date(b.createdAt) as any - new Date(a.createdAt) as any); // prettier-ignore

  // Replace top-level keys
  template = template.replace('{{id}}', response.id);
  template = template.replace(
    '{{formulationCode}}',
    response.formulationCode,
  );
  template = template.replace(
    '{{formulationName}}',
    response.formulationName,
  );
  template = template.replace(
    '{{formulationMass}}',
    Number(response.formulationMass).toFixed(3),
  );
  template = template.replace(
    '{{totalIngredient}}',
    response.totalIngredient,
  );
  template = template.replace(
    '{{requestedMass}}',
    Number(response.requestedMass).toFixed(3),
  );
  template = template.replace(
    '{{actualMass}}',
    Number(response.actualMass).toFixed(3),
  );
  template = template.replace(
    '{{multiplier}}',
    response.multiplier,
  );
  template = template.replace(
    '{{orderNumber}}',
    response.orderNumber,
  );
  template = template.replace(
    '{{batchNumber}}',
    response.batchNumber,
  );
  template = template.replace(
    '{{status}}',
    response.status,
  );
  template = template.replace(
    '{{mustFollowOrder}}',
    response.mustFollowOrder,
  );
  template = template.replace(
    '{{needApproval}}',
    response.needApproval,
  );
  template = template.replace(
    '{{approvalStatus}}',
    response.approvalStatus,
  );
  template = template.replace(
    '{{createdAt}}',
    moment(response.createdAt).format(
      'DD/MM/YYYY HH:mm:ss',
    ),
  );
  template = template.replace(
    '{{updatedAt}}',
    moment(response.updatedAt).format(
      'DD/MM/YYYY HH:mm:ss',
    ),
  );

  // Replace nested line
  template = template.replace('{{line.id}}', line.id);
  template = template.replace(
    '{{line.FormulationReportHeaderId}}',
    line.FormulationReportHeaderId,
  );
  template = template.replace(
    '{{line.productCode}}',
    line.productCode,
  );
  template = template.replace(
    '{{line.productName}}',
    line.productName,
  );
  template = template.replace(
    '{{line.targetMass}}',
    Number(line.targetMass).toFixed(3),
  );
  template = template.replace(
    '{{line.actualMass}}',
    Number(line.actualMass).toFixed(3),
  );
  template = template.replace('{{line.unit}}', line.unit);
  template = template.replace('{{line.min}}', line.min);
  template = template.replace('{{line.max}}', line.max);
  template = template.replace(
    '{{line.judgement}}',
    getJudgementStatus(line.judgement),
  );
  template = template.replace(
    '{{line.status}}',
    line.status,
  );
  template = template.replace(
    '{{line.needApproval}}',
    line.needApproval,
  );
  template = template.replace(
    '{{line.approvalStatus}}',
    line.approvalStatus,
  );
  template = template.replace(
    '{{line.createdAt}}',
    moment(line.createdAt).format('DD/MM/YYYY HH:mm:ss'),
  );
  template = template.replace(
    '{{line.updatedAt}}',
    moment(line.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
  );

  // Replace nested logger
  template = template.replace('{{logger.id}}', logger.id);
  template = template.replace(
    '{{logger.formulationReportLinesId}}',
    logger.formulationReportLinesId,
  );
  template = template.replace(
    '{{logger.mass}}',
    Number(logger.mass).toFixed(3),
  );
  template = template.replace(
    '{{logger.productBatchNumber}}',
    logger.productBatchNumber,
  );
  template = template.replace(
    '{{logger.createdAt}}',
    moment(logger.createdAt).format('DD/MM/YYYY HH:mm:ss'),
  );
  template = template.replace(
    '{{logger.updatedAt}}',
    moment(logger.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
  );
  template = template.replace(
    '{{logger.dateCreatedAt}}',
    moment(logger.createdAt).format('DD/MM/YYYY'),
  );

  template = template.replace(
    '{{logger.timeCreatedAt}}',
    moment(logger.createdAt).format('HH:mm:ss'),
  );

  template = template.replace(
    '{{lastLogger}}',
    mostRecentLoggerDate[0].mass,
  );

  template = template.replace(
    '{{operator.name}}',
    operator.username,
  );

  // Add current time
  template = template.replace(
    '{{now}}',
    moment().format('DD/MM/YYYY HH:mm:ss'),
  );

  // console.log('from template', template);
  return template;
};
