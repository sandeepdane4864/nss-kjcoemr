import { useEffect, useState } from 'react';
import Form, { buildPayload, initialValues } from '../../components/Form.jsx';
import { Loader } from '../../components/ui.jsx';
import { api } from '../../lib/api.js';
import { useToast } from '../../lib/toast.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { AdminTitle } from './AdminLayout.jsx';

const FIELDS = [
  { name: 'unitName', label: 'Unit name', half: true },
  { name: 'collegeName', label: 'College name', half: true },
  { name: 'motto', label: 'Motto', half: true },
  { name: 'foundedYear', label: 'Unit founded in', type: 'number', half: true },
  { name: 'targetHours', label: 'Service hours required', type: 'number', half: true },
  { name: 'about', label: 'About the unit', type: 'textarea', rows: 6 },
  { name: 'objectives', label: 'Objectives', type: 'lines', rows: 6, help: 'One per line' },
  { name: 'vision', label: 'Vision', type: 'textarea', rows: 3, half: true },
  { name: 'mission', label: 'Mission', type: 'textarea', rows: 3, half: true },
  { name: 'contact.email', label: 'Contact email', half: true },
  { name: 'contact.phone', label: 'Contact phone', half: true },
  { name: 'contact.address', label: 'Address' },
  { name: 'contact.mapUrl', label: 'Google Maps embed URL (optional)' },
  { name: 'socials.instagram', label: 'Instagram URL', half: true },
  { name: 'socials.linkedin', label: 'LinkedIn URL', half: true },
  { name: 'socials.youtube', label: 'YouTube URL', half: true },
  { name: 'socials.facebook', label: 'Facebook URL', half: true },
  { name: 'statsOverride.treesPlanted', label: 'Trees planted (shown on Home)', type: 'number', half: true },
  { name: 'statsOverride.bloodUnits', label: 'Blood units collected', type: 'number', half: true },
  { name: 'statsOverride.villagesAdopted', label: 'Villages adopted', type: 'number', half: true },
  { name: 'statsOverride.beneficiaries', label: 'People reached', type: 'number', half: true },
];

export default function AdminSettings() {
  const toast = useToast();
  const { data, loading } = useFetch('/settings');
  const [v, setV] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) setV(initialValues(FIELDS, data)); }, [data]);
  if (loading || !v) return <Loader />;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put('/settings', buildPayload(FIELDS, v));
      toast.success('Settings saved. Refresh the public pages to see them.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <AdminTitle title="Site settings" />
      <form className="panel form" onSubmit={save}>
        <Form fields={FIELDS} values={v} onChange={setV} />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving' : 'Save settings'}</button>
      </form>
    </>
  );
}
