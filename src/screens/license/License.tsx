import { FormLicense } from './FormLicense';
import { LicenseNavigationBar } from './LicenseNavigationBar';

export default function License() {
  return (
    <main className="flex h-screen flex-col">
      <LicenseNavigationBar />
      <FormLicense />
    </main>
  );
}
