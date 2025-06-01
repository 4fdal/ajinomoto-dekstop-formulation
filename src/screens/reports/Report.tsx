import React, { useEffect } from 'react';
import ContainerLayout from '~/components/ContainerLayout';
import PrintReportPage from './PrintReportPage';
import moment from 'moment';

import { useReactToPrint } from 'react-to-print';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';
import { nightSleep } from '~/lib/helpers';
import { Button } from '~/components/ui/button';
import { FilterReportFormulation } from './FilterReportFormulation';
import { DateRangePicker } from '~/components/ui/date-range-picker';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { DialogDetailReport } from './DialogDetailReport';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { useDebounce } from '~/hooks/useDebounceHook';
import { PaginationTable } from '~/components/PaginationTable';
import { InputWithAdornment } from '~/components/ui/input-with-adornment';

import {
  downloadReportFormulation,
  getReportFormulations,
} from '~/actions/reports.action';

import {
  useFormulationReport,
  useUserAuthStore,
  useUserDisplayStore,
} from '~/lib/store/store';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

import {
  Download,
  EllipsisVertical,
  FileMinus,
  Printer,
  Trash2,
  Trash2Icon,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

const Status = ({ no }: { no: number }) => {
  const getStatusReport = () => {
    switch (no) {
      case 0:
        return 'Waiting implementation';
      case 1:
        return 'On Progress';
      case 2:
        return 'Completed';
      case 3:
        return 'Aborted';

      default:
        break;
    }
  };
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center truncate rounded-md px-2 py-1 text-center',
        {
          'bg-gray-200 text-gray-600': no == 0,
          'bg-yellow-200 text-yellow-600': no == 1,
          'bg-green-200 text-green-600': no == 2,
          'bg-red-200 text-red-600': no == 3,
        },
      )}
    >
      {getStatusReport()}
    </div>
  );
};

