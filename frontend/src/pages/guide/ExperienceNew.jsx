import DashboardLayout from '../../components/DashboardLayout';
import ExperienceForm from '../../components/ExperienceForm';
import { createExperience } from '../../api/experiences';

export default function ExperienceNew() {
  return (
    <DashboardLayout title="New Experience" subtitle="Create a new service to offer to travelers">
      <ExperienceForm onSubmit={createExperience} submitLabel="Create Experience" />
    </DashboardLayout>
  );
}