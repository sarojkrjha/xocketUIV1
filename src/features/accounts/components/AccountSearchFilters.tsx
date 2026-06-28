import { Search, SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import type { AccountSearchRequest } from '../types/account';

export type AccountSearchFilterState = Omit<AccountSearchRequest, 'page' | 'pageSize'>;

type AccountSearchFiltersProps = {
  filters: AccountSearchFilterState;
  onChange: (filters: AccountSearchFilterState) => void;
  onSearch: () => void;
  onReset: () => void;
  hasSearched: boolean;
};

function updateText(filters: AccountSearchFilterState, key: keyof AccountSearchFilterState, value: string): AccountSearchFilterState {
  const trimmed = value.trimStart();
  return {
    ...filters,
    [key]: trimmed === '' ? undefined : trimmed
  };
}

export function AccountSearchFilters({
  filters,
  onChange,
  onSearch,
  onReset,
  hasSearched
}: AccountSearchFiltersProps) {
  return (
    <section className="xocket-card placement-toolbar-card account-search-card">
      <div className="account-search-header">
        <div>
          <span className="xocket-pill xocket-pill-primary">Search First</span>
          <h2>Account Search</h2>
          <p>No account data is loaded until the operator searches or explicitly loads the first page.</p>
        </div>
        <SlidersHorizontal size={22} />
      </div>

      <div className="placement-toolbar account-search-toolbar">
        <div className="placement-search-box account-search-main-input">
          <Search size={18} />
          <input
            value={filters.search ?? ''}
            onChange={(event) => onChange(updateText(filters, 'search', event.target.value))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSearch();
              }
            }}
            placeholder="Search account, debtor, client, case number, court, phone, email, or last 4"
          />
        </div>

        <Button onClick={onSearch}>{hasSearched ? 'Search' : 'Search Accounts'}</Button>
        <Button variant="secondary" onClick={onReset}><X size={16} /> Reset</Button>
      </div>

      <div className="account-advanced-grid">
        <label>
          <span>Account #</span>
          <input
            value={filters.accountNumber ?? ''}
            onChange={(event) => onChange(updateText(filters, 'accountNumber', event.target.value))}
            placeholder="Account number"
          />
        </label>

        <label>
          <span>Contact Name</span>
          <input
            value={filters.contactName ?? ''}
            onChange={(event) => onChange(updateText(filters, 'contactName', event.target.value))}
            placeholder="Debtor/contact name"
          />
        </label>

        <label>
          <span>Last 4 SSN</span>
          <input
            value={filters.last4 ?? ''}
            maxLength={4}
            onChange={(event) => onChange(updateText(filters, 'last4', event.target.value.replace(/\D/g, '').slice(0, 4)))}
            placeholder="1234"
          />
        </label>

        <label>
          <span>Phone</span>
          <input
            value={filters.phone ?? ''}
            onChange={(event) => onChange(updateText(filters, 'phone', event.target.value))}
            placeholder="Phone"
          />
        </label>

        <label>
          <span>Email</span>
          <input
            value={filters.email ?? ''}
            onChange={(event) => onChange(updateText(filters, 'email', event.target.value))}
            placeholder="Email"
          />
        </label>

        <label>
          <span>BK Case #</span>
          <input
            value={filters.bankruptcyCaseNumber ?? ''}
            onChange={(event) => onChange(updateText(filters, 'bankruptcyCaseNumber', event.target.value))}
            placeholder="Bankruptcy case number"
          />
        </label>

        <label>
          <span>State</span>
          <input
            value={filters.stateCode ?? ''}
            maxLength={2}
            onChange={(event) => onChange(updateText(filters, 'stateCode', event.target.value.toUpperCase().slice(0, 2)))}
            placeholder="CA"
          />
        </label>

        <label>
          <span>Court</span>
          <input
            value={filters.courtName ?? ''}
            onChange={(event) => onChange(updateText(filters, 'courtName', event.target.value))}
            placeholder="Court name"
          />
        </label>
      </div>
    </section>
  );
}
