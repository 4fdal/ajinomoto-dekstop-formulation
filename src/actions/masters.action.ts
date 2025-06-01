import API from '~/lib/config/api';

export async function getMasterProductsAction(
  page: number,
  search: string,
) {
  try {
    const response = await API.protectedProcedure({
      url: `/product-weight-bridges?page=${page}&page_size=7&search=${search}`,
    });
    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getMasterUsers() {
  try {
    const response = await API.protectedProcedure({
      url: '/users',
    });
    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getMasterToleranceGrouping(
  searchTerm: string,
) {
  try {
    const response = await API.protectedProcedure({
      url: `/tolerance-groupings?search=${searchTerm}`,
    });
    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getToleranceGroupingById(id: string) {
  try {
    const res = await API.protectedProcedure({
      url: `/tolerance-groupings/${id}`,
    });

    if (res.status == 200) {
      return res.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function uploadFile(file: File, url: string) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await API.protectedProcedure({
      method: 'POST',
      url: url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    return error;
  }
}

export async function getMasterProductByIdAction(
  id: string,
) {
  try {
    const res = await API.protectedProcedure({
      url: `/product-weight-bridges/${id}`,
    });

    if (res.status == 200) {
      return res.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function createMasterUser(
  data: any,
): Promise<any> {
  try {
    const response = await API.protectedProcedure({
      method: 'POST',
      url: '/users',
      data: {
        RoleId: data?.roleId,
        Username: data.username,
        Password: data.password,
        Code: data.username,
      },
    });

    return response;
  } catch (error) {
    console.log(error);
    throw new Error();
  }
}

export async function editMasterUser(
  data: any,
  id: string,
): Promise<any> {
  try {
    const response = await API.protectedProcedure({
      method: 'PUT',
      url: `/users/${id}`,
      data: {
        username: data.username,
        code: data.username,
      },
    });

    return response;
  } catch (error) {
    console.log(error);
    throw new Error();
  }
}

export async function deleteMasterUser(
  id: string,
): Promise<any> {
  try {
    const response = await API.protectedProcedure({
      method: 'DELETE',
      url: `/users/${id}`,
    });

    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getUserRolesAction() {
  try {
    const res = await API.protectedProcedure({
      url: '/roles',
    });

    if (res.status == 200) {
      return res.data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}
