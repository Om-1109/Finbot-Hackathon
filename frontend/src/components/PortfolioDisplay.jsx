import React, { useState } from 'react';
import AllocationPieChart from './AllocationPieChart';

// --- Styles (you can move this to your App.css) ---
const styles = {
  tabButtons: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    marginBottom: '20px',
  },
  tabButton: {
    padding: '10px 20px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    color: '#888',
    borderBottom: '3px solid transparent',
  },
  tabButtonActive: {
    color: '#007bff',
    borderBottom: '3px solid #007bff',
  },
  planTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '15px',
  },
  chartContainer: {
    height: '300px',
    marginBottom: '20px',
  },
  allocationList: {
    listStyle: 'none',
    padding: 0,
  },
  allocationItem: {
    background: '#f9f9f9',
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '600',
  },
  itemAsset: {
    color: '#333',
  },
  itemAmount: {
    color: '#28a745',
  },
  itemRecs: {
    marginTop: '10px',
    paddingLeft: '15px',
    borderLeft: '2px solid #007bff',
  },
  itemRecsTitle: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    color: '#555',
    fontWeight: '700',
  },
  itemRecsText: {
    margin: '0 0 5px 0',
    fontSize: '13px',
    color: '#666',
  },
};
// --- End of Styles ---

// Helper to format currency
const formatCurrency = (num) => `₹${num.toLocaleString('en-IN')}`;

export default function PortfolioDisplay({ portfolioData }) {
  // portfolioData is the full PortfolioResponse object
  const { 
    lump_sum_allocation, 
    monthly_sip_allocation 
  } = portfolioData;

  const [activeTab, setActiveTab] = useState('lump_sum');

  // Check if we have a valid SIP plan to show
  const hasSipPlan = monthly_sip_allocation && monthly_sip_allocation.length > 0;

  // Determine which data to show
  const isLumpSum = activeTab === 'lump_sum';
  const dataToShow = isLumpSum ? lump_sum_allocation : monthly_sip_allocation;
  const title = isLumpSum ? 'Lump Sum Investment Plan' : 'Monthly SIP Plan';
  const currencySuffix = isLumpSum ? '' : '/month';

  return (
    <div style={{ width: '100%' }}>
      <div style={styles.tabButtons}>
        <button
          style={{ ...styles.tabButton, ...(isLumpSum ? styles.tabButtonActive : {}) }}
          onClick={() => setActiveTab('lump_sum')}
        >
          Lump Sum Plan
        </button>
        {hasSipPlan && (
          <button
            style={{ ...styles.tabButton, ...(!isLumpSum ? styles.tabButtonActive : {}) }}
            onClick={() => setActiveTab('monthly_sip')}
          >
            Monthly SIP Plan
          </button>
        )}
      </div>

      <div className="tab-content">
        <h3 style={styles.planTitle}>{title}</h3>
        
        <div style={styles.chartContainer}>
          <AllocationPieChart allocationData={dataToShow} />
        </div>
        
        <ul style={styles.allocationList}>
          {dataToShow.map((item) => (
            <li key={item.asset_class} style={styles.allocationItem}>
              <div style={styles.itemHeader}>
                <span style={styles.itemAsset}>{item.asset_class} ({(item.percentage * 100).toFixed(0)}%)</span>
                <span style={styles.itemAmount}>
                  {formatCurrency(item.amount)}{currencySuffix}
                </span>
              </div>
              <div style={styles.itemRecs}>
                <h5 style={styles.itemRecsTitle}>Top Recommendations:</h5>
                {item.recommendations.map(rec => (
                  <p key={rec.name} style={styles.itemRecsText}>
                    <strong>{rec.name}:</strong> {rec.details}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}