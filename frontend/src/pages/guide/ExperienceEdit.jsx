import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import ExperienceForm from '../../components/ExperienceForm';
import { updateExperience } from '../../api/experiences';
import api from '../../api/axios';

export default function ExperienceEdit() {
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/experiences/${id}`)
      .then((res) => setInitial(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <DashboardLayout title="Edit Experience"><div className="card p-5 text-center text-muted-2">Loading…</div></DashboardLayout>;
  }

  if (!initial) {
    return <DashboardLayout title="Edit Experience"><div className="alert alert-danger">Experience not found.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Edit Experience" subtitle={initial.title}>
      <ExperienceForm
        initial={initial}
        onSubmit={(fd) => updateExperience(id, fd)}
        submitLabel="Save Changes"
      />
    </DashboardLayout>
  );
}