import { REFERENCE_COMPANIES } from '../../data/referenceCompanies';
import { useCompanyStore } from '../../store/useCompanyStore';
import { CompanyCard } from './CompanyCard';

export function ComparisonView() {
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {REFERENCE_COMPANIES.map((c) => (
        <CompanyCard
          key={c.id}
          company={c}
          fidelityRate={fidelityRate}
        />
      ))}
    </div>
  );
}
