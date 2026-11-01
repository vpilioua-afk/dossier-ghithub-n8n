const error_Trigger = trigger({
  type: 'n8n-nodes-base.errorTrigger',
  version: 1,
  config: { name: 'Error Trigger', position: [100, 450], notes: 'Fires when a prospecting workflow that uses this error workflow fails.', notesInFlow: true }
});

const load_Config = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: { name: 'Load Config', parameters: { resource: 'row', operation: 'get', dataTableId: { __rl: true, mode: 'name', value: 'Prospection Config' }, returnAll: false, limit: 1 }, position: [220, 0], notes: 'Reads testEmail, used as the alert recipient.', notesInFlow: true }
});

const send_Alert = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Send Alert', parameters: { resource: 'message', operation: 'send', sendTo: expr('{{ $json.testEmail }}'), subject: expr('[n8n] Echec : {{ $(\'Error Trigger\').first().json.workflow?.name || \'workflow inconnu\' }}'), emailType: 'text', message: expr('Le workflow "{{ $(\'Error Trigger\').first().json.workflow?.name }}" a echoue.\n\nNoeud : {{ $(\'Error Trigger\').first().json.execution?.lastNodeExecuted || \'inconnu\' }}\nErreur : {{ $(\'Error Trigger\').first().json.execution?.error?.message || \'inconnue\' }}\n\nExecution : {{ $(\'Error Trigger\').first().json.execution?.url || \'lien indisponible\' }}'), options: { appendAttribution: false } }, credentials: { gmailOAuth2: newCredential('Gmail account', 'LquVAVB8bNdpx5bk') }, position: [440, 0], webhookId: '74a0c9b5-f84b-409b-a217-223762869b86', notes: 'Emails the failure details and the execution link.', notesInFlow: true, retryOnFail: true, maxTries: 3, waitBetweenTries: 5000 }
});

const wf = workflow('Cw2piYqxhP2s3f05', 'Prospection Error Handler', { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: true, description: 'Error workflow for the prospecting workflows: emails the failure details and execution link to the address in the config.' });

export default wf
  .add(sticky('## Alertes d\'erreur\nAssigne comme *Error workflow* des workflows de prospection. Envoie un email a **testEmail** (config) avec le lien vers l\'execution en echec.\n\nCredential : **Gmail**.', [], { name: 'Sticky Note', color: 2, width: 480, height: 200, position: [0, -260] }))
  .add(error_Trigger)
  .to(load_Config)
  .to(send_Alert)