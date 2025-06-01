import API from '~/lib/config/api';
import { Application } from '~/lib/types/types';

export async function getApplicationWithIPAddress(): Promise<
  Application | undefined
> {
  try {
    const response = await API.protectedProcedure({
      url: `/applications/ip`,
    });
    if (response.status == 200) {
      return response.data.data;
    }
  } catch (error) {
    console.log(error);
  }
}
