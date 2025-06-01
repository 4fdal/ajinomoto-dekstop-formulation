import API from '~/lib/config/api';

export async function getProductWeightBridgesAction() {
  try {
    const response = await API.protectedProcedure({
      url: '/product-weight-bridges',
    });
    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function createProductWeightBridge({
  code,
  name,
  unit_id,
}: {
  code: string;
  name: string;
  unit_id: string;
}): Promise<void | undefined> {
  try {
    const response = await API.protectedProcedure({
      url: '/product-weight-bridges',
      method: 'POST',
      data: {
        code,
        name,
        UnitId: unit_id,
      },
    });

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function editProductWeightBridge(
  data: {
    code: string;
    name: string;
    unit_id: string;
  },
  id: string | null,
) {
  try {
    const response = await API.protectedProcedure({
      url: `/product-weight-bridges/${id}`,
      method: 'PUT',
      data: {
        code: data.code,
        name: data.name,
        UnitId: data.unit_id,
      },
    });

    console.log('response', response);
    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteProductWeightBridge(
  id: string,
) {
  try {
    const response = await API.protectedProcedure({
      url: `/product-weight-bridges/${id}`,
      method: 'DELETE',
    });

    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}
