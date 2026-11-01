const run_Now = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: { name: 'Run Now', notes: 'Starts one prospecting run immediately, without waiting for the schedule.', notesInFlow: true }
});

const start_Daily_Run = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.4,
  config: { name: 'Start Daily Run', parameters: { source: 'database', workflowId: { __rl: true, mode: 'id', value: '0mULXgYqvjUttb7R', cachedResultName: 'Prospection Daily Run' }, mode: 'once', options: { waitForSubWorkflow: true } }, position: [220, 0], notes: 'Runs Prospection Daily Run through its Called By Run Now trigger.', notesInFlow: true }
});

const wf = workflow('xy6zcXscmVkmrCX2', 'Prospection Run Now', { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: true, description: 'Starts one prospecting run of Prospection Daily Run on demand.' });

export default wf
  .add(run_Now)
  .to(start_Daily_Run)