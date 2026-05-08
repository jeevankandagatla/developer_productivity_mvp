import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock,
  CheckCircle2,
  Bug,
  Rocket,
  GitPullRequest,
  Lightbulb,
  ArrowRightCircle
} from 'lucide-react';
import './index.css';

function App() {
  const [developers, setDevelopers] = useState([]);
  const [selectedDevId, setSelectedDevId] = useState('');
  const [devData, setDevData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch developers on mount
    axios.get('http://localhost:3000/api/developers')
      .then(res => {
        setDevelopers(res.data);
        if (res.data.length > 0) {
          setSelectedDevId(res.data[0].developer_id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedDevId) return;

    setLoading(true);
    // Fetch metrics for selected developer
    Promise.all([
      axios.get(`http://localhost:3000/api/developers/${selectedDevId}`),
      axios.get(`http://localhost:3000/api/developers/${selectedDevId}/metrics`)
    ])
      .then(([devRes, metricsRes]) => {
        setDevData(devRes.data);
        setMetrics(metricsRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedDevId]);

  return (
    <div className="app-container">
      <header className="fade-in">
        <h1>Developer Productivity MVP</h1>
        <p className="subtitle">Individual Contributor Insights</p>
      </header>

      {developers.length > 0 && (
        <div className="developer-selector fade-in" style={{ animationDelay: '0.1s' }}>
          <label htmlFor="dev-select">View metrics for:</label>
          <select 
            id="dev-select" 
            value={selectedDevId} 
            onChange={e => setSelectedDevId(e.target.value)}
          >
            {developers.map(dev => (
              <option key={dev.developer_id} value={dev.developer_id}>
                {dev.developer_name} ({dev.level})
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Analyzing metrics...</p>
        </div>
      ) : devData && metrics && (
        <div className="dashboard fade-in" style={{ animationDelay: '0.2s' }}>
          
          <div className="profile-badge glass-panel">
            <div className="avatar">
              {devData.developer_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="profile-info">
              <h2>{devData.developer_name}</h2>
              <p>{devData.service_type} Developer • {devData.team_name} • {devData.level}</p>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card glass-panel">
              <Clock className="metric-icon" />
              <span className="metric-title">Lead Time</span>
              <div>
                <span className="metric-value">{metrics.metrics.leadTime}</span>
                <span className="metric-unit">days</span>
              </div>
            </div>
            
            <div className="metric-card glass-panel">
              <CheckCircle2 className="metric-icon" />
              <span className="metric-title">Cycle Time</span>
              <div>
                <span className="metric-value">{metrics.metrics.cycleTime}</span>
                <span className="metric-unit">days</span>
              </div>
            </div>

            <div className="metric-card glass-panel">
              <Bug className="metric-icon" style={{ color: metrics.metrics.bugRate > 10 ? 'var(--warning-color)' : 'var(--success-color)' }}/>
              <span className="metric-title">Bug Rate</span>
              <div>
                <span className="metric-value">{metrics.metrics.bugRate}</span>
                <span className="metric-unit">%</span>
              </div>
            </div>

            <div className="metric-card glass-panel">
              <Rocket className="metric-icon" />
              <span className="metric-title">Deployments</span>
              <div>
                <span className="metric-value">{metrics.metrics.deploymentFrequency}</span>
                <span className="metric-unit">releases</span>
              </div>
            </div>

            <div className="metric-card glass-panel">
              <GitPullRequest className="metric-icon" />
              <span className="metric-title">PR Throughput</span>
              <div>
                <span className="metric-value">{metrics.metrics.prThroughput}</span>
                <span className="metric-unit">merged</span>
              </div>
            </div>
          </div>

          <div className="insights-actions-grid">
            <div className="glass-panel">
              <h3 className="section-title">
                <Lightbulb className="action-icon" size={20} /> 
                The Story Behind the Metrics
              </h3>
              {metrics.insights.map((insight, idx) => (
                <div key={idx} className="insight-item">
                  <div className="insight-icon">•</div>
                  <p>{insight}</p>
                </div>
              ))}
            </div>

            <div className="glass-panel">
              <h3 className="section-title">
                <ArrowRightCircle className="action-icon" size={20} />
                Recommended Next Steps
              </h3>
              {metrics.nextSteps.map((step, idx) => (
                <div key={idx} className="action-item">
                  <ArrowRightCircle className="action-icon" size={16} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;
