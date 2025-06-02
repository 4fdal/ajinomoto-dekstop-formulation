import { BarChartHorizontal } from 'lucide-react';
import { ReportLogger } from '~/lib/types/types';
import { Button } from '~/components/ui/button';
import { convertToDate } from '~/lib/helpers';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

export function DialogReportLogger({
  reportLoggers,
}: {
  reportLoggers: ReportLogger[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => console.log(reportLoggers)}
        >
          <BarChartHorizontal className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="min-h-[400px] sm:min-w-[700px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChartHorizontal />
            Report Logger
          </DialogTitle>
          <DialogDescription>
            Your report logger details
          </DialogDescription>
        </DialogHeader>
        <section className="flex h-full w-full justify-between gap-2 overflow-x-auto">
          <Table>
            <TableCaption>
              {reportLoggers.length == 0
                ? "You don't have any report logger yet"
                : 'A list of your report loggers'}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  Mass
                </TableHead>
                <TableHead>Material Batch Number</TableHead>
                <TableHead>
                  User
                </TableHead>
                <TableHead>
                  AppId
                </TableHead>
                <TableHead>
                  Tanggal
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportLoggers.map((item: ReportLogger) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center font-medium">
                    {item.mass?.toFixed(4)}
                  </TableCell>
                  <TableCell>
                    {item.productBatchNumber}
                  </TableCell>
                  <TableCell>
                    {item.operator}
                  </TableCell>
                  <TableCell>
                    {item.appId}
                  </TableCell>
                  <TableCell>
                    {convertToDate(`${item.createdAt}`)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </DialogContent>
    </Dialog>
  );
}
