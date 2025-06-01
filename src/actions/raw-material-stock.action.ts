import API from '~/lib/config/api';
import { RawMaterialStock } from '~/lib/types/types';

export async function getRawMaterialStockWithQRCode(
  qrcode: string,
): Promise<RawMaterialStock | undefined> {
  try {
    const response = await API.protectedProcedure({
      url: `/raw-material-stock/qrcode/${qrcode}`,
    });
    if (response.status == 200) {
      return response.data.data;
    }
  } catch (error) {
    console.log(error);
  }
}
