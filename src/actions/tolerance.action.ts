import API from '~/lib/config/api';
import { IBodyToleranceGroupings } from '~/lib/types/responses';

export async function getToleranceAction() {
  try {
    const response = await API.protectedProcedure({
      url: '/tolerance-groupings',
    });
    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function createMasterToleranceGrouping(
  data: IBodyToleranceGroupings,
): Promise<any | undefined> {
  try {
    const response = await API.protectedProcedure({
      url: '/tolerance-groupings',
      method: 'POST',
      data,
    });
    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function editMasterToleranceGrouping(
  data: IBodyToleranceGroupings,
  id: string,
): Promise<any | undefined> {
  try {
    const response = await API.protectedProcedure({
      url: `/tolerance-groupings/${id}`,
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

export async function deleteMasterToleranceGrouping(
  id: string | null,
): Promise<any | undefined> {
  try {
    const response = await API.protectedProcedure({
      url: `/tolerance-groupings/${id}`,
      method: 'DELETE',
    });

    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}
