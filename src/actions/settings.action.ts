import API from '~/lib/config/api';
import { Store } from 'tauri-plugin-store-api';

export async function getScalesAction() {
  const store = new Store('.settings.dat');
  const scaleService = (await store.get(
    'tauri_formulation_scale_url',
  )) as { value: string };

  try {
    const response = await API.publicProcedure({
      url: `${scaleService.value}/scales`,
      method: 'GET',
    });

    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getPrinterAction() {
  const store = new Store('.settings.dat');
  const printerService = (await store.get(
    'tauri_printer_url',
  )) as { value: string };

  try {
    const response = await API.publicProcedure({
      url: `${printerService.value}/printer/device`,
      method: 'GET',
    });

    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
}