const OrderStatus = ({
  status,
  approvalStatus,
}: {
  status: number;
  approvalStatus: number;
}) => {
  const getOrderStatusReport = () => {
    if (
      (status === 2 && approvalStatus === 1) ||
      (status == 2 && approvalStatus == 0)
    ) {
      return 'release';
    } else if (status === 2 && approvalStatus !== 1) {
      return 'rejected';
    } else {
      return '-';
    }
  };

  const statusIdentity = getOrderStatusReport();

  return (
    <div
      className={cn(
        'flex w-full items-center justify-center truncate rounded-md px-2 py-1 text-center',
        {
          'bg-green-200 text-green-600':
            statusIdentity === 'release',
          'bg-red-200 text-red-600':
            statusIdentity === 'rejected',
        },
      )}
    >
      {statusIdentity}
    </div>
  );
};

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const componentRef = useRef();
  const currentDate = moment().format('YYYY-MM-DD');

  const handlePrint = useReactToPrint({
    // @ts-ignore
    content: () => componentRef.current,
  });

  const { user } = useUserAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearch] = useSearchParams();
  const [itemContents, setItemContents] = useState(null);
  const [isLoadingPrint, setIsLoadingPrint] = useState(false) // prettier-ignore
  const [dateRange, setDateRange] = useState<any>();
  const [page, setPage] = useState(1);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [querySearch, setQuerySearch] = useState<{
    formulation_name: null | string;
    formulation_status: null | string;
    work_order: null | string;
  }>({
    formulation_name: null,
    formulation_status: null,
    work_order: null,
  });
  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
  } = useUserDisplayStore((state) => state);

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const inputRef = useRef();

  const [formattedDateRange, setFormattedDateRange] =
    useState({
      formatted_from: '',
      formatted_to: '',
    });
  const [initialDateValues, setInitialDateValues] = useState(currentDate); // prettier-ignore

  const { appFractionalDigit } = useFormulationReport();
  const debouncedSearchTerm = useDebounce(searchTerm, 800);
  const isOpenDetailReport = searchParams.get('id_detail'); // prettier-ignore
  const qFormulationName = searchParams.get(
    'formulation_name',
  );
  const qFormulationStatus = searchParams.get(
    'formulation_status',
  );

  const pageSize = 7;
  const { data, refetch } = useQuery({
    queryKey: [
      'formulation-reports',
      page,
      debouncedSearchTerm,
    ],
    queryFn: () =>
      getReportFormulations(
        searchTerm,
        page,
        pageSize,
        formattedDateRange,
        querySearch,
        setDownloadUrl,
      ),
  });

  const clearPreviousInput = () => {
    // @ts-expect-error
    keyboard?.current?.clearInput();
  };

  const updateCaretPosition = (newInput: any) => {
    const newPosition = caretPositionRef.current + (newInput.length - searchTerm.length); // prettier-ignore
    caretPositionRef.current = newPosition < 0 ? 0 : newPosition; // prettier-ignore
  };

  const handleCaretPosition = (event: any) => {
    caretPositionRef.current = event.target.selectionStart;
  };

  const handleRefetchAsync = async () => {
    setFormattedDateRange({
      formatted_from: '',
      formatted_to: '',
    });
    await nightSleep(500);
    refetch();
  };

  const onChange = (newInput: string) => {
    updateCaretPosition(newInput);
    setSearchTerm(newInput);

    // Restore caret position after input value is set
    if (inputRef.current) {
      // @ts-expect-error
      inputRef.current.focus();
      // @ts-expect-error
      inputRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  };

  const handleChangeVirtualKeyboard = (txt: string) => {
    onChange(txt);
  };

  const onChangeInput = (event: any) => {
    const newInput = event.target.value;
    updateCaretPosition(newInput);
    setSearchTerm(newInput);

    // Update caret position based on where the user clicks or types
    caretPositionRef.current = event.target.selectionStart;
    if (keyboard.current) {
      // @ts-expect-error
      keyboard.current.setInput(newInput);
    }
  };

  useEffect(() => {
    const handleSetterFormattedDateRange = () => {
      const formattedFrom = moment(
        dateRange?.range?.from,
      ).format('YYYY-MM-DD');

      const formattedTo = moment(
        dateRange?.range?.to,
      ).format('YYYY-MM-DD');

      setFormattedDateRange({
        formatted_from: formattedFrom,
        formatted_to: formattedTo,
      });
    };

    handleSetterFormattedDateRange();

    return () =>
      setFormattedDateRange({
        formatted_from: '',
        formatted_to: '',
      });
  }, [dateRange]);

  useEffect(() => {
    if (qFormulationName !== null) {
      setQuerySearch((prevState) => ({
        ...prevState,
        formulation_name: qFormulationName,
      }));
    }

    if (qFormulationStatus !== null) {
      setQuerySearch((prevState) => ({
        ...prevState,
        formulation_status: qFormulationStatus,
      }));
    }

    if (
      qFormulationName !== null ||
      qFormulationStatus !== null
    ) {
      handleRefetchAsync();
    }
  }, [qFormulationName, qFormulationStatus]);

  useEffect(() => {
    if (inputRef.current) {
      // @ts-expect-error
      inputRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  }, [searchTerm]);

  return (
    <main className="flex h-full flex-col">
      <ContainerLayout className="h-full pt-[75px]">
        <div
          className={cn('flex h-full w-full flex-col p-3', {
            'cursor-progress': isLoadingPrint,
          })}
        >
          <div className="flex w-full justify-between">
            <InputWithAdornment
              endAdornment={<Trash2Icon color="red" />}
              endAdornmentFn={() => {
                clearPreviousInput();
                setSearchTerm('');
              }}
              type="text"
              placeholder="Search Reports"
              className="w-[500px] focus:border focus:border-blue-500"
              name="searchTerm"
              onChange={onChangeInput}
              onClick={onChangeInput}
              onKeyUp={handleCaretPosition}
              value={searchTerm}
              // @ts-expect-error
              ref={inputRef}
              onFocus={() => setIsShowVirtualKeyboard(true)}
            />

            <div className="flex items-center gap-2">
              <DateRangePicker
                onUpdate={async (values) => {
                  setDateRange(values);
                  await nightSleep(500);
                  refetch();
                }}
                initialDateFrom={initialDateValues}
                initialDateTo={initialDateValues}
                align="start"
                locale="en-GB"
                showCompare={false}
              />
              <FilterReportFormulation
                shouldDirty={qFormulationName !== null}
                refetch={handleRefetchAsync}
                querySearch={querySearch}
                setQuerySearch={setQuerySearch}
                formattedDateRange={formattedDateRange}
                listFormulationNames={(Array.isArray(data)
                  ? data
                  : []
                ).map((item: any) => item.formulationName)}
              />
              {/* <Button
                disabled={data?.rows?.length < 1}
                onClick={handleDownloadReport}
                className={cn(
                  'flex items-center gap-2 bg-blue-500 hover:bg-blue-400',
                )}
              >
                <Download />
                Download Report
              </Button> */}
            </div>
          </div>

          <section className="mb-10 mt-5 flex flex-1 flex-col justify-between overflow-x-auto">
            <Table className="table-auto overflow-scroll">
              <TableCaption>
                {data?.rows?.length == 0
                  ? 'No data can be displayed'
                  : 'A list of your recorded datas'}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    NO
                  </TableHead>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Formulation Name</TableHead>
                  <TableHead>Formulation Code</TableHead>
                  <TableHead className="text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-center">
                    Order Status
                  </TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data?.rows?.map(
                  (item: any, idx: number) => (
                    <React.Fragment key={idx}>
                      <TableRow key={item.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          {item.orderNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.formulationName}
                        </TableCell>
                        <TableCell>
                          {item.formulationCode}
                        </TableCell>
                        <TableCell className="w-[150px]">
                          <Status no={item.status} />
                        </TableCell>
                        <TableCell className="w-[150px]">
                          <OrderStatus
                            status={item.status}
                            approvalStatus={
                              item.approvalStatus
                            }
                          />
                        </TableCell>
                        <TableCell className="cursor-pointer">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <EllipsisVertical />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-20">
                              <DropdownMenuLabel>
                                Menus
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setIsLoadingPrint(true);
                                    setItemContents(item);
                                    setTimeout(() => {
                                      handlePrint();
                                      setIsLoadingPrint(
                                        false,
                                      );
                                    }, 800);
                                  }}
                                >
                                  <Printer className="mr-2 h-4 w-4" />
                                  <span>Print</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(
                                      `?id_detail=${item.id}`,
                                    )
                                  }
                                >
                                  <FileMinus className="mr-2 h-4 w-4" />
                                  <span>Detail</span>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() =>
                                    downloadReportFormulation(
                                      item?.id,
                                    )
                                  }
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Download</span>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ),
                )}
              </TableBody>
            </Table>

            <div
              className={cn('', {
                hidden: data?.rows?.length < 1,
              })}
            >
              <PaginationTable
                datas={data}
                page={page}
                setPage={setPage}
              />
            </div>
          </section>
        </div>
      </ContainerLayout>

      {isOpenDetailReport && (
        <DialogDetailReport back={() => navigate(-1)} />
      )}

      <VirtualKeyboard
        isVisible={isShowVirtualKeyboard}
        onChange={handleChangeVirtualKeyboard}
        // @ts-expect-error
        keyboardRef={keyboard}
      />

      <div className="hidden">
        <PrintReportPage
          // @ts-ignore
          itemContents={itemContents}
          ref={componentRef}
          appFractionalDigit={appFractionalDigit}
          user={user.username as string}
        />
      </div>
    </main>
  );
}
