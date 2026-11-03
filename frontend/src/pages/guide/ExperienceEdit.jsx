import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import ExperienceForm from '../../components/ExperienceForm';
import { updateExperience } from '../../api/experiences';
import api from '../../api/axios';

export default function ExperienceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/experiences/${id}`)
      .then((res) => setInitial(res.data.data))
      .catch((err) => {
        setError('Experience not found or you do not have permission to edit it.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Edit Experience">
        <div className="text-center py-5 text-muted-2">Loading experience details...</div>
      </DashboardLayout>
    );
  }

  if (error || !initial) {
    return (
      <DashboardLayout title="Edit Experience">
        <div className="alert alert-danger">{error || 'Experience not found.'}</div>
        <button className="btn btn-outline-navy" onClick={() => navigate('/guide/experiences')}>
          Back to Experiences
        </button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Edit Experience" 
      subtitle={initial.title}
    >
      <ExperienceForm
        initial={initial}
        onSubmit={(fd) => updateExperience(id, fd)}
        submitLabel="Save Changes"
      />
    </DashboardLayout>
  );
}