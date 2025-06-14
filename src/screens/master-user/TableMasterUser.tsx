import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { getMasterUsers } from '~/actions/masters.action';
import {
  encodeObjectToBase64,
  getDefaultTauriStore,
} from '~/lib/helpers';
import { FormCreateUser } from './FormCreateUser';
import { Button } from '~/components/ui/button';
import { DialogConfirmDelete } from './DialogConfirmDelete';
import { DialogDetailUser } from './DialogDetailUser';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  FilePlus2,
  FileUp,
  EllipsisVertical,
  Trash2,
  FileMinus,
  Pencil,
} from 'lucide-react';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';

export default function TableMasterUser() {
  const navigate = useNavigate();
  const [
    isEnableClientCreation,
    setIsEnableClientCreation,
  ] = useState<boolean>(false);

  const [searchParams, setSearch] = useSearchParams();
  const isOpenDetail = searchParams.get('is_detail_user') == 'true'; // prettier-ignore
  const isOpenDeleteUser = searchParams.get(
    'is_delete_user',
  );
  const isOpenCreateForm = searchParams.get(
    'is_create_user',
  );

  const isEditUser = searchParams.get('is_edit_user');

  const { data } = useQuery({
    queryKey: ['master_users'],
    queryFn: () => getMasterUsers(),
  });

  const handlePushToEdit = <T,>(obj: T) => {
    const encodedObj = encodeObjectToBase64(obj);
    navigate(`?is_edit_user=true&q=${encodedObj}`);
  };

  const handlePushDetail = <T,>(obj: T) => {
    const encodedObj = encodeObjectToBase64(obj);
    navigate(`?is_detail_user=true&q=${encodedObj}`);
  };

  const handlePushToDelete = (id: string) => {
    navigate(`?is_delete_user=true&id=${id}`);
  };

  useEffect(() => {
    const fetchClientCreationStatus = async () => {
      try {
        const result = await getDefaultTauriStore<{
          value: boolean;
        }>('tauri_enable_client_creation');
        setIsEnableClientCreation(result?.value ?? false); // Default to false if no value found
      } catch (error) {
        console.error(
          'Error fetching client creation status:',
          error,
        );
      }
    };

    fetchClientCreationStatus();
  }, []);

  return (
    <main className="flex h-full flex-col">
      <section className="flex h-full flex-1 flex-col pr-2 pt-3">
        <section className="flex w-full justify-end">
          {isEnableClientCreation && (
            <Button
              onClick={() =>
                navigate('?is_create_user=true')
              }
              className="flex w-[130px] items-center gap-2 bg-blue-500 hover:bg-blue-400"
            >
              <UserPlus size={20} />
              Add New
            </Button>
          )}
        </section>

        <section className="mb-12 mt-3 flex-1 overflow-auto rounded-sm border">
          <Table className="h-full overflow-y-scroll">
            <TableCaption>
              A list of registered users
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  No
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-center">
                  Role
                </TableHead>
                <TableHead className="text-center">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.rows?.map((user: any, idx: number) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {idx + 1}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.code}</TableCell>
                  <TableCell className="text-center">
                    {user.Role.name}
                  </TableCell>
                  <TableCell className="flex cursor-pointer justify-center text-right">
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
                            onClick={() =>
                              handlePushToEdit(user)
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              handlePushDetail(user);
                            }}
                          >
                            <FileMinus className="mr-2 h-4 w-4" />
                            <span>Detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              handlePushToDelete(user.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </section>

      {(isOpenCreateForm || isEditUser) == 'true' && (
        <FormCreateUser />
      )}

      {isOpenDeleteUser && <DialogConfirmDelete />}
      {isOpenDetail && <DialogDetailUser />}
    </main>
  );
}
