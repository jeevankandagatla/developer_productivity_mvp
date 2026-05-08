const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

// Load Excel data
const excelPath = path.resolve(__dirname, '../../intern_assignment_developer_productivity_packet_v4/intern_assignment_support_pack_dev_only_v3.xlsx');
let workbook;
try {
    workbook = xlsx.readFile(excelPath);
} catch (e) {
    console.error("Failed to read excel file:", e);
}

let developers = [];
let jiraIssues = [];
let pullRequests = [];
let ciDeployments = [];
let bugReports = [];

if (workbook) {
    developers = xlsx.utils.sheet_to_json(workbook.Sheets['Dim_Developers']);
    jiraIssues = xlsx.utils.sheet_to_json(workbook.Sheets['Fact_Jira_Issues']);
    pullRequests = xlsx.utils.sheet_to_json(workbook.Sheets['Fact_Pull_Requests']);
    ciDeployments = xlsx.utils.sheet_to_json(workbook.Sheets['Fact_CI_Deployments']);
    bugReports = xlsx.utils.sheet_to_json(workbook.Sheets['Fact_Bug_Reports']);
}

app.get('/api/developers', (req, res) => {
    res.json(developers);
});

app.get('/api/developers/:id', (req, res) => {
    const dev = developers.find(d => d.developer_id === req.params.id);
    if (!dev) return res.status(404).send('Not Found');
    res.json(dev);
});

app.get('/api/developers/:id/metrics', (req, res) => {
    const devId = req.params.id;
    
    // 1. Lead Time for Changes (Avg time from PR opened to prod deployment)
    const devDeployments = ciDeployments.filter(d => d.developer_id === devId && d.status === 'success' && d.environment === 'prod');
    const leadTimeSum = devDeployments.reduce((sum, d) => sum + (parseFloat(d.lead_time_days) || 0), 0);
    const avgLeadTime = devDeployments.length ? (leadTimeSum / devDeployments.length).toFixed(1) : 0;

    // 2. Cycle Time (Avg time from In Progress to Done)
    const devIssues = jiraIssues.filter(i => i.developer_id === devId && i.status === 'Done');
    const cycleTimeSum = devIssues.reduce((sum, i) => sum + (parseFloat(i.cycle_time_days) || 0), 0);
    const avgCycleTime = devIssues.length ? (cycleTimeSum / devIssues.length).toFixed(1) : 0;

    // 3. Bug Rate (Escaped prod bugs / issues completed)
    const devBugs = bugReports.filter(b => b.developer_id === devId && b.escaped_to_prod === 'Yes');
    const bugRate = devIssues.length ? ((devBugs.length / devIssues.length) * 100).toFixed(1) : 0;

    // 4. Deployment Frequency (Count of successful prod deployments)
    const deploymentFrequency = devDeployments.length;

    // 5. PR Throughput (Count of merged PRs)
    const devPRs = pullRequests.filter(pr => pr.developer_id === devId && pr.status === 'merged');
    const prThroughput = devPRs.length;

    // Strategic Insight and Next Step Logic
    let insights = [];
    let nextSteps = [];

    // Quality check
    if (bugRate > 10) {
        insights.push(`The bug rate of ${bugRate}% indicates that a significant portion of deployments result in escaped bugs. Development speed may be coming at the expense of code quality.`);
        nextSteps.push("Incorporate automated unit testing before creating PRs.");
        nextSteps.push("Request more rigorous code reviews from peers.");
    } else if (bugRate <= 5 && deploymentFrequency > 0) {
        insights.push("Code quality is outstanding, with a very low rate of escaped bugs despite active deployments.");
        nextSteps.push("Consider mentoring peers on best practices for testing and quality assurance.");
    }

    // Velocity & Flow check
    if (avgCycleTime > 5) {
        insights.push(`An average cycle time of ${avgCycleTime} days suggests that tasks are either too large, poorly defined, or frequently blocked.`);
        nextSteps.push("Work with the product owner to break down Jira tickets into smaller chunks.");
        nextSteps.push("Raise blockers earlier in daily standups.");
    } else if (avgCycleTime > 0 && avgCycleTime <= 3) {
        insights.push("Task cycle time is excellent, showing an ability to quickly execute on defined requirements.");
    }

    // Delivery pipeline check
    if (avgLeadTime > 4 && prThroughput > 5) {
        insights.push(`While PR throughput is healthy, the lead time of ${avgLeadTime} days shows a bottleneck between code completion and production deployment.`);
        nextSteps.push("Review the CI/CD pipeline for inefficiencies or long-running steps.");
        nextSteps.push("Ensure PRs are small enough to be reviewed and merged quickly.");
    } else if (deploymentFrequency < 2 && avgCycleTime > 0) {
        insights.push("Deployment frequency is low, which can lead to large, risky releases.");
        nextSteps.push("Adopt a continuous delivery mindset: ship smaller increments more frequently.");
    }

    // High performer / General fallback
    if (insights.length === 0) {
        insights.push("Metrics show a balanced and steady pace of development with acceptable quality standards.");
    }
    
    if (nextSteps.length === 0) {
        if (prThroughput >= 5) {
             nextSteps.push("Share knowledge on efficient development workflows with the team.");
        } else {
             nextSteps.push("Identify opportunities to automate repetitive development tasks.");
             nextSteps.push("Look for pair programming opportunities to increase knowledge sharing.");
        }
    }

    res.json({
        metrics: {
            leadTime: avgLeadTime,
            cycleTime: avgCycleTime,
            bugRate: bugRate,
            deploymentFrequency: deploymentFrequency,
            prThroughput: prThroughput
        },
        insights,
        nextSteps
    });
});

app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
});
