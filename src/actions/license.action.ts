import API from '~/lib/config/api';
import { getErrorMessage } from '~/lib/helpers';

export async function checkLicenseAction() {
  try {
    const res = await API.publicProcedure({
      url: '/license?code=FM',
    });

    if (res.status == 200) {
      return res.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getLicenseClientName() {
  try {
    const res = await API.publicProcedure({
      url: '/license/name',
    });

    if (res.status == 200) {
      return res.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function saveLicenseAction({
  license_key,
}: {
  license_key: string;
}): Promise<any | undefined> {
  try {
    const res = await API.publicProcedure({
      url: '/license?code=FM',
      method: 'POST',
      data: {
        licenseKey: license_key,
      },
    });

    if (res) {
      return res.data;
    }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
