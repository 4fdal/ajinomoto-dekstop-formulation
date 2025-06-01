import { cn } from '~/lib/utils';
import { toast } from 'sonner';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination';

interface DatasTable {
  count: number;
  rows: any[];
}

export function PaginationTable({
  page,
  datas,
  setPage,
}: {
  page: number;
  datas: any;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const isFirstPage = page === 1;
  const totalPages = Math.ceil(datas?.count / 7) || 0;

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(
      maxVisiblePages / 2,
    );

    let startPage = Math.max(1, page - halfVisiblePages);
    let endPage = Math.min(
      totalPages,
      page + halfVisiblePages,
    );

    if (page <= halfVisiblePages) {
      endPage = Math.min(totalPages, maxVisiblePages);
    } else if (page + halfVisiblePages >= totalPages) {
      startPage = Math.max(
        1,
        totalPages - maxVisiblePages + 1,
      );
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (endPage < totalPages) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    return items;
  };

  return (
    <Pagination className={cn('mb-5 truncate', {})}>
      <PaginationContent>
        <PaginationItem
          className={cn('cursor-pointer', {
            'rounded-md text-gray-400': isFirstPage,
          })}
          onClick={() => {
            if (page === 1) {
              toast.warning(
                "You've reached the first page",
              );
              return;
            }
            setPage((prevPage: number) => prevPage - 1);
          }}
        >
          <PaginationPrevious href="#" />
        </PaginationItem>

        {renderPaginationItems()}

        <PaginationItem
          className={cn('', {
            'rounded-md text-gray-400': page === totalPages,
          })}
          onClick={() => {
            if (page === totalPages) {
              toast.warning(
                "You've reached the end of the page!",
              );
              return;
            }
            setPage((prevPage: number) => prevPage + 1);
          }}
        >
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
