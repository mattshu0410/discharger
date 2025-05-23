import usePatientStore from '@/stores/patientStore';
import ReactMarkdown from 'react-markdown';

export function DischargeSummary() {
  const editedPatient = usePatientStore(state => state.editedPatient);
  return (
    <div className="p-6 h-full flex flex-col bg-card">
      <div className="text-xl font-semibold mb-4">Discharge Summary</div>
      <div className="text-sm leading-relaxed space-y-2 overflow-y-auto">
        <ReactMarkdown>{editedPatient?.dischargeText}</ReactMarkdown>
      </div>
    </div>
  );
}
