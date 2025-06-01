import API from '~/lib/config/api';

export async function getUnits() {
  try {
    const response = await API.protectedProcedure({
      url: '/units',
    });

    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}
