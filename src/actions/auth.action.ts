import API from '~/lib/config/api';

import { getErrorMessage } from '~/lib/helpers';

interface IAuthParams {
  username: string;
  password: string;
}

type LoginAction = {
  token: string;
  ExpiredToken: string;
};

export async function generatePingAction() {
  try {
    const res = await API.publicProcedure({
      url: '/ping',
    });
    if (res.status == 200) return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function loginAction({
  username,
  password,
}: IAuthParams): Promise<LoginAction | undefined> {
  try {
    const res = await API.publicProcedure({
      // url: `${VITE_REACT_SERVER_URL}${VITE_PORT}/login`,
      url: '/login',
      method: 'POST',
      data: {
        username: username,
        password: password,
        device_name: 'web',
      },
    });

    if (res) {
      return res.data.data;
    }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAllUsersAction() {
  try {
    const res = await API.publicProcedure({
      url: '/userList',
    });
    if (res.status == 200) return res.data;
  } catch (error) {
    console.log(error);
  }
}
