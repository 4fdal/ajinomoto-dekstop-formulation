import { forwardRef } from 'react';
import moment, { duration } from 'moment';
import { getStatusPrint } from '~/lib/helpers';

const PrintReportPage = forwardRef(
  (
    props: {
      itemContents: any;
      appFractionalDigit: number;
      user: string;
    },
    ref,
  ) => {
    let newestCreatedAt = moment(props.itemContents?.FormulationReportLines[0]?.FormulationReportWeighingLoggers[0]?.createdAt) // prettier-ignore
    let oldestCreatedAt = moment(props.itemContents?.FormulationReportLines[0]?.FormulationReportWeighingLoggers[0]?.createdAt) // prettier-ignore

    props.itemContents?.FormulationReportLines?.forEach(
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

    // @ts-ignore
    const result = moment.duration(
      oldestCreatedAt.diff(newestCreatedAt),
    );
    const hours = Math.floor(result.asHours());
    const minutes = Math.floor(result.minutes());
    const seconds = Math.floor(result.seconds());
    const formattedDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const getOrderStatusReport = () => {
      if (
        (props?.itemContents?.status === 2 &&
          props?.itemContents?.approvalStatus === 1) ||
        (props?.itemContents?.status == 2 &&
          props?.itemContents?.approvalStatus == 0)
      ) {
        return 'Release';
      } else if (
        props?.itemContents?.status === 2 &&
        props?.itemContents?.approvalStatus !== 1
      ) {
        return 'Rejected';
      } else {
        return '-';
      }
    };

    const statusIdentity = getOrderStatusReport();

    let generalUnit;
    const rebuildData =
      props.itemContents?.FormulationReportLines.map(
        (item: any) => {
          generalUnit = item.unit;
          return {
            product: item.productName,
            expDate:
              item.FormulationReportWeighingLoggers?.map(
                (item: any) => item?.productBatchNumber,
              ),
            mass: item.FormulationReportWeighingLoggers?.map(
              (item: any) => item?.mass,
            ),
            qtyTarget: item.targetMass,
            qtyActual: item.actualMass,
            difference: item.actualMass - item.targetMass,
            unit: item.unit,
          };
        },
      );

    const totalQtyTarget = Array.isArray(rebuildData)
      ? rebuildData.reduce((sum: any, currentItem: any) => {
          return sum + currentItem.qtyTarget;
        }, 0)
      : [];

    const totalQtyActual = Array.isArray(rebuildData)
      ? rebuildData.reduce((sum: any, currentItem: any) => {
          return sum + currentItem.qtyActual;
        }, 0)
      : [];

    const totalDifferences = Array.isArray(rebuildData)
      ? rebuildData.reduce((sum: any, currentItem: any) => {
          return sum + currentItem.difference;
        }, 0)
      : [];

    // console.log('rebuild data', rebuildData);

    const totalTarget = totalQtyTarget; // seluruh qty target
    const totalActual = totalQtyActual; // seluruh actual
    const totalDifference = totalDifferences; // seluruh total difference
    // console.log('total target', totalTarget.toFixed());

    const statusPrint: string = getStatusPrint(
      props.itemContents?.status,
    ) as any;

    return (
      // @ts-ignore

      <div className="p-4" ref={ref}>
        <div className="border p-4">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex flex-col">
              <span className="mr-20 block font-bold">
                {props.itemContents?.formulationName}
              </span>
              <span className="mr-20 block font-bold">
                {parseFloat(
                  props.itemContents?.requestedMass,
                ).toFixed(props.appFractionalDigit)}{' '}
                {generalUnit}
              </span>
              <span className="mr-20 block font-bold">
                {props.itemContents?.orderNumber}
              </span>
            </div>

            <div className="flex h-full flex-col">
              <span className="font-bold">
                STATUS: {statusIdentity}
              </span>
              <span className="font-bold">
                USER: {props.user}
              </span>
              <span className="font-bold">
                DURATION: {formattedDuration}
                {/* createdAt paling baru - createdAt paling lama dari FormulationReportWeighingLoggers(ada di dalam report lines) */}
              </span>
              <div className="font-base flex justify-between text-gray-600">
                <span>Start date: </span>

                <span>
                  {moment(newestCreatedAt).format(
                    'YYYY-MM-DD',
                  )}
                </span>
              </div>

              <div className="font-base flex justify-between text-gray-600">
                <span>End date: </span>

                <span>
                  {moment(oldestCreatedAt).format(
                    'YYYY-MM-DD',
                  )}
                </span>
              </div>
            </div>
          </div>

          <table className="min-w-full table-fixed border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2">
                  MATERIAL
                </th>
                <th className="border border-gray-400 p-2">
                  EXP. DATE
                </th>
                <th className="border border-gray-400 p-2">
                  Details
                </th>
                <th className="border border-gray-400 p-2">
                  QTY TARGET
                </th>
                <th className="border border-gray-400 p-2">
                  QTY ACTUAL
                </th>
                <th className="border border-gray-400 p-2">
                  DIFFERENCE
                </th>
              </tr>
            </thead>
            <tbody>
              {rebuildData?.map(
                (item: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-400 p-2">
                      {item.product}
                    </td>
                    <td className="border border-gray-400 p-2">
                      {item?.expDate.map((exp: string) => (
                        <span className="block" key={exp}>
                          {exp}
                        </span>
                      ))}
                    </td>
                    <td className="border border-gray-400 p-2">
                      {item?.mass.map((m: string) => (
                        <span className="block text-right">
                          {parseFloat(m).toFixed(
                            props.appFractionalDigit,
                          )}{' '}
                          {item.unit}
                        </span>
                      ))}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {item.qtyTarget?.toFixed(
                        props.appFractionalDigit,
                      )}{' '}
                      {item.unit}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {item.qtyActual?.toFixed(
                        props.appFractionalDigit,
                      )}{' '}
                      {item.unit}
                    </td>
                    <td className="border border-gray-400 p-2 text-right">
                      {item.difference?.toFixed(
                        props.appFractionalDigit,
                      )}{' '}
                      {item.unit}
                    </td>
                  </tr>
                ),
              )}
              <tr className="border-t-red-200 font-bold">
                <td
                  className="border border-gray-400 p-2 text-right"
                  colSpan={2}
                >
                  TOTAL
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {/* {totalTarget} */}
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {parseFloat(totalTarget).toFixed(
                    props.appFractionalDigit,
                  )}{' '}
                  {generalUnit}
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {parseFloat(totalActual).toFixed(
                    props.appFractionalDigit,
                  )}{' '}
                  {generalUnit}
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {parseFloat(totalDifference).toFixed(
                    props.appFractionalDigit,
                  )}{' '}
                  {generalUnit}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

export default PrintReportPage;
