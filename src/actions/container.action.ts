import API from '~/lib/config/api';
import { Container } from '~/lib/types/types';

export async function getContainerWithName(
  name: string,
): Promise<Container | undefined> {
  try {
    const response = await API.protectedProcedure({
      url: '/container/name/' + name,
      method: 'GET',
    });

    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
