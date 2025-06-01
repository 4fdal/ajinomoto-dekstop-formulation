import React from 'react';

import { Slash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserDisplayStore } from '~/lib/store/store';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';

interface BreadcrumbsProps {
  currentPathname: string;
  previousPathAliases: string[];
  previousPath: string[];
}

export function Breadcrumbs({
  currentPathname,
  previousPathAliases,
  previousPath,
}: BreadcrumbsProps) {
  const { setIsShowVirtualKeyboard } = useUserDisplayStore(); // prettier-ignore

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link to="/">Home</Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        {previousPathAliases.map((_, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem
              onClick={() =>
                setIsShowVirtualKeyboard(false)
              }
            >
              <Link to={`/${previousPath[index]}`}>
                {previousPathAliases}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
          </React.Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPathname}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
